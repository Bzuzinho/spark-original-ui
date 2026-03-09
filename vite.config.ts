import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

const codespaceName = process.env.CODESPACE_NAME;
const forwardingDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
const isCodespaces = Boolean(codespaceName && forwardingDomain);

const appOrigins = isCodespaces
    ? [
          `https://${codespaceName}-8000.${forwardingDomain}`,
          'http://localhost:8000',
          'http://127.0.0.1:8000',
      ]
    : ['http://localhost:8000', 'http://127.0.0.1:8000'];

const hmrConfig = isCodespaces
    ? {
          protocol: 'wss' as const,
          host: `${codespaceName}-5173.${forwardingDomain}`,
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
        cors: {
            origin: appOrigins,
            credentials: true,
        },
        hmr: hmrConfig,
    },
    resolve: {
        alias: {
            '@': '/resources/js',
            '@github/spark/hooks': '/resources/js/hooks',
        },
    },
});
