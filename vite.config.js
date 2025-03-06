// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Ensure the output directory is 'dist' for Vercel
  },
  server: {
    host: true, // Allows network access (optional, useful for testing on other devices)
    port: 3000, // Specify the local development server port (default is 5173)
  },
  preview: {
    port: 3000, // Ensure the same port for the preview server
  },
  // Add base path handling to avoid 404 errors on page refresh
  resolve: {
    alias: {
      '@': '/src', // Optional: Set up an alias for the src folder
    },
  },
});
