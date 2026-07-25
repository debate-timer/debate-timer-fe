/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_API: string;
  readonly VITE_BASE_PATH: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_ENABLE_SENTRY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
