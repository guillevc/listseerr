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
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: true, // Allow cleaning output dir outside project root
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core libraries (handle Bun's node_modules structure)
          if (id.includes('react-dom') || id.includes('react/jsx-runtime') || id.includes('react/jsx-dev-runtime')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react') && !id.includes('react-')) {
            return 'vendor-react';
          }

          // TanStack Router
          if (id.includes('@tanstack/react-router')) {
            return 'vendor-router';
          }

          // Data fetching & state management
          if (id.includes('@tanstack/react-query') || id.includes('@trpc/client') || id.includes('@trpc/react-query')) {
            return 'vendor-query';
          }

          // Radix UI components
          if (id.includes('@radix-ui/')) {
            return 'vendor-ui';
          }

          // Table library
          if (id.includes('@tanstack/react-table')) {
            return 'vendor-table';
          }

          // Icon library
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }

          // Utilities and smaller libraries
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
