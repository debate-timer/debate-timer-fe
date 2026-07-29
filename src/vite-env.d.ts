/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_API: string;
  readonly VITE_BASE_PATH: string;
  readonly VITE_MAINTENANCE_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
