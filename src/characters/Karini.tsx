import type { AssetKey, KariniEmotion } from '../types/game';
import { Sprite } from '../components/Sprite';

/** Карини. Каждая эмоция — отдельный спрайт characters/karini/<emotion>.png */
export function Karini({ emotion = 'idle', size = 160, className = '', idle = true }: {
  emotion?: KariniEmotion; size?: number; className?: string; idle?: boolean;
}) {
  return (
    <Sprite
      key={emotion}
      asset={`karini.${emotion}` as AssetKey}
      fallback={emotion === 'party' ? 'karini.happy' : 'karini.idle'}
      w={size}
      h={size}
      className={`char char-karini ${idle ? 'anim-bob' : ''} anim-pop ${className}`}
      alt={`Карини (${emotion})`}
    />
  );
}
