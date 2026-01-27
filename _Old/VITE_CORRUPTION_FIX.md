# Vite Module Corruption - Permanent Fix

## Problem
Error: `Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js'`

This error occurs when Vite's node_modules become corrupted, usually after multiple installations or cache issues.

## Solution

Run the following command in the terminal:

```bash
npm run reinstall
```

This will:
1. Remove `.vite` cache
2. Remove `node_modules/.vite` and `node_modules/.cache`
3. Remove `node_modules` and `package-lock.json`
4. Reinstall all dependencies
5. Optimize Vite dependencies

## Alternative Manual Steps

If the above doesn't work, run these commands one by one:

```bash
# 1. Clean everything
rm -rf node_modules package-lock.json .vite

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall
npm install

# 4. Optimize Vite
npm run optimize
```

## Prevention

This error typically happens when:
- Dependencies are partially installed
- npm install is interrupted
- Cache becomes corrupted
- Multiple package managers are used

To prevent this in the future:
- Always let `npm install` complete fully
- Use `npm run clean` before reinstalling if you suspect issues
- Don't mix npm/yarn/pnpm in the same project

## Verification

After running the fix, verify it works:

```bash
npm run dev
```

The application should start without errors.
