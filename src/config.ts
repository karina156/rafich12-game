/** Ссылка на Telegram-стикерпак. Можно переопределить в файле .env (см. .env.example). */
export const TELEGRAM_STICKERPACK_URL: string =
  import.meta.env.VITE_TELEGRAM_STICKERPACK_URL || 'https://t.me/addstickers/rafini_love';

/** День рождения Рафи в формате MM-DD — для достижения «УЖЕ ДЕД». */
export const BIRTHDAY_DATE: string = import.meta.env.VITE_BIRTHDAY_DATE ?? '';

export const SAVE_KEY = 'rafich12-birthday-save-v1';

/** Сколько раз нажать на кофемашину, чтобы открыть секретный уровень. */
export const COFFEE_TAPS_TO_UNLOCK = 5;
