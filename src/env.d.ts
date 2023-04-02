/// <reference types="vite/client" />

interface ImportMetaEnv {
  NODE_ENV: "development" | "production";
  AUTH_SECRET: string;
  DATABASE_URL: string;
  SHADOW_DB_URL: string;
  DECK_MAX_SIZE: number;
  USER_MAX_DECKS: number;
  PUBLIC_DECK_MAX_SIZE: number;
  PUBLIC_USER_MAX_DECKS: number;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
