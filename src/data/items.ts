import type { AssetKey, ItemId } from '../types/game';

export const ITEMS: Record<ItemId, { name: string; description: string; sprite: AssetKey }> = {
  gifts: { name: 'Спасённые подарки', description: '19 штук. Пересчитано лично.', sprite: 'item.giftRed' },
  cake: { name: 'Праздничный торт', description: 'Шедевр. Или преступление. Зависит от рецепта.', sprite: 'room.cake' },
  candles: { name: '19 свечей', description: 'Потушены. Желание загадано.', sprite: 'candles.out' },
  goldenKey: { name: 'Золотой ключ', description: 'Открывает что-то очень важное.', sprite: 'item.key' },
  partyKit: { name: 'Праздничный набор', description: 'Шарики, гирлянда, колонка, хлопушка. Всё живое.', sprite: 'party.balloon' },
  lavenderRaf: { name: '☕ Лавандовый Раф²', description: 'Секретная ультимативная атака против Макаки.', sprite: 'coffee.ready' },
  chest: { name: 'Украденный сундук', description: 'Макака уронила. Внутри что-то легендарное.', sprite: 'chest.closed' },
  stickerPack: { name: 'РАФИНИ.EXE ♡', description: 'Легендарный стикерпак.', sprite: 'chest.open' },
};
