import type { AssetKey, LevelId } from '../types/game';

/**
 * Раскладка комнаты в логических пикселях сцены 960×540.
 * Когда придут PNG из Figma, координаты подгоняются здесь — компоненты трогать не нужно.
 * z — порядок наложения (больше = ближе к зрителю).
 */
export interface RoomObject {
  id: string;
  asset: AssetKey;
  x: number; y: number; w: number; h: number; z: number;
  /** Какой уровень запускает клик */
  level?: LevelId;
  /** Когда объект показывается */
  /** Только зона клика без картинки (объект уже нарисован на фоне комнаты) */
  zone?: boolean;
  when?: 'always' | 'giftRain' | 'cake' | 'candles' | 'partyChaos' | 'notPartyChaos' | 'boss';
}

export const ROOM_SIZE = { w: 960, h: 540 };

export const ROOM_OBJECTS: RoomObject[] = [
  // окно и дверь нарисованы на самой комнате (room_shell), здесь только зоны клика
  { id: 'window', asset: 'room.window', x: 285, y: 62, w: 205, h: 150, z: 2, level: 'giftRain', zone: true },
  { id: 'door', asset: 'room.door', x: 578, y: 88, w: 110, h: 177, z: 2, level: 'boss', zone: true },
  { id: 'rug', asset: 'room.rug', x: 360, y: 318, w: 250, h: 132, z: 1 },
  { id: 'garlandOff', asset: 'room.garlandOff', x: 515, y: 26, w: 250, h: 62, z: 6, when: 'notPartyChaos' },
  { id: 'garlandOn', asset: 'room.garlandOn', x: 515, y: 22, w: 250, h: 70, z: 6, when: 'partyChaos' },
  { id: 'banner', asset: 'room.banner', x: 270, y: 22, w: 235, h: 95, z: 5, when: 'partyChaos' },
  { id: 'wardrobe', asset: 'room.wardrobe', x: 166, y: 176, w: 100, h: 170, z: 3 },
  { id: 'desk', asset: 'room.desk', x: 298, y: 196, w: 152, h: 109, z: 4, level: 'cake' },
  { id: 'monitor', asset: 'room.monitor', x: 314, y: 158, w: 70, h: 53, z: 5 },
  { id: 'coffee', asset: 'room.coffee', x: 400, y: 176, w: 40, h: 37, z: 5 },
  { id: 'chair', asset: 'room.chair', x: 346, y: 262, w: 58, h: 94, z: 6 },
  { id: 'lamp', asset: 'room.lamp', x: 500, y: 148, w: 54, h: 122, z: 3 },
  { id: 'balloonsBroken', asset: 'room.balloonsBroken', x: 700, y: 196, w: 52, h: 74, z: 4, when: 'notPartyChaos', level: 'partyChaos' },
  { id: 'balloons', asset: 'room.balloons', x: 690, y: 120, w: 84, h: 155, z: 4, when: 'partyChaos', level: 'partyChaos' },
  { id: 'bed', asset: 'room.bed', x: 676, y: 262, w: 118, h: 182, z: 5 },
  { id: 'partyHat', asset: 'room.partyHat', x: 730, y: 262, w: 34, h: 52, z: 6, when: 'partyChaos' },
  { id: 'cakeStand', asset: 'room.cakeStand', x: 548, y: 292, w: 108, h: 85, z: 6 },
  { id: 'cake', asset: 'room.cake', x: 570, y: 246, w: 64, h: 64, z: 7, when: 'cake', level: 'candles' },
  { id: 'candles', asset: 'room.candles', x: 626, y: 268, w: 28, h: 30, z: 8, when: 'candles' },
  { id: 'confetti', asset: 'room.confetti', x: 420, y: 420, w: 110, h: 57, z: 2, when: 'partyChaos' },
  { id: 'boxes', asset: 'room.boxes', x: 172, y: 372, w: 126, h: 96, z: 9, level: 'findGift' },
  { id: 'gifts', asset: 'room.gifts', x: 610, y: 400, w: 130, h: 71, z: 9, when: 'giftRain' },
  { id: 'chest', asset: 'chest.closed', x: 318, y: 380, w: 86, h: 86, z: 10, when: 'boss' },
];

/** Где стоит Карини в комнате */
export const KARINI_SPOT = { x: 440, y: 250, size: 150 };
