import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.VITE_BASE_URL || '/',
  server: {
    port: Number(process.env.VITE_PORT || 5173),
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.js'],
    coverage: {
      reporter: ['text', 'html'],
      provider: 'v8',
    },
  },
});
