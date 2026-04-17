import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

const codespaceName = process.env.CODESPACE_NAME;
const forwardingDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
const isCodespaces = Boolean(codespaceName && forwardingDomain);
const appUrl = process.env.APP_URL;

let appOriginFromEnv: string | null = null;
let githubDevViteHost: string | null = null;

if (appUrl) {
    try {
        const parsedAppUrl = new URL(appUrl);
        appOriginFromEnv = parsedAppUrl.origin;

        // Support forwarded app.github.dev URLs even when Codespaces env vars are not present.
        githubDevViteHost = parsedAppUrl.hostname.replace(/-8000(?=\.)/, '-5173');
    } catch {
        appOriginFromEnv = null;
        githubDevViteHost = null;
    }
}

const appOrigins = isCodespaces
    ? [
          `https://${codespaceName}-8000.${forwardingDomain}`,
          'http://localhost:8000',
          'http://127.0.0.1:8000',
      ]
    : ['http://localhost:8000', 'http://127.0.0.1:8000'];

if (appOriginFromEnv && !appOrigins.includes(appOriginFromEnv)) {
    appOrigins.push(appOriginFromEnv);
}

const isAllowedDevOrigin = (origin: string): boolean => {
    if (appOrigins.includes(origin)) {
        return true;
    }

    try {
        const parsed = new URL(origin);

        // Codespaces forwarded URLs can change between sessions while keeping the same app.github.dev pattern.
        if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.app.github.dev')) {
            return true;
        }
    } catch {
        return false;
    }

    return false;
};

const hmrConfig = isCodespaces
    ? {
          protocol: 'wss' as const,
          host: `${codespaceName}-5173.${forwardingDomain}`,
          clientPort: 443,
      }
    : githubDevViteHost
      ? {
            protocol: 'wss' as const,
            host: githubDevViteHost,
            clientPort: 443,
        }
    : undefined;

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.tsx'
            ],
            refresh: true,
        }),
        react(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Core framework — always cached together
                    if (
                        id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/@inertiajs/') ||
                        id.includes('node_modules/axios/') ||
                        id.includes('node_modules/ziggy-js/')
                    ) {
                        return 'framework';
                    }
                    // Radix UI component primitives
                    if (id.includes('node_modules/@radix-ui/')) {
                        return 'radix';
                    }
                    // Charting library
                    if (id.includes('node_modules/recharts/')) {
                        return 'charts';
                    }
                    // Spreadsheet export
                    if (id.includes('node_modules/xlsx/')) {
                        return 'xlsx';
                    }
                    // Icon packs
                    if (
                        id.includes('node_modules/@phosphor-icons/') ||
                        id.includes('node_modules/lucide-react/')
                    ) {
                        return 'icons';
                    }
                    // Date utilities
                    if (
                        id.includes('node_modules/date-fns/') ||
                        id.includes('node_modules/react-day-picker/')
                    ) {
                        return 'date';
                    }
                },
            },
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        // Warm up the finance route to reduce first-hit latency in forwarded dev environments.
        warmup: {
            clientFiles: [
                './resources/js/Pages/Financeiro/Index.tsx',
                './resources/js/Pages/Financeiro/DashboardTab.tsx',
                './resources/js/Pages/Financeiro/RelatoriosTab.tsx',
            ],
        },
        cors: {
            origin: (origin, callback) => {
                if (!origin || isAllowedDevOrigin(origin)) {
                    callback(null, true);
                    return;
                }

                callback(new Error(`Origin not allowed by Vite CORS: ${origin}`), false);
            },
            credentials: true,
        },
        hmr: hmrConfig,
    },
    optimizeDeps: {
        // Avoid on-demand dependency pre-bundling timeouts (404/504) in forwarded dev environments.
        include: [
            'date-fns',
            'recharts',
            'class-variance-authority',
            'lucide-react',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
        ],
    },
    resolve: {
        alias: {
            '@': '/resources/js',
            '@github/spark/hooks': '/resources/js/hooks',
        },
    },
});
