/*
 * FORÇA RECARREGAMENTO COMPLETO DO DASHBOARD
 * 
 * Cole este código COMPLETO no Console do browser (F12 → Console)
 * e pressione Enter
 */

(async function forceReload() {
    console.clear();
    console.log('%c🔄 FORÇA RECARREGAMENTO DO DASHBOARD', 'font-size: 20px; color: #0066cc; font-weight: bold');
    console.log('');
    
    // Step 1: Clear all caches
    console.log('1️⃣ Limpando caches...');
    
    // Clear Service Workers
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            await registration.unregister();
            console.log('   ✅ Service Worker removido');
        }
    }
    
    // Clear Cache Storage
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (let name of cacheNames) {
            await caches.delete(name);
            console.log('   ✅ Cache removido:', name);
        }
    }
    
    // Clear Local Storage
    localStorage.clear();
    console.log('   ✅ LocalStorage limpo');
    
    // Clear Session Storage
    sessionStorage.clear();
    console.log('   ✅ SessionStorage limpo');
    
    console.log('');
    console.log('2️⃣ Forçando reload sem cache...');
    
    // Force reload bypassing cache
    setTimeout(() => {
        window.location.reload(true);
    }, 1000);
    
    console.log('   ⏳ Recarregando em 1 segundo...');
})();
