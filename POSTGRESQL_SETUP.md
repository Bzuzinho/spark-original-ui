# Guia de Configuração PostgreSQL para Laravel

Este documento fornece um guia completo para configurar o projeto Laravel com PostgreSQL.

## 📋 O que foi alterado

### 1. Arquivo `.env.example`
- Alterado de `DB_CONNECTION=sqlite` para `DB_CONNECTION=pgsql`
- Adicionadas variáveis de configuração PostgreSQL:
  - `DB_HOST=127.0.0.1`
  - `DB_PORT=5432`
  - `DB_DATABASE=laravel`
  - `DB_USERNAME=postgres`
  - `DB_PASSWORD=`

### 2. Arquivo `config/database.php`
- Alterado o valor padrão de conexão de `sqlite` para `pgsql`
- A configuração PostgreSQL já estava presente no arquivo

### 3. README.md
- Atualizado com instruções completas de setup PostgreSQL
- Adicionadas informações sobre a stack tecnológica
- Incluídos comandos úteis para gerenciar PostgreSQL

## 🔧 Passos para Configuração Completa

### 1. Instalar PostgreSQL

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Windows
Baixe e instale do site oficial: https://www.postgresql.org/download/windows/

### 2. Configurar PostgreSQL

```bash
# Entrar no PostgreSQL como usuário postgres
sudo -u postgres psql

# Dentro do psql, criar banco de dados
CREATE DATABASE laravel;

# Criar usuário (opcional, se não quiser usar o usuário postgres)
CREATE USER laravel_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE laravel TO laravel_user;

# Sair
\q
```

### 3. Instalar Dependências do Projeto

```bash
# Instalar dependências PHP
composer install

# Instalar dependências Node.js
npm install
```

### 4. Configurar Variáveis de Ambiente

```bash
# Se ainda não existe, copiar o arquivo .env.example
cp .env.example .env

# Editar o arquivo .env e configurar:
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=postgres  # ou o usuário que você criou
DB_PASSWORD=sua_senha_aqui
```

### 5. Gerar Chave da Aplicação

```bash
php artisan key:generate
```

### 6. Executar Migrações

```bash
# Verificar status das migrações
php artisan migrate:status

# Executar migrações
php artisan migrate

# Se precisar resetar o banco de dados
php artisan migrate:fresh

# Se precisar popular com dados de teste
php artisan db:seed
```

## 🧪 Verificando a Conexão

### Via Laravel Tinker
```bash
php artisan tinker

# Dentro do tinker, executar:
DB::connection()->getPdo();
# Deve retornar informações da conexão PDO

# Verificar tabelas
DB::select('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\'');
```

### Via SQL Direto
```bash
php artisan db:show
```

## 🔍 Troubleshooting

### Erro: "SQLSTATE[08006] Connection refused"
- Verifique se o PostgreSQL está rodando: `sudo systemctl status postgresql`
- Verifique as credenciais no arquivo `.env`
- Verifique se o host e porta estão corretos

### Erro: "SQLSTATE[08006] password authentication failed"
- Verifique o usuário e senha no arquivo `.env`
- Pode ser necessário editar o arquivo `pg_hba.conf` do PostgreSQL

### Erro: "database does not exist"
- Crie o banco de dados: `psql -U postgres -c "CREATE DATABASE laravel;"`

### Ver logs do PostgreSQL
```bash
# Ubuntu/Debian
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# macOS (Homebrew)
tail -f /usr/local/var/log/postgresql@14.log
```

## 📊 Migrações Incluídas

O projeto já inclui as seguintes migrações:

1. `create_users_table` - Tabela de usuários
2. `create_cache_table` - Tabela de cache
3. `create_jobs_table` - Tabela de jobs/filas
4. `add_spark_fields_to_users_table` - Campos adicionais para usuários
5. `create_age_groups_table` - Tabela de faixas etárias
6. `create_user_types_table` - Tabela de tipos de usuário
7. `create_club_settings_table` - Tabela de configurações do clube
8. `create_cost_centers_table` - Tabela de centros de custo
9. `create_event_types_table` - Tabela de tipos de evento
10. `create_personal_access_tokens_table` - Tabela de tokens de acesso

## 🛠️ Comandos Úteis PostgreSQL

```bash
# Listar todos os bancos de dados
psql -U postgres -l

# Conectar a um banco específico
psql -U postgres -d laravel

# Dentro do psql:

# Listar todas as tabelas
\dt

# Descrever estrutura de uma tabela
\d nome_da_tabela

# Ver todos os usuários
\du

# Executar SQL
SELECT * FROM users;

# Sair do psql
\q
```

## 🔐 Segurança

1. **Nunca commite o arquivo `.env`** com credenciais reais
2. Use senhas fortes para o usuário do PostgreSQL
3. Em produção, configure SSL para conexões ao banco de dados
4. Restrinja o acesso ao PostgreSQL apenas aos IPs necessários
5. Mantenha o PostgreSQL atualizado com patches de segurança

## 📚 Recursos Adicionais

- [Documentação Laravel Database](https://laravel.com/docs/11.x/database)
- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [Laravel Migrations](https://laravel.com/docs/11.x/migrations)
- [Laravel Eloquent ORM](https://laravel.com/docs/11.x/eloquent)
