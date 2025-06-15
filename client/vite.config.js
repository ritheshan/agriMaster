import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ALL } from 'dns';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ALL,
    open: true, // automatically open the browser
  },
});