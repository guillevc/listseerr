import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    process.env.ANALYZE === 'true' &&
      visualizer({
        filename: './stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@/client': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    host: true,
  },
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
    target: 'esnext',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core libraries (handle Bun's node_modules structure)
          if (
            id.includes('react-dom') ||
            id.includes('react/jsx-runtime') ||
            id.includes('react/jsx-dev-runtime')
          ) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react') && !id.includes('react-')) {
            return 'vendor-react';
          }

          if (id.includes('@tanstack/react-router')) {
            return 'vendor-router';
          }

          if (
            id.includes('@tanstack/react-query') ||
            id.includes('@trpc/client') ||
            id.includes('@trpc/react-query')
          ) {
            return 'vendor-query';
          }

          if (id.includes('@radix-ui/')) {
            return 'vendor-ui';
          }

          if (id.includes('@tanstack/react-table')) {
            return 'vendor-table';
          }

          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }

          if (
            id.includes('clsx') ||
            id.includes('tailwind-merge') ||
            id.includes('tailwind-variants') ||
            id.includes('next-themes') ||
            id.includes('croner') ||
            id.includes('zod')
          ) {
            return 'vendor-utils';
          }
        },
      },
    },
  },
});
