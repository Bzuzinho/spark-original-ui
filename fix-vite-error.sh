#!/bin/bash

echo "==================================="
echo "Vite Module Resolution Error Fix"
echo "==================================="
echo ""

# Step 1: Stop any running processes
echo "Step 1: Stopping any running Vite processes..."
pkill -f vite || true
fuser -k 5000/tcp 2>/dev/null || true

# Step 2: Clear Vite cache
echo ""
echo "Step 2: Clearing Vite cache..."
rm -rf .vite
rm -rf node_modules/.vite

# Step 3: Remove node_modules and lock file
echo ""
echo "Step 3: Removing node_modules and package-lock.json..."
rm -rf node_modules
rm -rf package-lock.json

# Step 4: Clear npm cache
echo ""
echo "Step 4: Clearing npm cache..."
npm cache clean --force

# Step 5: Reinstall dependencies
echo ""
echo "Step 5: Reinstalling all dependencies..."
npm install

# Step 6: Verify installation
echo ""
echo "Step 6: Verifying Vite installation..."
if [ -f "node_modules/vite/dist/node/chunks/dist.js" ]; then
    echo "✓ Vite module structure is correct"
else
    echo "✗ Vite installation may still have issues"
    echo "  Try running: npm install vite@6.4.1"
fi

echo ""
echo "==================================="
echo "Fix process complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Try running: npm run dev"
echo "2. If the error persists, check VITE_MODULE_ERROR_FIX.md"
echo ""
