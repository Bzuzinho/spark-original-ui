# BSCN Club Management System

Sistema completo de gestão de clube desportivo desenvolvido com Laravel 11 + Inertia.js + React.

## 📋 Sobre o Projeto

Sistema web completo para gestão de clubes desportivos que inclui:

- ✅ **Dashboard** - Visão geral e estatísticas
- ✅ **Gestão de Membros** - Atletas, sócios, staff
- ✅ **Eventos** - Treinos, competições, convocatórias
- ✅ **Módulo Desportivo** - Planeamento de treinos, resultados
- ✅ **Financeiro** - Faturas, mensalidades, movimentos
- ✅ **Loja/Inventário** - Produtos e vendas
- ✅ **Patrocínios** - Gestão de patrocinadores
- ✅ **Marketing** - Campanhas e comunicações
- ✅ **Comunicação** - Sistema de notificações
- ✅ **Configurações** - Personalização do sistema

Migrado de **Spark** (React SPA com key-value storage) para **Laravel 11** com base de dados relacional e arquitetura moderna.

## 🚀 Instalação Rápida

### Pré-requisitos

- PHP >= 8.3
- Composer
- Node.js >= 18
- NPM ou Yarn
- SQLite (dev) ou PostgreSQL (prod)

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/Bzuzinho/spark-original-ui.git
cd spark-original-ui

# 2. Instalar dependências PHP
composer install

# 3. Configurar ambiente
cp .env.example .env
php artisan key:generate

# 4. Configurar base de dados (SQLite para desenvolvimento)
touch database/database.sqlite

# 5. Executar migrações
php artisan migrate --seed

# 6. Criar link simbólico para storage
php artisan storage:link

# 7. Instalar dependências frontend
npm install

# 8. Build do frontend
npm run build

# 9. Iniciar servidor
php artisan serve
```

Acesse em: **http://localhost:8000**

**Credenciais padrão:**
- Email: `admin@test.com`
- Password: `password`

### Dados de Demonstração (Opcional)

Para popular o sistema com dados de exemplo:

```bash
php artisan db:seed --class=DemoSeeder
```

Isso criará:
- 100 membros (75 atletas + 25 sócios/staff)
- 30 eventos (passados e futuros)
- 20 treinos
- 10 patrocinadores
- 15 produtos
- 50 transações financeiras
- Mensalidades e faturas

## 🛠️ Desenvolvimento

### Frontend com HMR

```bash
npm run dev
```

### Executar Testes

```bash
# Todos os testes
php artisan test

# Com cobertura
php artisan test --coverage

# Testes específicos
php artisan test --filter=FullWorkflowTest
```

### Linting

```bash
# PHP (Laravel Pint)
./vendor/bin/pint

# TypeScript/React  
npm run lint
```

## 📚 Documentação

- **[MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)** - Documentação completa da migração
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Documentação de todos os endpoints
- **[DEPLOY.md](DEPLOY.md)** - Guia de deploy para produção
- **[MAPPING.md](MAPPING.md)** - Mapeamento Spark → Laravel

## ✅ Verificação da Instalação

Execute o script de verificação para confirmar que tudo está correto:

```bash
./verify-migration.sh
```

Este script verifica:
- ✅ Versão do PHP
- ✅ Dependências instaladas
- ✅ Migrações executadas
- ✅ Testes passando
- ✅ Build do frontend
- ✅ Rotas configuradas
- ✅ Modelos existentes
- ✅ Páginas React criadas
- ✅ Documentação completa

## 🏗️ Arquitetura

### Backend
- **Framework:** Laravel 11
- **Database:** PostgreSQL (prod) / SQLite (dev)
- **Authentication:** Laravel Breeze + Sanctum
- **API:** RESTful com Inertia.js

### Frontend
- **UI Framework:** React 18 + TypeScript
- **Routing:** Inertia.js
- **Styling:** Tailwind CSS
- **Icons:** Phosphor Icons
- **Components:** Radix UI

### Estrutura

```
├── app/
│   ├── Http/Controllers/    # Controllers
│   ├── Models/              # Eloquent Models (40+)
│   └── Http/Requests/       # Form Requests
├── database/
│   ├── migrations/          # Database migrations
│   └── seeders/             # Seeders
├── resources/js/
│   ├── Pages/              # Inertia Pages
│   └── Components/         # React Components
├── routes/
│   ├── web.php            # Web routes
│   └── api.php            # API routes
└── tests/
    ├── Feature/           # Feature tests
    └── Integration/       # Integration tests
```

## 🚢 Deploy em Produção

Ver **[DEPLOY.md](DEPLOY.md)** para instruções completas de deployment incluindo:
- Configuração de servidor (Ubuntu/Nginx)
- PostgreSQL setup
- SSL/HTTPS com Let's Encrypt
- Queue workers com Supervisor
- Backups automáticos
- Estratégia de deploy

## 📊 Testes

O projeto inclui:
- ✅ Testes unitários
- ✅ Testes de features
- ✅ Testes de integração end-to-end
- ✅ Testes de performance

```bash
# Executar todos os testes
php artisan test

# Testes de integração
php artisan test --testsuite=Feature

# Testes de performance
php artisan test --filter=PerformanceTest
```

## 🤝 Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## ✨ Migração de Spark

Este projeto foi migrado de um template Spark original para Laravel 11. Para detalhes completos sobre a migração:

- **[MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)** - Documentação da migração
- **[MAPPING.md](MAPPING.md)** - Mapeamento de componentes Spark → Laravel

**Spark Template Resources** © GitHub, Inc. - Licenciado sob MIT
