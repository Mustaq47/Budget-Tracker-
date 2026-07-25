import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'www',
    rollupOptions: {
      input: 'budtrack_app.html'
    }
  },
  server: {
    port: 5173,
    open: '/budtrack_app.html'
  }
});
