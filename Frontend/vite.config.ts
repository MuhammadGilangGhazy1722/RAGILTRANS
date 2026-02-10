import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [devtools(), solidPlugin(), tailwindcss()],
  server: {
    port: 5173, // Frontend port (berbeda dari backend)
    host: true, // Allow external access
  },
  build: {
    target: 'esnext',
  },
});
