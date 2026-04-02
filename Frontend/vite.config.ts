import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [
    ...(import.meta.env.MODE !== 'production' ? [devtools()] : []),
    solidPlugin(), 
    tailwindcss()
  ],
  server: {
    port: 5173, // Frontend port
    host: true, // Allow external access
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Backend port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser', // Minify for production
  },
});


