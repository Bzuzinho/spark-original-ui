import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        hmr: {
            protocol: 'wss',
            host: 'ominous-xylophone-777r6x44pjjhrr96-5173.app.github.dev',
            clientPort: 443,
        },
    },
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});
