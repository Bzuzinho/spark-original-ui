# Migração Spark → Laravel 11

## ✅ Etapa 1 (Gate A): Bootstrap Laravel + Breeze Inertia React

### Status
**Completa.** Laravel 11 + Breeze Inertia React instalado e funcional.

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
git checkout <branch-name>

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
