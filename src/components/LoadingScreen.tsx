import { useEffect, useState } from 'react';
import type { AssetKey, LevelId } from '../types/game';
import { ASSETS, assetUrl, imageStatus, subscribeImage } from '../utils/assets';
import { useGame } from '../store/gameStore';
import { Karini } from '../characters/Karini';
import { ProgressBar } from './ProgressBar';

/** Какие группы картинок нужны уровню (по префиксу ключа в assets.manifest.json) */
const LEVEL_ASSETS: Record<LevelId, string[]> = {
  giftRain: ['item.', 'chest.half'],
  cake: ['cake.', 'bad.', 'item.sock'],
  candles: ['candles.', 'item.candle'],
  findGift: ['boxes.', 'item.key'],
  partyChaos: ['party.'],
  coffee: ['coffee.', 'bad.ketchup', 'item.banana'],
  boss: ['boss.', 'fx.', 'item.banana', 'chest.closed'],
};
const COMMON = ['karini.', 'monkey.', 'ui.', 'icon.'];

const PHRASES = [
  'Ой! Кажется, нужно подождать...',
  'Макака опять что-то уронила. Секунду!',
  'Надуваю шарики, не торопи меня.',
  'Ищу, куда она спрятала картинки...',
  'Почти! Ещё чуть-чуть.',
];
const MIN_MS = 1400;
const MAX_MS = 10000;

/** Картинки первых экранов: старт, заставка, выбор Рафа, комната, HUD и финальный фон */
const BOOT = ['raf.', 'karini.', 'monkey.', 'ui.', 'icon.', 'room.', 'bg.', 'final.bg', 'item.bigGift'];

function urlsFor(prefixes: string[]): string[] {
  return (Object.keys(ASSETS) as AssetKey[])
    .filter((k) => prefixes.some((p) => k === p || (p.endsWith('.') && k.startsWith(p))))
    .map((k) => assetUrl(ASSETS[k].path));
}

function assetsFor(level: LevelId, raf: string | null): string[] {
  const prefixes = [...COMMON, ...LEVEL_ASSETS[level]];
  const keys = (Object.keys(ASSETS) as AssetKey[]).filter(
    (k) => prefixes.some((p) => k === p || (p.endsWith('.') && k.startsWith(p))) && !k.startsWith('raf.'),
  );
  if (raf) keys.push(`raf.${raf}` as AssetKey);
  return keys.map((k) => assetUrl(ASSETS[k].path));
}

/** Загружает картинки уровня. Готово, когда все ответили (или вышло время), но не раньше MIN_MS. */
export function useLevelPreload(level: LevelId) {
  const raf = useGame((s) => s.selectedCharacter);
  return usePreload(`${level}:${raf}`, () => assetsFor(level, raf));
}

/** Загрузка перед самым началом игры — чтобы старт, заставка и комната открывались уже с картинками */
export function useBootPreload() {
  return usePreload('boot', () => urlsFor(BOOT));
}

function usePreload(key: string, getUrls: () => string[]) {
  const [state, setState] = useState({ done: 0, total: 1, ready: false });
  useEffect(() => {
    const urls = getUrls();
    const start = performance.now();
    let alive = true;
    const unsubs: (() => void)[] = [];
    const timers: number[] = [];
    const finish = () => alive && setState((s) => ({ ...s, done: s.total, ready: true }));
    const check = () => {
      if (!alive) return;
      const done = urls.filter((u) => imageStatus(u) !== 'loading').length;
      setState((s) => ({ ...s, done, total: urls.length }));
      if (done === urls.length) timers.push(window.setTimeout(finish, Math.max(0, MIN_MS - (performance.now() - start))));
    };
    urls.forEach((u) => unsubs.push(subscribeImage(u, check)));
    timers.push(window.setTimeout(finish, MAX_MS));
    check();
    return () => { alive = false; unsubs.forEach((f) => f()); timers.forEach((t) => window.clearTimeout(t)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

export function LoadingScreen({ done, total }: { done: number; total: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1) % PHRASES.length), 1800);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="loading-screen">
      <div className="loading-karini">
        <Karini emotion="shocked" size={170} />
        <span className="speech">{PHRASES[i]}</span>
      </div>
      <div className="loading-bar">
        <ProgressBar value={done} max={Math.max(1, total)} color="var(--pink)" label={`ЗАГРУЗКА ${Math.round((done / Math.max(1, total)) * 100)}%`} />
      </div>
    </div>
  );
}
