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
            origin: appOrigins,
            credentials: true,
        },
        hmr: hmrConfig,
    },
    optimizeDeps: {
        // Avoid on-demand dependency pre-bundling timeouts (504) when opening /financeiro.
        include: ['date-fns', 'recharts'],
    },
    resolve: {
        alias: {
            '@': '/resources/js',
            '@github/spark/hooks': '/resources/js/hooks',
        },
    },
});
