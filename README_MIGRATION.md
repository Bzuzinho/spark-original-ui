# Migração Spark → Laravel

## Status
✅ Etapa 1 (Gate A) completa: Bootstrap Laravel 11 + Breeze Inertia React

## Estrutura Atual

### Código Spark Original (mantido)
- `src/` - Componentes React Spark
- `index.html` - Entry point Spark
- `vite.config.spark.backup.ts` - Config Vite original

### Código Laravel (novo)
- `app/` - Backend Laravel
- `resources/js/` - Inertia React (Breeze)
- `resources/css/` - CSS Laravel
- `routes/` - Rotas Laravel
- `database/` - Migrations/Seeders

## Próximos Passos
- Etapa 2: Copiar componentes UI Spark para `resources/js/Components/`
- Etapa 3: Criar AuthenticatedLayout baseado em `src/components/Layout.tsx`
- Etapa 4: Migrar schema users (adicionar campos Spark)
