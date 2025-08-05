import { defineConfig } from 'vite';

export default defineConfig({
  base: './',

  css: {
    devSourcemap: true
  },
  // Дополнительные dev-специфичные настройки
  server: {
    port: 3333,
    open: true
  }
});