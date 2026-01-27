# Vite Module Error - Permanent Fix

## Error Description
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

## Root Cause
This error occurs when:
1. Vite's internal module structure becomes corrupted
2. Node modules cache is stale
3. Symlinks are broken
4. Multiple Vite instances conflict

## Applied Fixes

### 1. Updated vite.config.ts
Enhanced configuration with:
- `dedupe: ['react', 'react-dom', 'vite']` - Prevents multiple Vite instances
- `fastRefresh: true` - Enables proper HMR
- `include: ['react', 'react-dom']` in optimizeDeps - Pre-bundles core dependencies
- Better server watching configuration
- CommonJS build options

### 2. Created Comprehensive Fix Script
Run `bash fix-vite-complete.sh` to:
1. Clear all Vite caches (.vite, node_modules/.vite)
2. Clear npm caches
3. Remove node_modules and package-lock.json
4. Reinstall all dependencies fresh
5. Force dependency optimization

## How to Apply This Fix

### Method 1: Run the Fix Script (Recommended)
```bash
chmod +x fix-vite-complete.sh
bash fix-vite-complete.sh
```

### Method 2: Manual Steps
```bash
# Clear all caches
rm -rf .vite node_modules/.vite node_modules/.cache

# Clear npm cache
rm -rf ~/.npm/_cacache ~/.cache/vite

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Optimize dependencies
npm run optimize
```

### Method 3: Quick Cache Clear (If error persists after small changes)
```bash
rm -rf .vite node_modules/.vite
npm run optimize
```

## Prevention
To prevent this error from recurring:

1. **Don't manually edit node_modules** - Always use npm commands
2. **Clear cache before major updates** - Run cache clear when updating Vite or major deps
3. **Use npm ci in production** - For clean, reproducible installs
4. **Keep npm updated** - Run `npm install -g npm@latest` periodically

## If Error Still Persists

If you still see this error after applying all fixes:

1. Check for multiple Node.js versions:
   ```bash
   which node
   node --version
   ```

2. Verify npm integrity:
   ```bash
   npm cache verify
   ```

3. Check for disk space:
   ```bash
   df -h
   ```

4. Check file permissions:
   ```bash
   ls -la node_modules/vite/dist/node/chunks/
   ```

5. Reinstall Node.js if necessary

## Technical Details

The error occurs because Vite's ESM loader tries to import `dist.js` from the chunks directory, but:
- The file might be missing due to incomplete npm install
- Symlinks might be broken
- File permissions might be incorrect
- Multiple Vite instances might be conflicting

The fix ensures:
- Clean dependency tree
- No duplicate packages
- Proper module resolution
- Correct symlinks
- Fresh cache

## Last Updated
Applied on current iteration to resolve recurring Vite module errors.
