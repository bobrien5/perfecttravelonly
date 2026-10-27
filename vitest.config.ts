import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@vacationpro/engine': path.resolve(__dirname, 'packages/engine/src/index.ts'),
      // Next aliases 'server-only'; in tests it is a no-op.
      'server-only': path.resolve(__dirname, 'node_modules/server-only/empty.js'),
    },
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
