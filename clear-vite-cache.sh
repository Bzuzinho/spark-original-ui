#!/bin/bash
# Vite Cache Clear & Fresh Build Script
# Use this whenever code changes aren't reflected in the browser

set -e

echo "╔════════════════════════════════════════╗"
echo "║  VITE CACHE CLEAR & FRESH BUILD       ║"
echo "╚════════════════════════════════════════╝"
echo ""

echo "🧹 Clearing caches..."
echo "  → public/build/"
rm -rf public/build

echo "  → .vite/ (project root cache)"
rm -rf .vite

echo "  → node_modules/.vite/"
rm -rf node_modules/.vite

echo "  → Laravel caches"
php artisan cache:clear 2>/dev/null || true
php artisan config:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

echo "  → TypeScript build info"
rm -f tsconfig.tsbuildinfo 2>/dev/null || true

echo ""
echo "🔨 Running fresh build..."
npm run build

echo ""
echo "✅ COMPLETE!"
echo ""
echo "📦 New Dashboard bundle:"
ls -lh public/build/assets/Dashboard-*.js 2>/dev/null || echo "  No Dashboard bundle found"
echo ""
echo "🌐 Next steps:"
echo "  1. Clear browser cache (Ctrl+Shift+Delete)"
echo "  2. Hard refresh (Ctrl+Shift+R)"
echo "  3. Check DevTools Network tab for new bundle hash"
echo ""
