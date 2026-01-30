#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "  Laravel PostgreSQL Setup Validator"
echo "======================================"
echo ""

# Check PHP
echo -n "Checking PHP... "
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1 | cut -d ' ' -f 2)
    echo -e "${GREEN}✓${NC} PHP $PHP_VERSION found"
else
    echo -e "${RED}✗${NC} PHP not found"
    exit 1
fi

# Check Composer
echo -n "Checking Composer... "
if command -v composer &> /dev/null; then
    COMPOSER_VERSION=$(composer --version | head -n 1 | cut -d ' ' -f 3)
    echo -e "${GREEN}✓${NC} Composer $COMPOSER_VERSION found"
else
    echo -e "${RED}✗${NC} Composer not found"
    exit 1
fi

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION found"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm $NPM_VERSION found"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check PDO PostgreSQL extension
echo -n "Checking PDO PostgreSQL extension... "
if php -m | grep -q pdo_pgsql; then
    echo -e "${GREEN}✓${NC} pdo_pgsql extension installed"
else
    echo -e "${RED}✗${NC} pdo_pgsql extension not found"
    exit 1
fi

# Check .env file
echo -n "Checking .env file... "
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check DB configuration
    if grep -q "DB_CONNECTION=pgsql" .env; then
        echo -e "  ${GREEN}✓${NC} DB_CONNECTION set to pgsql"
    else
        echo -e "  ${YELLOW}⚠${NC} DB_CONNECTION not set to pgsql"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found (will be created from .env.example)"
fi

# Check vendor directory
echo -n "Checking vendor directory... "
if [ -d vendor ]; then
    echo -e "${GREEN}✓${NC} vendor directory exists"
else
    echo -e "${YELLOW}⚠${NC} vendor directory not found (run 'composer install')"
fi

# Check node_modules directory
echo -n "Checking node_modules directory... "
if [ -d node_modules ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${YELLOW}⚠${NC} node_modules directory not found (run 'npm install')"
fi

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker found"
    
    # Check if PostgreSQL container is running
    if docker compose ps | grep -q laravel_postgres; then
        CONTAINER_STATUS=$(docker compose ps --format json | grep postgres | grep -o '"State":"[^"]*"' | cut -d'"' -f4)
        if [ "$CONTAINER_STATUS" == "running" ]; then
            echo -e "  ${GREEN}✓${NC} PostgreSQL container is running"
            
            # Try to connect
            echo -n "  Testing PostgreSQL connection... "
            if docker compose exec -T postgres psql -U postgres -d laravel -c "SELECT 1" &> /dev/null; then
                echo -e "${GREEN}✓${NC} Connection successful"
            else
                echo -e "${RED}✗${NC} Cannot connect to database"
            fi
        else
            echo -e "  ${YELLOW}⚠${NC} PostgreSQL container not running (run 'docker compose up -d')"
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} PostgreSQL container not found (run 'docker compose up -d')"
    fi
else
    echo -e "${YELLOW}⚠${NC} Docker not found (optional - can use local PostgreSQL)"
fi

echo ""
echo "======================================"
echo "  Summary"
echo "======================================"
echo ""
echo "To complete the setup:"
echo "1. Run 'docker compose up -d' to start PostgreSQL"
echo "2. Run 'composer install' to install PHP dependencies"
echo "3. Run 'npm install' to install Node.js dependencies"
echo "4. Copy .env.example to .env if not exists"
echo "5. Run 'php artisan key:generate' to generate app key"
echo "6. Run 'php artisan migrate' to create database tables"
echo "7. Run 'php artisan serve' to start the Laravel server"
echo "8. Run 'npm run dev' to start Vite dev server"
echo ""
