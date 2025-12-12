import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],

          // TanStack Router
          'vendor-router': ['@tanstack/react-router'],

          // Data fetching & state management
          'vendor-query': ['@tanstack/react-query', '@trpc/client', '@trpc/react-query'],

          // Radix UI components (shadcn/ui dependencies)
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],

          // Table library (can be large)
          'vendor-table': ['@tanstack/react-table'],

          // Icon library (can be large with many icons)
          'vendor-icons': ['lucide-react'],

          // Utilities and smaller libraries
          'vendor-utils': [
            'clsx',
            'tailwind-merge',
            'tailwind-variants',
            'next-themes',
            'croner',
            'zod',
          ],
        },
      },
    },
  },
});
