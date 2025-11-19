/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_AUTHORIZATION_TOKEN: string;
  readonly VITE_CONTENT_SERVICE_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
