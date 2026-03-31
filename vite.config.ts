import { defineConfig as defineViteConfig, loadEnv, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const viteConfig = defineViteConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProductionBuild = mode === 'production';
  const hasSentryAuth =
    !!env.SENTRY_AUTH_TOKEN && !!env.SENTRY_ORG && !!env.SENTRY_PROJECT;
  const plugins = [react()];

  if (isProductionBuild && hasSentryAuth) {
    plugins.push(
      sentryVitePlugin({
        authToken: env.SENTRY_AUTH_TOKEN,
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        telemetry: false,
        sourcemaps: {
          filesToDeleteAfterUpload: 'dist/**/*.map',
        },
      }),
    );
  }

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins,
    build: {
      sourcemap: isProductionBuild ? 'hidden' : false,
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
          changeOrigin: true,
          ws: true,
        },
      },
      port: 3000,
    },
  };
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
  },
});

export default defineViteConfig((configEnv) => {
  return mergeConfig(viteConfig(configEnv), vitestConfig);
});
