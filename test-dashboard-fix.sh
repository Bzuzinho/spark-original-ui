#!/bin/bash

# Dashboard Fix - Quick Test Script
# This script helps verify the fix is working

echo "🔍 Dashboard Fix Verification"
echo "================================"
echo ""

# Check if server is running
echo "1. Checking PHP server..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ | grep -q "302\|200"; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server not responding"
    echo "   Run: php artisan serve --host=0.0.0.0 --port=8000"
    exit 1
fi

echo ""
echo "2. Checking Dashboard bundle..."
BUNDLE=$(cat public/build/manifest.json | jq -r '.["resources/js/Pages/Dashboard.tsx"].file')
echo "   Current bundle: $BUNDLE"

if [ -f "public/build/$BUNDLE" ]; then
    echo "   ✅ Bundle file exists"
    SIZE=$(ls -lh "public/build/$BUNDLE" | awk '{print $5}')
    echo "   Size: $SIZE"
else
    echo "   ❌ Bundle file missing"
    exit 1
fi

echo ""
echo "3. Checking safety code..."
if grep -q 'monthlyRevenue:(t==null?void 0:t.monthlyRevenue)??0' "public/build/$BUNDLE"; then
    echo "   ✅ Safety checks present in bundle"
else
    echo "   ❌ Safety checks not found"
    echo "   Try rebuilding: npm run build"
    exit 1
fi

echo ""
echo "4. Testing bundle accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/build/$BUNDLE")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Bundle is accessible (HTTP $HTTP_CODE)"
else
    echo "   ❌ Bundle not accessible (HTTP $HTTP_CODE)"
    exit 1
fi

echo ""
echo "================================"
echo "✅ All server-side checks passed!"
echo ""
echo "📱 Next steps:"
echo "   1. Open your browser"
echo "   2. Navigate to: https://ominous-xylophone-777r6x44pjjhrr96-8000.app.github.dev"
echo "   3. Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac) to hard refresh"
echo "   4. Check Network tab in DevTools to verify bundle hash: $BUNDLE"
echo ""
echo "If you still see errors:"
echo "   • Try Incognito/Private mode"
echo "   • Clear browser cache completely"
echo "   • Disable cache in DevTools Network tab"
echo ""
echo "See CACHE_FIX_VERIFICATION.md for detailed instructions"
