import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

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
            origin: [
                'https://ominous-xylophone-777r6x44pjjhrr96-8000.app.github.dev',
                'http://localhost:8000'
            ],
            credentials: true,
        },
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
