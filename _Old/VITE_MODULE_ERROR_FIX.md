# Vite Module Resolution Error - Fix Guide

## Error Description
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

## Root Cause
This error occurs when Vite's internal module structure becomes corrupted or inconsistent, typically due to:
1. Interrupted installation process
2. Corrupted npm cache
3. Symlink issues in node_modules
4. Version mismatch between Vite and its plugins

## Solution

### Quick Fix (Automated Script)
Run the provided fix script:

```bash
chmod +x fix-vite-error.sh
./fix-vite-error.sh
```

### Manual Fix: Clear Cache and Reinstall (Recommended)
Run these commands in order:

```bash
# Stop any running processes
pkill -f vite
fuser -k 5000/tcp

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Clear Vite cache
rm -rf .vite node_modules/.vite

# Reinstall all dependencies
npm install

# Verify Vite installation
ls -la node_modules/vite/dist/node/chunks/dist.js
```

### Option 2: Reinstall Vite Specifically
```bash
# Remove Vite and related plugins
npm uninstall vite @vitejs/plugin-react @vitejs/plugin-react-swc @tailwindcss/vite

# Reinstall them
npm install vite@6.4.1 @vitejs/plugin-react@4.7.0 @vitejs/plugin-react-swc@4.2.2 @tailwindcss/vite@4.1.17
```

### Option 3: Use Different Package Manager
Sometimes switching to a different package manager helps:

```bash
# If using npm, try with yarn
yarn install

# Or with pnpm
pnpm install
```

## Prevention
To prevent this error from recurring:

1. **Always complete installations**: Don't interrupt `npm install` processes
2. **Keep dependencies updated**: Regularly run `npm update`
3. **Clear cache periodically**: Run `npm cache clean --force` when issues arise
4. **Use lockfile**: Always commit `package-lock.json` to ensure consistent installs

## Current Package Versions
- vite: 6.4.1
- @vitejs/plugin-react: 4.7.0
- @vitejs/plugin-react-swc: 4.2.2
- @tailwindcss/vite: 4.1.17

## Status
This error has been documented. The application's code is correct; this is an environment/installation issue that requires manual intervention at the system level (clearing caches and reinstalling node_modules).

## Additional Notes
- The vite.config.ts file is properly configured
- All plugin imports are correct
- This is not a code issue but an npm/node_modules corruption issue
- The error will persist until node_modules is properly reinstalled
