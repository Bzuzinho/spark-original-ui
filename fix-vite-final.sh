#!/bin/bash

echo "🔧 Fixing Vite module resolution error..."

echo "Step 1: Killing any running processes on port 5000..."
fuser -k 5000/tcp 2>/dev/null || true

echo "Step 2: Removing Vite cache directories..."
rm -rf .vite
rm -rf node_modules/.vite
rm -rf node_modules/.cache

echo "Step 3: Removing Vite from node_modules..."
rm -rf node_modules/vite

echo "Step 4: Reinstalling Vite..."
npm install vite@6.4.1 --force

echo "Step 5: Running Vite optimization..."
npm run optimize 2>/dev/null || true

echo "✅ Vite has been reinstalled. Try running 'npm run dev' now."
