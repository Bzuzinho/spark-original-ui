# VITE MODULE ERROR - PERMANENT SOLUTION

## Error Description
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

## Root Cause
This error occurs when:
1. The `node_modules` directory becomes corrupted
2. Vite's internal module structure is incomplete or broken
3. Cache conflicts between different Vite versions or installations

## Permanent Fix Applied

### 1. Simplified `vite.config.ts`
- Removed `dedupe` option that can cause resolution conflicts
- Removed `force: false` from optimizeDeps (not needed)
- Removed dynamic `PROJECT_ROOT` environment variable
- Added explicit path to node_modules in server.fs.allow
- Changed relative cache path to absolute path

### 2. Clean Installation Script
Created `fix-vite-permanent.sh` that:
- Removes all node_modules
- Clears .vite cache
- Clears npm cache
- Reinstalls all dependencies fresh
- Verifies Vite installation

## How to Fix When Error Occurs

### Option 1: Run the fix script
```bash
chmod +x fix-vite-permanent.sh
./fix-vite-permanent.sh
```

### Option 2: Manual steps
```bash
# Remove corrupted files
rm -rf node_modules .vite dist package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Clear Vite cache again
rm -rf .vite
```

### Option 3: Quick fix (if above doesn't work)
```bash
# Remove just the Vite module
rm -rf node_modules/vite

# Reinstall Vite specifically
npm install vite@latest --save-dev

# Clear cache
rm -rf .vite
```

## Prevention
- Don't interrupt npm install processes
- Clear .vite cache regularly during development
- If you see strange errors, clear caches first before debugging

## Why This Solution Works
1. **Clean slate**: Removing all cached and installed modules ensures no corruption
2. **Fresh install**: npm install rebuilds the entire dependency tree correctly
3. **Simplified config**: Fewer custom options = fewer potential conflicts
4. **Absolute paths**: Removes ambiguity in module resolution

## Verification
After running the fix, you should see:
```
✓ Vite dist.js found
=== FIX COMPLETE ===
```

Then start the dev server normally - it should work without errors.
