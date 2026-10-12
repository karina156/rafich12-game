import manifest from '../data/assets.manifest.json';
import type { AssetKey } from '../types/game';

export interface AssetDef {
  path: string;
  label: string;
  figma: string;
  usedIn: string;
  tint: string;
  optional?: boolean;
}

export const ASSETS = manifest.assets as Record<AssetKey, AssetDef>;

/** URL файла из public/assets с учётом base (работает и в подпапке хостинга) */
export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}assets/${path}`;

export const assetDef = (key: AssetKey): AssetDef => ASSETS[key];

/* ---- кэш загрузки: чтобы знать, есть файл или нужна заглушка ---- */

type Status = 'loading' | 'ok' | 'missing';
const status = new Map<string, Status>();
const listeners = new Map<string, Set<() => void>>();
const images = new Map<string, HTMLImageElement>();

export function probeImage(url: string): Status {
  const s = status.get(url);
  if (s) return s;
  status.set(url, 'loading');
  const img = new Image();
  // держим ссылку на картинку и ждём decode(): тогда она показывается сразу, без «проявления»
  images.set(url, img);
  img.onload = () => {
    const ok = () => setStatus(url, 'ok');
    if (img.decode) img.decode().then(ok, ok); else ok();
  };
  img.onerror = () => setStatus(url, 'missing');
  img.src = url;
  return 'loading';
}

function setStatus(url: string, s: Status) {
  status.set(url, s);
  listeners.get(url)?.forEach((fn) => fn());
}

export function subscribeImage(url: string, fn: () => void): () => void {
  let set = listeners.get(url);
  if (!set) listeners.set(url, (set = new Set()));
  set.add(fn);
  return () => set!.delete(fn);
}

export const imageStatus = (url: string): Status => status.get(url) ?? probeImage(url);

/** Список URL стикеров: sticker_01.png … sticker_NN.png */
export const stickerUrls = (): string[] => {
  const { folder, max } = manifest.stickers;
  return Array.from({ length: max }, (_, i) => assetUrl(`${folder}/sticker_${String(i + 1).padStart(2, '0')}.png`));
};
