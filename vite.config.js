import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [],
  esbuild: {
    jsx: 'automatic',
  },
  // The dependency optimizer can hang in this workspace while prebundling Three,
  // GSAP, and Framer Motion. Prebundle only the CommonJS packages that need
  // interop (React, Supabase) and let the ESM libraries stream on demand.
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@supabase/supabase-js',
    ],
    exclude: [
      'framer-motion',
      'gsap',
      'lenis',
      'three',
    ],
  },
  server: {
    host: '0.0.0.0',
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 500,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },
  },
  build: {
    minify: false,
  },
}));
