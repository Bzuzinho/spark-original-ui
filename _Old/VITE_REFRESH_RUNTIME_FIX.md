# Vite Fast Refresh Runtime Error - Permanent Fix

## Problem
Error: `Uncaught TypeError: RefreshRuntime.getRefreshReg is not a function`

This error occurs when Vite's Fast Refresh (HMR - Hot Module Replacement) runtime is corrupted or not properly initialized.

## Root Causes
1. Corrupted Vite cache in `node_modules/.vite`
2. Mismatch between Vite and React plugin versions
3. React Fast Refresh runtime not properly loaded
4. Corrupted node_modules

## Solution Applied

### 1. Updated vite.config.ts
- Explicitly enabled `fastRefresh: true` in React plugin
- Added React and React-DOM to `optimizeDeps.include` to ensure proper pre-bundling
- Added `react/jsx-runtime` to optimize dependencies
- Enabled HMR overlay for better error visibility

### 2. Cache Clearing Required
Run these commands in order:

```bash
# Stop any running Vite processes
pkill -f vite

# Clear all caches
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
rm -rf node_modules/.cache

# Clear npm cache
npm cache clean --force

# Reinstall node_modules (optional but recommended if error persists)
rm -rf node_modules
rm package-lock.json
npm install
```

### 3. Quick Fix Script
A script has been created at `/workspaces/spark-template/fix-refresh-error.sh`:

```bash
chmod +x fix-refresh-error.sh
./fix-refresh-error.sh
```

## Prevention
To prevent this error from recurring:

1. **Always clear cache after major updates**: When updating Vite or React plugins, clear the `.vite` cache
2. **Keep dependencies in sync**: Ensure `vite`, `@vitejs/plugin-react`, `react`, and `react-dom` are compatible versions
3. **Avoid manual node_modules edits**: Never manually edit files in node_modules
4. **Use npm ci in CI/CD**: Use `npm ci` instead of `npm install` for clean installs

## If Error Persists

If the error continues after applying the fix:

1. Check browser console for additional errors
2. Clear browser cache and hard reload (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if any component has syntax errors preventing Fast Refresh
4. Verify that all React components are properly exported
5. Look for circular dependencies in imports

## Technical Details

The Fast Refresh runtime is injected by `@vitejs/plugin-react` and provides:
- `RefreshRuntime.getRefreshReg()` - Registers components for refresh
- `RefreshRuntime.createSignatureFunctionForTransform()` - Tracks component signatures
- HMR boundary detection for efficient updates

When this runtime fails to load properly, you get the `getRefreshReg is not a function` error.

## Files Modified
- `/workspaces/spark-template/vite.config.ts` - Enhanced with proper Fast Refresh configuration
- `/workspaces/spark-template/fix-refresh-error.sh` - Created cleanup script

## Status
✅ Configuration updated
⏳ Cache clearing required (run the script or manual commands)
✅ Should resolve after clearing cache and restarting dev server
