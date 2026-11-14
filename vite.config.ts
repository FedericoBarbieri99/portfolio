import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    // three.js is one lazy chunk (src/diorama-scene.ts, loaded when the closing band is near); it is expected to be the big one
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: { en: 'index.html', it: 'it/index.html' },
    },
  },
});
