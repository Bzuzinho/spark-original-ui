# 🚀 Guia Rápido de Início

Este guia fornece os comandos essenciais para iniciar o projeto Laravel com PostgreSQL.

## ✅ Pré-requisitos

Execute o script de validação para verificar se tudo está instalado:

```bash
# Tornar o script executável (primeira vez)
chmod +x setup-check.sh

# Executar validação
./setup-check.sh
```

## 🐳 Opção 1: Setup com Docker (Recomendado)

### 1. Iniciar PostgreSQL com Docker

```bash
# Iniciar o container PostgreSQL
docker compose up -d

# Verificar se está rodando
docker compose ps
```

### 2. Configurar ambiente

```bash
# Usar configuração Docker (já configurada com senha 'postgres')
cp .env.docker .env

# Gerar chave da aplicação
php artisan key:generate
```

### 3. Instalar dependências

```bash
# Instalar dependências PHP
composer install

# Instalar dependências Node.js
npm install
```

### 4. Executar migrações

```bash
php artisan migrate
```

### 5. Iniciar aplicação

```bash
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite (em outra janela)
npm run dev
```

**Acesse:** http://localhost:8000

---

## 💻 Opção 2: Setup com PostgreSQL Local

### 1. Criar banco de dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE laravel;

# Sair
\q
```

### 2. Configurar ambiente

```bash
# Copiar exemplo
cp .env.example .env

# Editar .env e configurar sua senha PostgreSQL
nano .env
```

Configure:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_aqui
```

### 3. Instalar dependências e migrar

```bash
# Instalar dependências
composer install
npm install

# Gerar chave
php artisan key:generate

# Migrar
php artisan migrate
```

### 4. Iniciar aplicação

```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

---

## 🔧 Comandos Úteis

### Docker

```bash
# Parar PostgreSQL
docker compose down

# Ver logs
docker compose logs postgres

# Acessar PostgreSQL
docker compose exec postgres psql -U postgres -d laravel

# Reiniciar
docker compose restart
```

### Laravel

```bash
# Limpar cache
php artisan cache:clear
php artisan config:clear

# Recriar banco de dados
php artisan migrate:fresh

# Criar seeder de teste
php artisan db:seed

# Acessar tinker (console interativo)
php artisan tinker
```

### Desenvolvimento

```bash
# Build para produção
npm run build

# Verificar sintaxe PHP
composer run pint

# Executar testes
php artisan test
```

---

## 🐛 Troubleshooting

### Erro de conexão ao banco

```bash
# Verificar se PostgreSQL está rodando
docker compose ps

# Ou para instalação local
sudo systemctl status postgresql

# Verificar credenciais no .env
cat .env | grep DB_
```

### Erro de permissão no Laravel

```bash
# Dar permissão às pastas de cache e logs
chmod -R 775 storage bootstrap/cache
```

### Erro ao instalar dependências

```bash
# Limpar cache do Composer
composer clear-cache

# Reinstalar
rm -rf vendor
composer install
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- [README.md](README.md) - Documentação principal
- [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) - Guia completo de PostgreSQL
- [Laravel Docs](https://laravel.com/docs/11.x)
- [Inertia.js Docs](https://inertiajs.com/)

---

## ✨ Pronto para Começar!

Após seguir os passos acima, você terá:

- ✅ Laravel 11 rodando
- ✅ PostgreSQL configurado
- ✅ Inertia React ativo
- ✅ Vite hot reload funcionando

Bom desenvolvimento! 🎉
