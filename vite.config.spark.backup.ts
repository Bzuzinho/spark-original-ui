import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      fastRefresh: true,
    }),
    tailwindcss(),
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    exclude: ['@github/spark'],
    include: ['react', 'react-dom', 'react/jsx-runtime']
  },
  server: {
    fs: {
      strict: false
    },
    hmr: {
      overlay: true
    }
  },
  clearScreen: false,
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});
