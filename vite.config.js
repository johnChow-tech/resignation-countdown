import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @description Vite configuration with GitHub Pages base path
 * IMPORTANT: Replace 'resignation-countdown' with your actual GitHub repository name.
 */
export default defineConfig({
  plugins: [react()],
  base: '/resignation-countdown/',
});