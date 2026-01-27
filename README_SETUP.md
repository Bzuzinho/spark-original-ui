# 🚀 BSCN Laravel - Setup & Validation

## ✅ ONE-COMMAND SETUP

```bash
composer install && npm install && php artisan app:setup
```

**O que faz:**
1. Cria estrutura `storage/` completa
2. Gera `APP_KEY`
3. Cria `database.sqlite`
4. Roda migrations (users, sessions, cache)
5. Compila assets React (`npm run build`)
6. Limpa caches

## 🧪 VALIDAÇÃO (Gate A)

### 1. Iniciar Servidor
```bash
php artisan serve
```

### 2. Abrir Browser
- **Codespace:** Porta 8000 (forwarded automaticamente)
- **Local:** http://localhost:8000

### 3. Verificar
✅ Página login Breeze aparece (React)  
✅ Campos: Email, Password  
✅ Link "Register"  
✅ Console browser LIMPO (F12 → sem erros)  
✅ Assets carregam (`public/build/manifest.json` existe)

## 🆘 SE FALHAR

### Erro: "Please provide a valid cache path"
```bash
php artisan app:setup --force
```

### Erro: Assets não carregam
```bash
npm run build
php artisan config:clear
```

### Erro: Database locked
```bash
rm database/database.sqlite
php artisan app:setup --force
```

## 📊 ESTRUTURA CRIADA

```
Laravel 11 + Breeze Inertia React
├── Backend
│   ├── ✅ Auth completo (Login, Register, Password Reset)
│   ├── ✅ Profile management
│   ├── ✅ SQLite database
│   └── ✅ Migrations (users, sessions, cache)
├── Frontend
│   ├── ✅ Inertia React pages
│   ├── ✅ Breeze components
│   ├── ✅ Tailwind v4
│   └── ✅ TypeScript
└── Assets
    └── ✅ Compilados em public/build/
```

## 🎯 PRÓXIMOS PASSOS

Após Gate A validado:
- **Fase 2:** Copiar componentes UI Spark (`src/components/ui/`)
- **Fase 3:** Layout BSCN personalizado (sidebar + logo)
- **Fase 4:** Schema users completo (campos Spark)
- **Fase 5+:** Módulos (Members, Sports, Events, Financial)

## 🐛 DEBUG

```bash
# Ver logs
tail -f storage/logs/laravel.log

# Verificar estrutura storage
ls -la storage/framework/cache/data/

# Ver config cache
php artisan config:show cache

# Limpar TUDO
php artisan optimize:clear
rm -rf bootstrap/cache/*
```

## ✅ CHECKLIST

- [ ] `composer install` → sem erros
- [ ] `npm install` → sem erros
- [ ] `php artisan app:setup` → completa com sucesso
- [ ] `php artisan serve` → inicia sem erros
- [ ] Browser port 8000 → login page aparece
- [ ] Console browser → limpo (F12)
- [ ] `ls public/build/manifest.json` → existe

## 📝 COMANDOS ÚTEIS

```bash
# Rebuild assets
npm run build

# Watch mode (rebuild on changes)
npm run dev

# Clear all Laravel caches
php artisan optimize:clear

# Run migrations
php artisan migrate

# Generate new app key
php artisan key:generate
```

## 🔧 TROUBLESHOOTING

### Vite/Assets Issues
If assets are not loading:
1. Run `npm run build` to rebuild
2. Check `public/build/manifest.json` exists
3. Clear Laravel config: `php artisan config:clear`

### Database Issues
If database errors occur:
1. Delete database: `rm database/database.sqlite`
2. Re-run setup: `php artisan app:setup --force`

### Permission Issues
If storage permission errors:
```bash
chmod -R 775 storage bootstrap/cache
```
