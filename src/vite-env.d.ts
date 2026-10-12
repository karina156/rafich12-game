/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_TELEGRAM_STICKERPACK_URL?: string;
  readonly VITE_BIRTHDAY_DATE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
