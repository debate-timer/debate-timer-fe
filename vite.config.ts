import { defineConfig as defineViteConfig, loadEnv, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

const viteConfig = defineViteConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      electron([
        {
          entry: './electron/main.ts',
          vite: {
            build: {
              outDir: 'dist-electron',
              rollupOptions: {
                output: {
                  format: 'cjs',
                },
              },
            },
          },
        },
        {
          entry: './electron/preload.ts',
          vite: {
            build: {
              outDir: 'dist-electron',
              rollupOptions: {
                output: {
                  format: 'cjs',
                },
              },
            },
          },
          onstart(options) {
            options.reload();
          },
        },
      ]),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
          changeOrigin: true,
          ws: true,
        },
      },
    },
    base: './',
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
