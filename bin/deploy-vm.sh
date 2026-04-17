#!/usr/bin/env bash
# deploy-vm.sh — Deploy Codespace → VM Oracle Ubuntu 22.04
# Usage: npm run deploy:vm
set -euo pipefail

# ===== Config =====
VM_USER="${VM_USER:-ubuntu}"
VM_HOST="${VM_HOST:-clubmanager-vm}"
VM_APP_DIR="${VM_APP_DIR:-/var/www/clubmanager}"
SSH_KEY="${SSH_KEY:-${HOME}/.ssh/id_ed25519}"
SSH_ALIAS="clubmanager-vm"
SSH_CONFIG="${HOME}/.ssh/config"
KNOWN_HOSTS="${HOME}/.ssh/known_hosts"
REMOTE_BACKEND_SCRIPT="/usr/local/bin/clubmanager-deploy-backend.sh"
REMOTE_FRONTEND_SCRIPT="/usr/local/bin/clubmanager-frontend-reload.sh"
REMOTE_HEALTHCHECK_SCRIPT="/usr/local/bin/clubmanager-healthcheck.sh"
SYNC_MAIL_ENV="${SYNC_MAIL_ENV:-0}"
MAIL_MAILER="${MAIL_MAILER:-}"
MAIL_HOST="${MAIL_HOST:-}"
MAIL_PORT="${MAIL_PORT:-}"
MAIL_USERNAME="${MAIL_USERNAME:-}"
MAIL_PASSWORD="${MAIL_PASSWORD:-}"
MAIL_ENCRYPTION="${MAIL_ENCRYPTION:-}"
MAIL_FROM_ADDRESS="${MAIL_FROM_ADDRESS:-}"
MAIL_FROM_NAME="${MAIL_FROM_NAME:-}"
APP_URL="${APP_URL:-}"

echo "==> Repo: $(pwd)"
echo "==> VM:   ${VM_USER}@${VM_HOST}:${VM_APP_DIR}"

# ===== Helper: run ssh via alias (BatchMode, 15s timeout) =====
vm_ssh() {
  ssh -o BatchMode=yes -o ConnectTimeout=15 "${SSH_ALIAS}" "$@"
}

quote_env_value() {
  local value="${1:-}"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "${value}"
}

configure_vm_mail_env() {
  local remote_env_file="${VM_APP_DIR}/.env"

  if [[ "${SYNC_MAIL_ENV}" != "1" ]]; then
    echo "    SMTP sync desligado (usa SYNC_MAIL_ENV=1 para actualizar MAIL_* na VM)"
    return 0
  fi

  if [[ -z "${MAIL_MAILER}" ]]; then
    echo "❌ SYNC_MAIL_ENV=1 mas MAIL_MAILER não foi definido."
    exit 1
  fi

  if [[ "${MAIL_MAILER}" == "smtp" ]]; then
    local required_vars=(MAIL_HOST MAIL_PORT MAIL_USERNAME MAIL_PASSWORD MAIL_ENCRYPTION MAIL_FROM_ADDRESS MAIL_FROM_NAME)
    local missing=()
    local var_name

    for var_name in "${required_vars[@]}"; do
      if [[ -z "${!var_name:-}" ]]; then
        missing+=("${var_name}")
      fi
    done

    if (( ${#missing[@]} > 0 )); then
      echo "❌ Faltam variáveis SMTP obrigatórias: ${missing[*]}"
      exit 1
    fi
  fi

  echo ""
  echo "==> [3.5/6] Atualizar configuração de mail na VM"

  vm_ssh "bash -s" <<EOF
set -euo pipefail
ENV_FILE="${remote_env_file}"

if [[ ! -f "\${ENV_FILE}" ]]; then
  echo "[mail] ficheiro .env não encontrado: \${ENV_FILE}"
  exit 1
fi

upsert_env() {
  local key="\$1"
  local value="\$2"
  if grep -q "^\${key}=" "\${ENV_FILE}"; then
    local escaped_value="\${value//\\/\\\\}"
    escaped_value="\${escaped_value//&/\\&}"
    escaped_value="\${escaped_value//|/\\|}"
    sed -i "s|^\${key}=.*|\${key}=\${escaped_value}|" "\${ENV_FILE}"
  else
    printf '\n%s=%s\n' "\${key}" "\${value}" >> "\${ENV_FILE}"
  fi
}

upsert_env MAIL_MAILER $(quote_env_value "${MAIL_MAILER}")
upsert_env MAIL_HOST $(quote_env_value "${MAIL_HOST}")
upsert_env MAIL_PORT $(quote_env_value "${MAIL_PORT}")
upsert_env MAIL_USERNAME $(quote_env_value "${MAIL_USERNAME}")
upsert_env MAIL_PASSWORD $(quote_env_value "${MAIL_PASSWORD}")
upsert_env MAIL_ENCRYPTION $(quote_env_value "${MAIL_ENCRYPTION}")
upsert_env MAIL_FROM_ADDRESS $(quote_env_value "${MAIL_FROM_ADDRESS}")
upsert_env MAIL_FROM_NAME $(quote_env_value "${MAIL_FROM_NAME}")

if [[ -n "${APP_URL}" ]]; then
  upsert_env APP_URL $(quote_env_value "${APP_URL}")
fi

echo "[mail] configuração MAIL_* actualizada"
EOF

  echo "   ✔ Configuração MAIL_* sincronizada para a VM"
}

# ===== Helper: show failure logs from VM =====
show_failure_logs() {
  echo ""
  echo "--- Laravel log (last 80 lines) ---"
  vm_ssh "tail -n 80 ${VM_APP_DIR}/storage/logs/laravel.log 2>/dev/null || true"
  echo ""
  echo "--- Nginx error log (last 40 lines) ---"
  vm_ssh "tail -n 40 /var/log/nginx/error.log 2>/dev/null || true"
}

# ===== [0/6] Pre-flight: repo state =====
echo ""
echo "==> [0/6] Verificar estado do repo"

if [[ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" != "main" ]]; then
  echo "❌ Tens de estar na branch main (actual: $(git rev-parse --abbrev-ref HEAD))."
  exit 1
fi

if ! git config user.email >/dev/null 2>&1 || ! git config user.name >/dev/null 2>&1; then
  echo "❌ Git user.name/user.email não configurados neste repositório."
  echo "   Corre: git config user.name 'Teu Nome' && git config user.email 'teu@email.com'"
  exit 1
fi

echo "   ✔ branch=main, git user configurado"

# ===== [1/6] Build frontend no Codespace =====
echo ""
echo "==> [1/6] Build frontend (Codespace)"
echo "    npm ci ..."
npm ci

echo "    npm run build ..."
npm run build

if [[ ! -f "public/build/manifest.json" ]]; then
  echo "❌ Build não gerou public/build/manifest.json — abortar."
  exit 1
fi
echo "   ✔ Build OK (public/build/manifest.json presente)"

# ===== [2/6] Git sync + commit + push =====
echo ""
echo "==> [2/6] Sincronizar Git (auto-commit + rebase + push)"

if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  AUTO_COMMIT_MSG="${AUTO_COMMIT_MSG:-chore(deploy): auto-commit before vm deploy $(date +%Y-%m-%d_%H-%M-%S)}"
  echo "    Alterações locais detectadas — auto commit"
  git add -A
  if git diff --cached --quiet; then
    echo "    Sem alterações staged após git add -A"
  else
    git commit -m "${AUTO_COMMIT_MSG}"
    echo "   ✔ Auto-commit criado"
  fi
else
  echo "    Working tree limpo — sem auto-commit"
fi

echo "    fetch/rebase com origin/main ..."
git fetch origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
  git pull --rebase origin main
fi

echo "    push origin main ..."
git push origin main
echo "   ✔ Push OK"

# ===== [3/6] Garantir SSH funcional =====
echo ""
echo "==> [3/6] Configurar SSH para a VM"

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"

# 3a) Criar chave ed25519 se não existir
if [[ ! -f "${SSH_KEY}" ]]; then
  echo "    Gerar chave SSH ed25519 (sem passphrase) ..."
  ssh-keygen -t ed25519 -C "codespace-deploy" -N "" -f "${SSH_KEY}"
  echo "   ✔ Chave criada: ${SSH_KEY}"
else
  echo "   ✔ Chave já existe: ${SSH_KEY}"
fi

# 3b) Adicionar host key ao known_hosts (idempotente)
echo "    Actualizar known_hosts via ssh-keyscan ..."
ssh-keyscan -H "${VM_HOST}" >> "${KNOWN_HOSTS}" 2>/dev/null || true
# Deduplicate
sort -u "${KNOWN_HOSTS}" -o "${KNOWN_HOSTS}" 2>/dev/null || true
echo "   ✔ known_hosts actualizado"

# 3c) Criar/actualizar ~/.ssh/config com alias clubmanager-vm
if ! grep -q "Host ${SSH_ALIAS}" "${SSH_CONFIG}" 2>/dev/null; then
  echo "    Adicionar alias '${SSH_ALIAS}' ao ${SSH_CONFIG} ..."
  cat >> "${SSH_CONFIG}" <<SSHCONFIG

# --- Adicionado por deploy-vm.sh ---
Host ${SSH_ALIAS}
  HostName ${VM_HOST}
  User ${VM_USER}
  IdentityFile ${SSH_KEY}
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
  ServerAliveInterval 60
SSHCONFIG
  chmod 600 "${SSH_CONFIG}"
  echo "   ✔ Alias '${SSH_ALIAS}' adicionado ao SSH config"
else
  echo "   ✔ Alias '${SSH_ALIAS}' já existe no SSH config"
fi

# 3d) Instalar chave pública na VM (tenta via ssh; se falhar, mostra instrução manual)
PUB_KEY_CONTENT="$(cat "${SSH_KEY}.pub")"

echo "    Tentar instalar chave pública na VM ..."
if ssh -o BatchMode=yes -o ConnectTimeout=15 \
     -o StrictHostKeyChecking=accept-new \
     -i "${SSH_KEY}" "${VM_USER}@${VM_HOST}" \
     "mkdir -p ~/.ssh && chmod 700 ~/.ssh && \
      grep -qxF '${PUB_KEY_CONTENT}' ~/.ssh/authorized_keys 2>/dev/null || \
      echo '${PUB_KEY_CONTENT}' >> ~/.ssh/authorized_keys && \
      chmod 600 ~/.ssh/authorized_keys && \
      chown -R ${VM_USER}:${VM_USER} ~/.ssh && \
      echo PUBKEY_OK" 2>/dev/null | grep -q "PUBKEY_OK"; then
  echo "   ✔ Chave pública instalada/verificada na VM"
else
  echo "   ⚠ Não foi possível instalar a chave automaticamente."
  echo "     Instala manualmente na VM:"
  echo "       echo '${PUB_KEY_CONTENT}' >> /home/${VM_USER}/.ssh/authorized_keys"
  echo "       chmod 700 /home/${VM_USER}/.ssh && chmod 600 /home/${VM_USER}/.ssh/authorized_keys"
  echo "     Depois corre novamente: npm run deploy:vm"
  exit 1
fi

# 3e) Validar SSH via alias
echo "    Validar SSH com alias '${SSH_ALIAS}' ..."
SSH_TEST="$(vm_ssh 'echo SSH_OK && hostname' 2>&1)" || {
  echo "❌ SSH falhou com alias '${SSH_ALIAS}'."
  echo "   Output: ${SSH_TEST}"
  echo "   Verifica ~/.ssh/config e authorized_keys na VM."
  exit 1
}
echo "   ✔ SSH OK — ${SSH_TEST}"

configure_vm_mail_env

# ===== [4/6] Deploy backend na VM =====
echo ""
echo "==> [4/6] Deploy backend na VM"

# Garantir que os scripts remotos existem; criá-los via heredoc se necessário
vm_ssh "bash -s" <<'ENSURE_SCRIPTS'
set -e

# --- clubmanager-deploy-backend.sh ---
echo "  Atualizar /usr/local/bin/clubmanager-deploy-backend.sh ..."
sudo tee /usr/local/bin/clubmanager-deploy-backend.sh > /dev/null <<'BACKEND'
#!/usr/bin/env bash
set -euo pipefail
APP_DIR="${1:-/var/www/clubmanager}"
APP_USER="${APP_USER:-www-data}"

if ! command -v git >/dev/null 2>&1; then
  echo "[backend] git não encontrado"
  exit 1
fi

if [[ ! -d "${APP_DIR}/.git" ]]; then
  echo "[backend] diretório inválido ou sem .git: ${APP_DIR}"
  exit 1
fi

if id -u "${APP_USER}" >/dev/null 2>&1; then
  RUN_AS=(sudo -u "${APP_USER}" -H)
else
  RUN_AS=()
fi

echo "[backend] sync git (origin/main)"
"${RUN_AS[@]}" git -C "${APP_DIR}" fetch --prune origin main

if [[ -n "$("${RUN_AS[@]}" git -C "${APP_DIR}" status --porcelain)" ]]; then
  TS="$(date +%Y%m%d-%H%M%S)"
  echo "[backend] alterações locais detectadas; criar stash auto-deploy-${TS}"
  "${RUN_AS[@]}" git -C "${APP_DIR}" stash push -u -m "auto-deploy-${TS}" || true
fi

"${RUN_AS[@]}" git -C "${APP_DIR}" checkout main
"${RUN_AS[@]}" git -C "${APP_DIR}" reset --hard origin/main
"${RUN_AS[@]}" git -C "${APP_DIR}" clean -fd

echo "[backend] composer install"
"${RUN_AS[@]}" composer --working-dir="${APP_DIR}" install --no-dev --optimize-autoloader
echo "[backend] migrate"
"${RUN_AS[@]}" php "${APP_DIR}/artisan" migrate --force
echo "[backend] cache"
"${RUN_AS[@]}" php "${APP_DIR}/artisan" config:cache
"${RUN_AS[@]}" php "${APP_DIR}/artisan" route:cache
"${RUN_AS[@]}" php "${APP_DIR}/artisan" view:cache
echo "[backend] reload php-fpm"
sudo systemctl reload php8.3-fpm || sudo service php8.3-fpm reload
echo "[backend] done"
BACKEND
sudo chmod +x /usr/local/bin/clubmanager-deploy-backend.sh

# --- clubmanager-frontend-reload.sh ---
if [[ ! -x /usr/local/bin/clubmanager-frontend-reload.sh ]]; then
  echo "  Criar /usr/local/bin/clubmanager-frontend-reload.sh ..."
  sudo tee /usr/local/bin/clubmanager-frontend-reload.sh > /dev/null <<'FRONTEND'
#!/usr/bin/env bash
set -euo pipefail
echo "[frontend] reload nginx"
sudo systemctl reload nginx || sudo service nginx reload
echo "[frontend] done"
FRONTEND
  sudo chmod +x /usr/local/bin/clubmanager-frontend-reload.sh
fi

# --- clubmanager-healthcheck.sh ---
if [[ ! -x /usr/local/bin/clubmanager-healthcheck.sh ]]; then
  echo "  Criar /usr/local/bin/clubmanager-healthcheck.sh ..."
  sudo tee /usr/local/bin/clubmanager-healthcheck.sh > /dev/null <<'HEALTH'
#!/usr/bin/env bash
set -euo pipefail
HOST="${1:-localhost}"
echo "[healthcheck] curl -Is http://${HOST}/ ..."
RESPONSE="$(curl -Is --max-time 10 "http://${HOST}/" | head -1)"
echo "[healthcheck] ${RESPONSE}"
if echo "${RESPONSE}" | grep -qE "^HTTP/[0-9.]+ (200|301|302|303)"; then
  echo "[healthcheck] OK"
else
  echo "[healthcheck] WARN: resposta inesperada: ${RESPONSE}"
  exit 1
fi
HEALTH
  sudo chmod +x /usr/local/bin/clubmanager-healthcheck.sh
fi

echo "Scripts remotos OK"
ENSURE_SCRIPTS

echo "   ✔ Scripts remotos verificados/criados"

# Correr deploy backend
if ! vm_ssh "/usr/local/bin/clubmanager-deploy-backend.sh '${VM_APP_DIR}'"; then
  echo "❌ Deploy backend falhou."
  show_failure_logs
  exit 1
fi
echo "   ✔ Backend deploy OK"

# ===== [5/6] Copiar public/build para a VM =====
echo ""
echo "==> [5/6] Upload public/build → VM"
tar -C public -cf - build | vm_ssh "sudo mkdir -p '${VM_APP_DIR}/public' && sudo tar -xf - -C '${VM_APP_DIR}/public' && sudo chown -R www-data:www-data '${VM_APP_DIR}/public/build'"
echo "   ✔ public/build copiado"

# ===== [6/6] Reload frontend + healthcheck =====
echo ""
echo "==> [6/6] Reload frontend + healthcheck"

if ! vm_ssh "/usr/local/bin/clubmanager-frontend-reload.sh"; then
  echo "❌ Frontend reload falhou."
  show_failure_logs
  exit 1
fi

if ! vm_ssh "/usr/local/bin/clubmanager-healthcheck.sh"; then
  echo "❌ Healthcheck falhou."
  show_failure_logs
  exit 1
fi

echo ""
echo "✅ Deploy completo OK."
echo "🌍 Abre: http://${VM_HOST}"
