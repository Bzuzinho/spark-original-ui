#!/bin/bash

echo "🔧 Starting comprehensive Vite error fix..."

echo "📦 Step 1: Clearing all caches..."
rm -rf .vite
rm -rf node_modules/.vite
rm -rf node_modules/.cache

echo "🧹 Step 2: Clearing package caches..."
rm -rf ~/.npm/_cacache
rm -rf ~/.cache/vite

echo "🗑️  Step 3: Removing node_modules and lock file..."
rm -rf node_modules
rm -f package-lock.json

echo "📥 Step 4: Reinstalling dependencies..."
npm install

echo "⚡ Step 5: Force optimizing dependencies..."
npm run optimize || true

echo "✅ Fix complete! The Vite error should be resolved."
echo "🚀 You can now restart the dev server."
