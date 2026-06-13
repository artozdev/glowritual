import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        host: true,
    },
    build: {
        rollupOptions: {
            output: {
                // Sépare les gros vendors pour un meilleur cache navigateur.
                // (Recharts & MediaPipe sont déjà splittés via import dynamique.)
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    motion: ['framer-motion'],
                    supabase: ['@supabase/supabase-js'],
                },
            },
        },
    },
});
