import path from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';

const root = __dirname;
const r = (...p: string[]) => path.resolve(root, ...p);

/**
 * Both Next apps use the `@/*` alias for their own root. Resolve it relative to
 * the importing file so that admin and web code can both be loaded in the same
 * Vitest process (needed by the cross-app integration tests).
 */
function nextAppAlias(): Plugin {
  return {
    name: 'mirage-next-app-alias',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.startsWith('@/') || !importer) return null;
      const normalized = importer.replace(/\\/g, '/');
      const appRoot = normalized.includes('/apps/web/') ? r('apps/web') : r('apps/admin');
      return this.resolve(path.join(appRoot, source.slice(2)), importer, { skipSelf: true });
    },
  };
}

const workspaceAlias = {
  '@mirage/ui': r('packages/ui/src/index.ts'),
  '@mirage/types': r('packages/types/src/index.ts'),
  '@mirage/utils': r('packages/utils/src/index.ts'),
  '@mirage/config': r('packages/config/src/index.ts'),
  '@mirage/db/auth-token': r('packages/db/src/server/auth-token.ts'),
  '@mirage/db/server': r('packages/db/src/server/index.ts'),
  '@mirage/db': r('packages/db/src/index.ts'),
};

const shared = {
  plugins: [nextAppAlias(), react()],
  resolve: { alias: workspaceAlias },
};

const baseTest = {
  environment: 'jsdom',
  setupFiles: [r('tests/setup.ts')],
  css: false,
  restoreMocks: true,
  testTimeout: 30000,
};

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'text', 'json-summary', 'html'],
      reportsDirectory: r('coverage'),
      include: [
        'packages/db/src/**',
        'packages/ui/src/**',
        'packages/utils/src/**',
        'apps/admin/app/**',
        'apps/admin/components/**',
        'apps/admin/middleware.ts',
        'apps/web/app/products/**',
        'apps/web/components/products/**',
      ],
    },
    projects: [
      {
        ...shared,
        test: { ...baseTest, name: 'packages', include: ['packages/**/__tests__/**/*.test.{ts,tsx}'] },
      },
      {
        ...shared,
        test: { ...baseTest, name: 'admin', include: ['apps/admin/__tests__/**/*.test.{ts,tsx}'] },
      },
      {
        ...shared,
        test: { ...baseTest, name: 'web', include: ['apps/web/__tests__/**/*.test.{ts,tsx}'] },
      },
      {
        ...shared,
        test: {
          ...baseTest,
          name: 'integration',
          include: ['tests/integration/**/*.test.{ts,tsx}'],
        },
      },
    ],
  },
});
