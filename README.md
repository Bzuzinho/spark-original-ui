# BSCN Gestão - Laravel 11 + Inertia React + PostgreSQL

Um sistema de gestão de clube desenvolvido com Laravel 11, Inertia.js e React, utilizando PostgreSQL como banco de dados.

## 🚀 Stack Tecnológico

- **Backend**: Laravel 11 (PHP 8.3)
- **Frontend**: React 19 + Inertia.js
- **Database**: PostgreSQL
- **UI**: Tailwind CSS + Radix UI
- **Build**: Vite

## 📋 Pré-requisitos

- PHP 8.3 ou superior
- Composer
- Node.js 18+ e npm
- PostgreSQL 14+

## 🔧 Instalação

### 1. Clone o repositório e instale as dependências

```bash
# Instalar dependências PHP
composer install

# Instalar dependências Node.js
npm install
```

### 2. Configurar o Banco de Dados PostgreSQL

#### Criar o banco de dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco de dados
CREATE DATABASE laravel;

# Sair do psql
\q
```

### 3. Configurar variáveis de ambiente

```bash
# Copiar o arquivo de exemplo (já feito se o .env existe)
cp .env.example .env
```

Edite o arquivo `.env` e configure as credenciais do PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_aqui
```

### 4. Gerar chave da aplicação

```bash
php artisan key:generate
```

### 5. Executar as migrações

```bash
php artisan migrate
```

## 🏃 Executando a Aplicação

### Desenvolvimento

```bash
# Terminal 1 - Servidor Laravel
php artisan serve

# Terminal 2 - Build assets (Vite)
npm run dev
```

Acesse: `http://localhost:8000`

### Build para Produção

```bash
npm run build
```

## 📦 Estrutura do Projeto

```
├── app/                # Código PHP (Controllers, Models, etc)
├── resources/
│   ├── js/            # Código React/TypeScript
│   ├── views/         # Views Inertia
│   └── css/           # Estilos CSS
├── database/
│   └── migrations/    # Migrações do banco de dados
├── routes/            # Rotas da aplicação
└── config/            # Arquivos de configuração
```

## 🗄️ Informações do Banco de Dados

Este projeto está configurado para usar **PostgreSQL** como banco de dados principal.

### Configuração PostgreSQL no config/database.php

```php
'pgsql' => [
    'driver' => 'pgsql',
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'postgres'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => env('DB_CHARSET', 'utf8'),
    'prefix' => '',
    'schema' => 'public',
    'sslmode' => env('DB_SSLMODE', 'prefer'),
],
```

### Comandos Úteis PostgreSQL

```bash
# Listar bancos de dados
psql -U postgres -l

# Conectar ao banco
psql -U postgres -d laravel

# Ver tabelas
\dt

# Descrever tabela
\d nome_da_tabela
```

## 🔒 Segurança

- Nunca commite o arquivo `.env` com credenciais reais
- Use senhas fortes para o usuário PostgreSQL
- Configure SSL para conexões PostgreSQL em produção

## 📄 Licença

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
