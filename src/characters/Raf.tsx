import type { CharacterId } from '../types/game';
import { getCharacter } from '../data/characters';
import { useGame } from '../store/gameStore';
import { Sprite } from '../components/Sprite';

/** Рафи — выбранный вариант (или явно переданный) */
export function Raf({ id, size = 160, className = '', idle = true, flip }: {
  id?: CharacterId; size?: number; className?: string; idle?: boolean; flip?: boolean;
}) {
  const selected = useGame((s) => s.selectedCharacter);
  const def = getCharacter(id ?? selected);
  return (
    <Sprite
      asset={def.sprite}
      w={size}
      h={size}
      flip={flip}
      className={`char char-raf ${idle ? 'anim-bob' : ''} ${className}`}
      alt={def.name}
    />
  );
}
