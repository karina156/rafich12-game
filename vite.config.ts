import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — чтобы собранную игру можно было открыть из любой подпапки хостинга
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true },
  build: { assetsDir: 'bundle' },
});
