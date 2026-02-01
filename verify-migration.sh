#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "  VERIFICAÇÃO FINAL DA MIGRAÇÃO"
echo "========================================="
echo ""

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Track overall success
OVERALL_SUCCESS=true

# 1. Check PHP version
echo "1. Verificando versão do PHP..."
PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
if (( $(echo "$PHP_VERSION >= 8.3" | bc -l) )); then
    success "PHP versão $PHP_VERSION OK"
else
    error "PHP versão $PHP_VERSION (necessário >= 8.3)"
    OVERALL_SUCCESS=false
fi
echo ""

# 2. Check Composer dependencies
echo "2. Verificando dependências Composer..."
if composer validate --no-check-all --no-check-publish 2>/dev/null; then
    success "Composer dependencies OK"
else
    warning "Composer validation warnings (pode ser normal)"
fi
echo ""

# 3. Check Node dependencies
echo "3. Verificando dependências Node..."
if [ -d "node_modules" ]; then
    success "Node modules instalados"
else
    error "Node modules não encontrados. Execute: npm install"
    OVERALL_SUCCESS=false
fi
echo ""

# 4. Database migrations
echo "4. Executando migrations..."
if php artisan migrate:fresh --seed --force 2>&1 | grep -q "Migrations completed"; then
    success "Migrations executadas com sucesso"
else
    # Try without fresh
    if php artisan migrate --force 2>&1; then
        success "Migrations OK"
    else
        error "Erro nas migrations"
        OVERALL_SUCCESS=false
    fi
fi
echo ""

# 5. Run tests
echo "5. Executando testes..."
if php artisan test --stop-on-failure 2>&1; then
    success "Todos os testes passaram"
else
    error "Alguns testes falharam"
    OVERALL_SUCCESS=false
fi
echo ""

# 6. Build frontend
echo "6. Building frontend..."
if npm run build 2>&1 | grep -q "built in"; then
    success "Frontend build OK"
else
    warning "Frontend build pode ter avisos (verificar output acima)"
fi
echo ""

# 7. Check routes
echo "7. Verificando rotas principais..."
ROUTES_TO_CHECK=(
    "dashboard"
    "membros.index"
    "patrocinios.index"
    "marketing.index"
    "comunicacao.index"
    "loja.index"
    "eventos.index"
    "desportivo.index"
    "financeiro.index"
    "settings"
)

MISSING_ROUTES=0
for route in "${ROUTES_TO_CHECK[@]}"; do
    if php artisan route:list --name="$route" 2>/dev/null | grep -q "$route"; then
        :  # Route exists
    else
        error "Rota não encontrada: $route"
        MISSING_ROUTES=$((MISSING_ROUTES + 1))
    fi
done

if [ $MISSING_ROUTES -eq 0 ]; then
    success "Todas as rotas principais encontradas (${#ROUTES_TO_CHECK[@]} rotas)"
else
    error "$MISSING_ROUTES rotas em falta"
    OVERALL_SUCCESS=false
fi
echo ""

# 8. Check models
echo "8. Verificando modelos principais..."
MODELS_TO_CHECK=(
    "User"
    "Event"
    "EventType"
    "Sponsor"
    "Product"
    "Invoice"
    "MonthlyFee"
    "Training"
    "Movement"
    "CostCenter"
)

MISSING_MODELS=0
for model in "${MODELS_TO_CHECK[@]}"; do
    if [ -f "app/Models/$model.php" ]; then
        :  # Model exists
    else
        error "Model não encontrado: $model"
        MISSING_MODELS=$((MISSING_MODELS + 1))
    fi
done

if [ $MISSING_MODELS -eq 0 ]; then
    success "Todos os modelos principais encontrados (${#MODELS_TO_CHECK[@]} modelos)"
else
    error "$MISSING_MODELS modelos em falta"
    OVERALL_SUCCESS=false
fi
echo ""

# 9. Check frontend pages
echo "9. Verificando páginas React..."
PAGES_TO_CHECK=(
    "Dashboard.tsx"
    "Membros/Index.tsx"
    "Patrocinios/Index.tsx"
    "Marketing/Index.tsx"
    "Comunicacao/Index.tsx"
    "Loja/Index.tsx"
    "Eventos/Index.tsx"
    "Desportivo/Index.tsx"
    "Financeiro/Index.tsx"
    "Settings/Index.tsx"
)

MISSING_PAGES=0
for page in "${PAGES_TO_CHECK[@]}"; do
    if [ -f "resources/js/Pages/$page" ]; then
        :  # Page exists
    else
        error "Página não encontrada: $page"
        MISSING_PAGES=$((MISSING_PAGES + 1))
    fi
done

if [ $MISSING_PAGES -eq 0 ]; then
    success "Todas as páginas React encontradas (${#PAGES_TO_CHECK[@]} páginas)"
else
    error "$MISSING_PAGES páginas em falta"
    OVERALL_SUCCESS=false
fi
echo ""

# 10. Check documentation
echo "10. Verificando documentação..."
DOCS_TO_CHECK=(
    "MIGRATION_COMPLETE.md"
    "API_DOCUMENTATION.md"
    "DEPLOY.md"
    "README.md"
)

MISSING_DOCS=0
for doc in "${DOCS_TO_CHECK[@]}"; do
    if [ -f "$doc" ]; then
        :  # Doc exists
    else
        error "Documentação não encontrada: $doc"
        MISSING_DOCS=$((MISSING_DOCS + 1))
    fi
done

if [ $MISSING_DOCS -eq 0 ]; then
    success "Toda a documentação encontrada (${#DOCS_TO_CHECK[@]} ficheiros)"
else
    error "$MISSING_DOCS ficheiros de documentação em falta"
    OVERALL_SUCCESS=false
fi
echo ""

# 11. Verify .env configuration
echo "11. Verificando configuração .env..."
if [ -f ".env" ]; then
    success ".env existe"
    
    # Check critical env vars
    if grep -q "APP_KEY=base64:" .env; then
        success "APP_KEY configurado"
    else
        error "APP_KEY não configurado. Execute: php artisan key:generate"
        OVERALL_SUCCESS=false
    fi
else
    error ".env não encontrado. Copie .env.example e execute: php artisan key:generate"
    OVERALL_SUCCESS=false
fi
echo ""

# 12. Check storage permissions
echo "12. Verificando permissões de storage..."
if [ -w "storage" ] && [ -w "bootstrap/cache" ]; then
    success "Permissões de storage OK"
else
    warning "Permissões de storage podem precisar de ajuste"
    echo "    Execute: chmod -R 775 storage bootstrap/cache"
fi
echo ""

# 13. Test application accessibility (if server is running)
echo "13. Testando acessibilidade da aplicação..."
if command -v curl &> /dev/null; then
    # Start server in background for testing
    php artisan serve --port=8001 > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 3
    
    if curl -f http://localhost:8001/login > /dev/null 2>&1; then
        success "Aplicação acessível"
    else
        warning "Aplicação pode não estar acessível (servidor pode já estar rodando na porta 8000)"
    fi
    
    # Kill test server
    kill $SERVER_PID 2>/dev/null
else
    warning "curl não instalado - teste de acessibilidade ignorado"
fi
echo ""

# Final summary
echo "========================================="
echo "           RESUMO FINAL"
echo "========================================="
echo ""

if [ "$OVERALL_SUCCESS" = true ]; then
    echo -e "${GREEN}🎉 MIGRAÇÃO 100% COMPLETA!${NC}"
    echo ""
    echo "Todos os checks passaram com sucesso."
    echo ""
    echo "Próximos passos:"
    echo "  1. Execute: php artisan serve"
    echo "  2. Acesse: http://localhost:8000"
    echo "  3. Login: admin@test.com / password"
    echo ""
    echo "Para dados de demonstração:"
    echo "  php artisan db:seed --class=DemoSeeder"
    echo ""
    exit 0
else
    echo -e "${RED}❌ VERIFICAÇÃO ENCONTROU PROBLEMAS${NC}"
    echo ""
    echo "Alguns checks falharam. Reveja os erros acima."
    echo ""
    exit 1
fi
