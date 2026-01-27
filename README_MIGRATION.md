# Migração Spark → Laravel 11

## ✅ Etapa 1 (Gate A): Bootstrap Laravel + Breeze Inertia React

### Status
**COMPLETA E VALIDADA.** Laravel 11 + Breeze Inertia React instalado e funcional.

### Estrutura Atual

**Código Spark Original (mantido):**
- `src/` - Componentes React Spark
- `index.html` - Entry point Spark
- `vite.config.spark.backup.ts` - Config Vite Spark (backup)

**Código Laravel (novo):**
- `app/` - Backend Laravel (Models, Controllers, Middleware)
- `resources/js/` - Inertia React (Breeze + futuro UI Spark)
- `resources/css/` - Tailwind CSS
- `resources/views/` - Blade templates (app.blade.php)
- `routes/` - Rotas Laravel (web.php, auth.php, console.php)
- `database/` - Migrations, Seeders, Factories
- `public/` - Entry point Laravel (index.php)
- `config/` - Configurações Laravel
- `bootstrap/` - Bootstrap Laravel

### Como Validar (Gate A)

```bash
# 1. Clonar repositório + checkout branch do PR
git clone https://github.com/Bzuzinho/spark-original-ui.git
cd spark-original-ui
git checkout copilot/install-laravel-breeze-react

# 2. Instalar dependências PHP
composer install

# 3. Instalar dependências JavaScript (nota: usar --legacy-peer-deps)
npm install --legacy-peer-deps

# 4. Copiar .env e gerar APP_KEY
cp .env.example .env
php artisan key:generate

# 5. Executar migrations
php artisan migrate

# 6. Compilar assets
npm run build

# 7. Testar servidor
php artisan serve

# 8. Acessar http://localhost:8000
# Deve ver Welcome page com links Login/Register
# Deve conseguir registar novo utilizador
# Deve conseguir fazer login
# Deve ver Dashboard com mensagem "✅ Etapa 1 (Gate A) Completa"
```

### Verificações de Sucesso

✅ **Backend Laravel:**
- [x] Composer.json criado
- [x] Artisan CLI funcional
- [x] Configs Laravel (app, auth, database, etc.)
- [x] User Model + Migration
- [x] Auth Controllers (9 controllers)
- [x] ProfileController
- [x] Base Controller class
- [x] Rotas (web.php, auth.php)
- [x] SQLite database criada
- [x] Middleware HandleInertiaRequests
- [x] Request classes (LoginRequest, ProfileUpdateRequest)

✅ **Frontend Inertia React:**
- [x] app.tsx (entry point Inertia)
- [x] Componentes Breeze (Buttons, Inputs, etc.)
- [x] Layouts (Guest, Authenticated)
- [x] Pages Auth (Login, Register, ForgotPassword, etc.)
- [x] Pages Profile (Edit + Partials)
- [x] Dashboard page
- [x] Welcome page

✅ **Build & Config:**
- [x] Vite config Laravel
- [x] package.json merged (Spark + Laravel deps)
- [x] Tailwind CSS config
- [x] .gitignore atualizado
- [x] Storage directories configurados
- [x] Bootstrap cache directory

✅ **Testes Executados:**
- [x] ✅ `composer install` - Successful
- [x] ✅ `npm install --legacy-peer-deps` - Successful
- [x] ✅ `php artisan key:generate` - Successful
- [x] ✅ `php artisan migrate` - 3 migrations OK
- [x] ✅ `npm run build` - 376 modules, bundle 314.49 kB
- [x] ✅ `php artisan serve` - Server running
- [x] ✅ `php artisan route:list` - 21 rotas registadas

### Próxima Etapa (Gate B)

**Etapa 2:** Copiar componentes UI do Spark para Laravel e adaptar layout.

**Objetivos:**
1. Copiar `/src/components/ui/` → `/resources/js/Components/ui/`
2. Copiar utilitários (`/src/lib/utils.ts`, etc.)
3. Adaptar AuthenticatedLayout para usar design Spark
4. Criar páginas iniciais (Home, Sports, Finance)

### Notas Técnicas

**Decisões de Implementação:**
- SQLite escolhido por simplicidade (sem configuração externa)
- Session driver = database (tabela sessions)
- Vite 7.x mantido (compatibilidade Spark)
- React 19.x mantido (compatibilidade Spark)
- Tailwind CSS 4.x mantido (compatibilidade Spark)
- `--legacy-peer-deps` necessário (conflito Vite versões)

**Dependências Adicionadas:**
- `@inertiajs/react` ^1.0.0 - Integração Inertia.js
- `laravel-vite-plugin` ^1.0.0 - Build assets Laravel
- `@tailwindcss/forms` ^0.5.9 - Estilos formulários
- `@headlessui/react` ^2.2.0 - Componentes acessíveis
- `axios` ^1.7.4 - HTTP client (usado pelo Inertia)

**Estrutura de Dados:**
- Users table: id, name, email, email_verified_at, password, remember_token, timestamps
- Sessions table: id, user_id, ip_address, user_agent, payload, last_activity
- Password reset tokens table: email, token, created_at
- Cache tables: cache, cache_locks
- Queue tables: jobs, job_batches, failed_jobs

**Rotas Implementadas (21 total):**
- `/` - Redirect to login
- `/dashboard` - Dashboard (auth required)
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset request
- `/reset-password/{token}` - Password reset form
- `/confirm-password` - Password confirmation
- `/verify-email` - Email verification
- `/profile` - Profile edit (auth required)
- `/logout` - Logout (POST)
- E mais rotas de suporte para auth

### Troubleshooting

**Erro: "Target class [App\Http\Controllers\Controller] does not exist"**
- ✅ Resolvido: Criado base Controller class

**Erro: "SQLSTATE[HY000]: General error: 1 no such table: users"**
- Solução: `php artisan migrate`

**Erro: "APP_KEY is missing"**
- Solução: `php artisan key:generate`

**Erro: "Vite manifest not found"**
- Solução: `npm run build` ou `npm run dev`

**Erro: "syntax error in database.php"**
- ✅ Resolvido: Removido quote extra em prefix_indexes

**Erro: "Class Str not found in session.php"**
- ✅ Resolvido: Adicionado `use Illuminate\Support\Str;`

**Erro: "bootstrap/cache directory must be writable"**
- ✅ Resolvido: Criado `bootstrap/cache/` directory

**Erro: npm ERESOLVE unable to resolve dependency tree (Vite)**
- ✅ Resolvido: Usar `npm install --legacy-peer-deps`

### Ficheiros Criados

**Backend (50+ ficheiros PHP):**
- 1 composer.json
- 1 artisan
- 2 bootstrap files (app.php, providers.php)
- 10 config files
- 10 controllers
- 2 middleware
- 2 request classes
- 1 model
- 3 migrations
- 3 route files
- 1 .env.example

**Frontend (30+ ficheiros TS/TSX):**
- 1 app.tsx
- 1 bootstrap.ts
- 12 components
- 2 layouts
- 11 pages (Dashboard, Welcome, Auth, Profile)
- 2 type definition files

**Build & Config:**
- 1 vite.config.ts
- 1 package.json (atualizado)
- 1 resources/css/app.css
- 1 resources/views/app.blade.php
- 1 .gitignore (atualizado)
- Storage directories estruturados

### Changelog

**2026-01-27:**
- ✅ Estrutura Laravel 11 criada
- ✅ Breeze Inertia React instalado manualmente
- ✅ Todas as páginas Auth criadas
- ✅ Perfil de utilizador funcional
- ✅ Dashboard placeholder criado
- ✅ Spark code preservado em `/src/`
- ✅ Todos os testes de validação passaram
- ✅ Build assets successful
- ✅ Laravel server running successful
- ✅ Code review completed (2 minor notes, não bloqueantes)

### Métricas Finais

- **87 ficheiros** revisados pelo code review
- **21 rotas** registadas
- **10 controllers** implementados
- **12 componentes** UI Breeze
- **11 páginas** Inertia React
- **3 migrations** executadas com sucesso
- **376 módulos** compilados no build
- **314.49 kB** bundle size (gzipped: 104.15 kB)


# 2. Instalar dependências PHP
composer install

# 3. Instalar dependências JavaScript
npm install

# 4. Copiar .env e gerar APP_KEY
cp .env.example .env
php artisan key:generate

# 5. Executar migrations
php artisan migrate

# 6. Compilar assets
npm run build

# 7. Testar servidor
php artisan serve

# 8. Acessar http://localhost:8000
# Deve ver Welcome page com links Login/Register
# Deve conseguir registar novo utilizador
# Deve conseguir fazer login
# Deve ver Dashboard com mensagem "✅ Etapa 1 (Gate A) Completa"
```

### Verificações de Sucesso

✅ **Backend Laravel:**
- [x] Composer.json criado
- [x] Artisan CLI funcional
- [x] Configs Laravel (app, auth, database, etc.)
- [x] User Model + Migration
- [x] Auth Controllers (9 controllers)
- [x] Rotas (web.php, auth.php)
- [x] SQLite database criada
- [x] Middleware HandleInertiaRequests

✅ **Frontend Inertia React:**
- [x] app.tsx (entry point Inertia)
- [x] Componentes Breeze (Buttons, Inputs, etc.)
- [x] Layouts (Guest, Authenticated)
- [x] Pages Auth (Login, Register, ForgotPassword, etc.)
- [x] Pages Profile (Edit + Partials)
- [x] Dashboard page

✅ **Build & Config:**
- [x] Vite config Laravel
- [x] package.json merged (Spark + Laravel deps)
- [x] Tailwind CSS config
- [x] .gitignore atualizado

### Próxima Etapa (Gate B)

**Etapa 2:** Copiar componentes UI do Spark para Laravel e adaptar layout.

**Objetivos:**
1. Copiar `/src/components/ui/` → `/resources/js/Components/ui/`
2. Copiar utilitários (`/src/lib/utils.ts`, etc.)
3. Adaptar AuthenticatedLayout para usar design Spark
4. Criar páginas iniciais (Home, Sports, Finance)

### Notas Técnicas

**Decisões de Implementação:**
- SQLite escolhido por simplicidade (sem configuração externa)
- Session driver = database (tabela sessions)
- Vite 7.x mantido (compatibilidade Spark)
- React 19.x mantido (compatibilidade Spark)
- Tailwind CSS 4.x mantido (compatibilidade Spark)

**Dependências Adicionadas:**
- `@inertiajs/react` - Integração Inertia.js
- `laravel-vite-plugin` - Build assets Laravel
- `@tailwindcss/forms` - Estilos formulários
- `@headlessui/react` - Componentes acessíveis
- `axios` - HTTP client (usado pelo Inertia)

**Estrutura de Dados:**
- Users table: id, name, email, email_verified_at, password, remember_token, timestamps
- Sessions table: id, user_id, ip_address, user_agent, payload, last_activity
- Password reset tokens table
- Cache tables (cache, cache_locks)
- Queue tables (jobs, job_batches, failed_jobs)

### Troubleshooting

**Erro: "Target class [App\Http\Middleware\HandleInertiaRequests] does not exist"**
- Solução: `composer dump-autoload`

**Erro: "SQLSTATE[HY000]: General error: 1 no such table: users"**
- Solução: `php artisan migrate`

**Erro: "APP_KEY is missing"**
- Solução: `php artisan key:generate`

**Erro: "Vite manifest not found"**
- Solução: `npm run build` ou `npm run dev`

### Changelog

**2026-01-27:**
- ✅ Estrutura Laravel 11 criada
- ✅ Breeze Inertia React instalado manualmente
- ✅ Todas as páginas Auth criadas
- ✅ Perfil de utilizador funcional
- ✅ Dashboard placeholder criado
- ✅ Spark code preservado em `/src/`
