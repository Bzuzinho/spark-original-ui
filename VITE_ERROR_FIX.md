# Vite Module Error Fix

## Error
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js' 
imported from /workspaces/spark-template/node_modules/vite/dist/node/chunks/config.js
```

## Root Cause
The Vite 6.4.1 installation appears to have a corrupted or incomplete node_modules structure. The expected `dist.js` file in the chunks directory does not exist.

## Solution

### Option 1: Clean Reinstall (Recommended)
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall all dependencies
npm install
```

### Option 2: Reinstall Vite and Related Packages
```bash
npm uninstall vite @vitejs/plugin-react @vitejs/plugin-react-swc @tailwindcss/vite
npm install vite@6.4.1 @vitejs/plugin-react@4.7.0 @vitejs/plugin-react-swc@4.2.2 @tailwindcss/vite@4.1.17
```

### Option 3: Use Vite 5.x (Fallback)
If Vite 6.x continues to have issues:
```bash
npm uninstall vite
npm install vite@^5.4.11
```

## Verification
After applying the fix, verify the installation:
```bash
# Check if Vite can be imported
node -e "require('vite')"

# Try to start the dev server
npm run dev
```

## Notes
- This is a build-time error, not a runtime error in the application code
- The application source code is correct and does not need changes
- This error typically occurs due to network issues during installation or cache corruption
