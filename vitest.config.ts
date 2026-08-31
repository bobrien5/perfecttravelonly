import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@vacationpro/engine': path.resolve(__dirname, 'packages/engine/src/index.ts'),
    },
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
