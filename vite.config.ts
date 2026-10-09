import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('./src/html', import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/ts', import.meta.url)),
      '@css': fileURLToPath(new URL('./src/css', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
    fs: {
      allow: [fileURLToPath(new URL('.', import.meta.url))],
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
});
