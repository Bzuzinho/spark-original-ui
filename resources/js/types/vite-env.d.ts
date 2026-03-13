/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_SPORTS_USE_MOCK?: string;
  readonly VITE_SPORTS_FALLBACK_ON_ERROR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
