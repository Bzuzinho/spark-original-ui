#!/bin/bash

echo "🔧 Fixing Vite Fast Refresh Error..."

# Step 1: Stop any running processes
echo "📦 Stopping any running processes..."
pkill -f vite || true

# Step 2: Clear all caches
echo "🧹 Clearing caches..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
rm -rf node_modules/.cache

# Step 3: Remove and reinstall specific packages
echo "📦 Reinstalling Vite and React plugins..."
npm uninstall vite @vitejs/plugin-react @vitejs/plugin-react-swc

# Step 4: Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Step 5: Reinstall packages
echo "📦 Reinstalling packages..."
npm install vite@latest @vitejs/plugin-react@latest --save-dev

echo "✅ Fix complete! Try running your app again."
