#!/bin/bash

set -e

echo "🚀 Setting up Spark Original UI..."

# Detect environment
if [ -f .env ]; then
    echo "✅ .env file exists"
else
    echo "📝 Creating .env file..."
    if [ "$1" == "--local" ]; then
        cp .env.local.example .env
        echo "✅ Using local development configuration (SQLite + File cache)"
    else
        cp .env.example .env
        echo "✅ Using production configuration (PostgreSQL + Redis)"
    fi
fi

# Generate app key
echo "🔑 Generating application key..."
php artisan key:generate

# Install dependencies
echo "📦 Installing Composer dependencies..."
composer install

echo "📦 Installing NPM dependencies..."
npm install

# Setup database
if grep -q "DB_CONNECTION=sqlite" .env; then
    echo "💾 Creating SQLite database..."
    touch database/database.sqlite
fi

echo "🗄️  Running migrations..."
php artisan migrate:fresh

# Optimize
echo "⚡ Optimizing application..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear

echo "✅ Setup complete!"
echo ""
echo "Start development servers:"
echo "  npm run dev"
echo "  php artisan serve"
