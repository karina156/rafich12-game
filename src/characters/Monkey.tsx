import type { AssetKey, MonkeyEmotion } from '../types/game';
import { Sprite } from '../components/Sprite';

/** Макака. Эмоции: laugh, angry, shocked, banana, gift, crying */
export function Monkey({ emotion = 'laugh', size = 160, className = '', idle = true, flip }: {
  emotion?: MonkeyEmotion; size?: number; className?: string; idle?: boolean; flip?: boolean;
}) {
  return (
    <Sprite
      key={emotion}
      asset={`monkey.${emotion}` as AssetKey}
      fallback="monkey.laugh"
      w={size}
      h={size}
      flip={flip}
      className={`char char-monkey ${idle ? 'anim-bob-fast' : ''} anim-pop ${className}`}
      alt={`Макака (${emotion})`}
    />
  );
}
