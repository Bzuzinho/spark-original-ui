# Fast Refresh Error Fix

## Error
`Uncaught TypeError: RefreshRuntime.register is not a function`

## Root Cause
This error occurs when there's a conflict with React Fast Refresh, typically caused by:
1. Issues with the `@vitejs/plugin-react-swc` plugin
2. Incompatibility between React 19 and the SWC plugin
3. Module resolution issues

## Solution Applied
Changed the Vite configuration from using `@vitejs/plugin-react-swc` to `@vitejs/plugin-react`:

### Before:
```typescript
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [
    react(),
    // ...
  ],
});
```

### After:
```typescript
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      fastRefresh: true,
    }),
    // ...
  ],
  optimizeDeps: {
    exclude: ['@github/spark']
  },
});
```

## Additional Configuration
- Added explicit `jsxRuntime: 'automatic'` for React 19 compatibility
- Enabled `fastRefresh: true` explicitly
- Added `optimizeDeps.exclude` for the Spark SDK

## Why This Works
The standard `@vitejs/plugin-react` plugin uses Babel for Fast Refresh, which is more stable with React 19 than the SWC alternative. While SWC is faster, it can have compatibility issues with newer React versions.

## Verification
After applying this fix:
1. The application should reload without errors
2. Fast Refresh should work properly during development
3. No "RefreshRuntime.register is not a function" errors in the console

## Note
Both plugins (`@vitejs/plugin-react` and `@vitejs/plugin-react-swc`) remain in package.json as they were already installed. The configuration now uses the more stable Babel-based plugin.
