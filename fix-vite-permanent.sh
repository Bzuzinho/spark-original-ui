#!/bin/bash

echo "=== PERMANENT VITE ERROR FIX ==="
echo "Resolving Vite module resolution error..."

cd /workspaces/spark-template

echo "Step 1: Cleaning all caches and build artifacts..."
rm -rf node_modules
rm -rf .vite
rm -rf dist
rm -f package-lock.json

echo "Step 2: Clearing npm cache..."
npm cache clean --force

echo "Step 3: Reinstalling dependencies with clean slate..."
npm install

echo "Step 4: Verifying Vite installation..."
if [ -f "node_modules/vite/dist/node/chunks/dist.js" ]; then
    echo "✓ Vite dist.js found"
else
    echo "✗ Vite dist.js missing - reinstalling vite specifically"
    npm install vite@latest --save-dev
fi

echo "Step 5: Clearing Vite cache again..."
rm -rf .vite

echo "=== FIX COMPLETE ==="
echo "The development server should now start without errors."
