/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SHOW_DEMO?: string;
  readonly VITE_AUTH_NETWORK_FAILURE_RATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}