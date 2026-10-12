import { useSyncExternalStore, type CSSProperties } from 'react';
import type { AssetKey } from '../types/game';
import { assetDef, assetUrl, imageStatus, subscribeImage } from '../utils/assets';

interface Props {
  asset: AssetKey;
  /** Если основного файла нет — попробовать этот */
  fallback?: AssetKey;
  w: number;
  h: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  /** Отразить по горизонтали */
  flip?: boolean;
}

function useImage(url: string) {
  return useSyncExternalStore(
    (cb) => subscribeImage(url, cb),
    () => imageStatus(url),
  );
}

/**
 * Пиксельный спрайт из public/assets. Пропорции сохраняются (object-fit: contain),
 * масштабирование без размытия. Если файла ещё нет — честная подписанная заглушка
 * с путём, куда положить PNG.
 */
export function Sprite({ asset, fallback, w, h, className = '', style, alt, flip }: Props) {
  const def = assetDef(asset);
  const url = assetUrl(def.path);
  const st = useImage(url);
  const fbDef = fallback ? assetDef(fallback) : null;
  const fbUrl = fbDef ? assetUrl(fbDef.path) : url;
  const fbSt = useImage(fbUrl);

  const box: CSSProperties = { width: w, height: h, ...style };
  const cls = `sprite ${flip ? 'flip' : ''} ${className}`;

  if (st === 'ok' || (st === 'missing' && fbDef && fbSt === 'ok')) {
    return (
      <img
        src={st === 'ok' ? url : fbUrl}
        alt={alt ?? def.label}
        className={cls}
        style={box}
        draggable={false}
      />
    );
  }
  if (st === 'loading') return <span className={cls} style={box} aria-hidden />;

  const small = Math.min(w, h) < 56;
  return (
    <span
      className={`${cls} sprite-missing`}
      style={{ ...box, ['--tint' as string]: def.tint }}
      title={`Нет файла: public/assets/${def.path}`}
      role="img"
      aria-label={alt ?? def.label}
    >
      <span className="sprite-missing-label">{small ? def.label.slice(0, 10) : def.label}</span>
      {!small && <span className="sprite-missing-path">{def.path}</span>}
    </span>
  );
}
