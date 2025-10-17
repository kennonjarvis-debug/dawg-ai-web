import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@dawg-ai/design-system': path.resolve(__dirname, '../../packages/design-system/src'),
      '@dawg-ai/audio-engine': path.resolve(__dirname, '../../packages/audio-engine/src'),
      '@dawg-ai/track-manager': path.resolve(__dirname, '../../packages/track-manager/src'),
      '@dawg-ai/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
  publicDir: 'public',
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
