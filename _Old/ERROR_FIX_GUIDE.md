# ERROR FIX GUIDE - Gestão de Clube

## 🔴 Vite Module Error (Most Common)

### Error Message:
```
Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js'
```

### Quick Fix (Choose ONE method):

#### Method 1: Using npm script (RECOMMENDED)
```bash
npm run reinstall
```

#### Method 2: Using the fix script
```bash
npm run fix-vite
```

#### Method 3: Manual cleanup
```bash
rm -rf node_modules .vite package-lock.json
npm cache clean --force
npm install
```

### Why This Happens:
- Corrupted node_modules during installation
- Interrupted npm install process
- Cache conflicts
- File system issues

### Prevention:
1. Always let `npm install` complete fully
2. Clear caches regularly: `npm run clean`
3. Don't edit files in node_modules
4. If you see errors, fix immediately before continuing development

---

## 🟡 React Fast Refresh Errors

### Error Messages:
- "Fast Refresh only works when a file has exports"
- "Cannot read properties of undefined"

### Fix:
All components must have default exports:
```typescript
// ✅ CORRECT
export default function MyComponent() {
  return <div>...</div>
}

// ✗ WRONG
export function MyComponent() {
  return <div>...</div>
}
```

---

## 🟢 Build Errors

### Error: "Cannot find module '@/...'"

This means the TypeScript path alias isn't resolving. Check:

1. **tsconfig.json** has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. **vite.config.ts** has:
```typescript
resolve: {
  alias: {
    '@': resolve(__dirname, 'src')
  }
}
```

### Fix:
```bash
npm run clean
npm run dev
```

---

## 🔵 Runtime Errors

### Error: "useKV is not a function"

Make sure you're importing from the correct location:
```typescript
// ✅ CORRECT
import { useKV } from '@github/spark/hooks'

// ✗ WRONG
import { useKV } from '@/hooks/use-kv'
```

### Error: "Cannot update component while rendering"

This happens when you call state setters during render. Fix:
```typescript
// ✗ WRONG
function Component() {
  const [data, setData] = useState([])
  setData([1, 2, 3]) // Called during render!
  return <div>...</div>
}

// ✅ CORRECT
function Component() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    setData([1, 2, 3]) // Called in effect
  }, [])
  
  return <div>...</div>
}
```

---

## ⚪ Application-Specific Errors

### Navigation not working

If clicking on a user/member doesn't navigate:
1. Check that `onNavigate` prop is passed correctly
2. Verify the component has access to navigation context
3. Ensure the user ID exists in the database

### Data not persisting

If data disappears on refresh:
1. Verify you're using `useKV` instead of `useState` for persistent data
2. Check that the KV key is unique and consistent
3. Ensure functional updates: `setValue(prev => [...prev, newItem])`

### Presenças not showing

If attendance (presenças) doesn't appear:
1. Check that the training event has assigned escalões (teams)
2. Verify athletes belong to those escalões
3. Ensure the attendance record was created with `spark.kv.set()`

---

## 🛠️ General Troubleshooting Steps

### Step 1: Clear all caches
```bash
npm run clean
```

### Step 2: Restart dev server
Stop the current server (Ctrl+C) and run:
```bash
npm run dev
```

### Step 3: Full reinstall (if above doesn't work)
```bash
npm run reinstall
```

### Step 4: Check for TypeScript errors
```bash
npm run lint
```

### Step 5: Nuclear option (last resort)
```bash
rm -rf node_modules .vite dist package-lock.json .git/index.lock
npm cache clean --force
npm install
npm run dev
```

---

## 📞 When Nothing Works

If you've tried all the above and still have errors:

1. **Document the exact error message** - Copy the full error from console
2. **Note what you were doing** - What action triggered the error?
3. **Check browser console** - Open DevTools (F12) and check for additional errors
4. **Try a different browser** - Sometimes browser cache causes issues
5. **Restart your computer** - File system locks can cause strange issues

---

## ✅ Successful Fix Indicators

After applying a fix, you should see:
- ✓ No errors in terminal
- ✓ Dev server starts successfully
- ✓ Page loads without console errors
- ✓ Application functions normally

---

## 🚀 Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run clean` | Clear caches |
| `npm run reinstall` | Full cleanup and reinstall |
| `npm run fix-vite` | Fix Vite module errors |
| `npm run build` | Build for production |
| `npm run lint` | Check for code errors |

---

**Last Updated:** 2025-01-XX
**Application:** Gestão de Clube - Sistema de Atletas
