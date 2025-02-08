import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3005,
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/socket.io': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
});
