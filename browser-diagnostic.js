// Browser Console Diagnostic Script
// Copy and paste this into your browser's console (F12 → Console tab)
// This will help diagnose if the correct Dashboard bundle is loaded

console.clear();
console.log('🔍 Dashboard Bundle Diagnostic');
console.log('================================\n');

// Check what Dashboard bundles are loaded
const dashboardResources = performance.getEntriesByType('resource')
    .filter(r => r.name.includes('Dashboard'))
    .map(r => ({
        url: r.name,
        filename: r.name.split('/').pop(),
        size: `${(r.transferSize / 1024).toFixed(2)} KB`,
        cached: r.transferSize === 0 ? '⚠️ From Cache' : '✅ Fresh'
    }));

if (dashboardResources.length === 0) {
    console.log('❌ No Dashboard bundle found in loaded resources');
    console.log('This page might not be the Dashboard, or it hasn\'t loaded yet.');
} else {
    console.log('📦 Dashboard Bundles Loaded:');
    console.table(dashboardResources);
    
    const currentBundle = dashboardResources[0].filename;
    const expectedBundle = 'Dashboard-DWBs6BzH.js';
    
    console.log('\n');
    console.log('Expected bundle:', expectedBundle);
    console.log('Loaded bundle:  ', currentBundle);
    
    if (currentBundle === expectedBundle) {
        console.log('\n✅ CORRECT BUNDLE LOADED!');
        console.log('The fix should be active. If you still see errors, check the console for other issues.');
    } else {
        console.log('\n❌ WRONG BUNDLE LOADED!');
        console.log('You are loading an old cached version.');
        console.log('\nTo fix this:');
        console.log('1. Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)');
        console.log('2. Or: Open Incognito/Private mode');
        console.log('3. Or: Clear browser cache (Settings → Privacy → Clear Data)');
        console.log('4. Or: DevTools Network tab → Check "Disable cache" → Refresh');
    }
}

// Check for the error
console.log('\n');
console.log('🐛 Error Check:');
const errors = [];
try {
    // Try to access the problematic property
    const testObj = { stats: { monthlyRevenue: undefined } };
    testObj.stats.monthlyRevenue.toFixed(2);
} catch (e) {
    errors.push(e.message);
}

if (errors.length > 0) {
    console.log('❌ Error still present:', errors[0]);
} else {
    console.log('✅ No .toFixed() error detected in current session');
}

// Check if page has React DevTools
console.log('\n');
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
} else {
    console.log('ℹ️ React DevTools not detected (optional)');
}

console.log('\n================================');
console.log('Diagnostic complete!');
