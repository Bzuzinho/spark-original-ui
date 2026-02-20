#!/usr/bin/env bash
set -euo pipefail

# ===== Config =====
VM_USER="${VM_USER:-ubuntu}"
VM_HOST="${VM_HOST:-129.159.13.211}"
VM_APP_DIR="${VM_APP_DIR:-/var/www/clubmanager}"
REMOTE_BACKEND_DEPLOY="${REMOTE_BACKEND_DEPLOY:-clubmanager-deploy-backend.sh}"
REMOTE_FRONTEND_RELOAD="${REMOTE_FRONTEND_RELOAD:-clubmanager-frontend-reload.sh}"
REMOTE_HEALTHCHECK="${REMOTE_HEALTHCHECK:-clubmanager-healthcheck.sh}"

echo "==> Repo: $(pwd)"
echo "==> VM:   ${VM_USER}@${VM_HOST}:${VM_APP_DIR}"

# ===== Guardrails =====
if [[ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]]; then
  echo "❌ Tens de estar na branch main."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "❌ Tens alterações por commitar. Faz commit antes do deploy."
  echo "   (git status para veres o que falta)"
  exit 1
fi

# ===== 1) Frontend build FIRST (se falhar, não estraga produção) =====
echo "==> [1/6] npm ci"
npm ci

echo "==> [2/6] npm run build"
npm run build

if [[ ! -f "public/build/manifest.json" ]]; then
  echo "❌ Build não gerou public/build/manifest.json"
  exit 1
fi

# ===== 2) Push main =====
echo "==> [3/6] git push origin main"
git push origin main

# ===== 3) Backend deploy na VM (pull + composer + migrate + cache + reload) =====
echo "==> [4/6] Deploy backend na VM"
ssh -o BatchMode=yes -o ConnectTimeout=10 "${VM_USER}@${VM_HOST}" \
  "cd '${VM_APP_DIR}' && ${REMOTE_BACKEND_DEPLOY}"

# ===== 4) Upload do build =====
echo "==> [5/6] Upload public/build -> VM"
scp -r public/build "${VM_USER}@${VM_HOST}:${VM_APP_DIR}/public/"

# ===== 5) Reload frontend + healthcheck =====
echo "==> [6/6] Reload frontend + healthcheck"
ssh -o BatchMode=yes -o ConnectTimeout=10 "${VM_USER}@${VM_HOST}" \
  "cd '${VM_APP_DIR}' && ${REMOTE_FRONTEND_RELOAD} && ${REMOTE_HEALTHCHECK}"

echo "✅ Deploy completo OK."
echo "🌍 Abre: http://${VM_HOST}"
