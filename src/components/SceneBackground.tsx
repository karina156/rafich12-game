import { useSyncExternalStore } from 'react';
import type { AssetKey } from '../types/game';
import { assetDef, assetUrl, imageStatus, subscribeImage } from '../utils/assets';

/**
 * Фон сцены из Figma. Пока файла нет — мягкий градиент из палитры (класс scene-bg-fallback),
 * без притворства, что это ассет.
 */
export function SceneBackground({ asset, className = '' }: { asset: AssetKey; className?: string }) {
  const url = assetUrl(assetDef(asset).path);
  const st = useSyncExternalStore((cb) => subscribeImage(url, cb), () => imageStatus(url));
  if (st === 'ok') return <img className={`scene-bg ${className}`} src={url} alt="" draggable={false} />;
  return <div className={`scene-bg scene-bg-fallback ${className}`} data-missing={assetDef(asset).path} />;
}
