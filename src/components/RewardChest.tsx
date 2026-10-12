import { useState } from 'react';
import { Sprite } from './Sprite';
import { sound } from '../audio/sound';
import { useTimers } from '../hooks/useTimers';

type ChestState = 'closed' | 'half' | 'open';

/** Сундук: смена трёх спрайтов + сияние + частицы */
export function RewardChest({ onOpened, size = 220 }: { onOpened: () => void; size?: number }) {
  const [state, setState] = useState<ChestState>('closed');
  const [busy, setBusy] = useState(false);
  const timers = useTimers();

  const open = () => {
    if (busy || state !== 'closed') return;
    setBusy(true);
    sound.play('chest_open');
    timers.after(500, () => setState('half'));
    timers.after(1300, () => {
      setState('open');
      sound.play('final_reward');
    });
    timers.after(2300, onOpened);
  };

  const asset = state === 'closed' ? 'chest.closed' : state === 'half' ? 'chest.half' : 'chest.open';
  return (
    <button className={`chest chest-${state} ${busy && state === 'closed' ? 'anim-shake' : ''}`} onClick={open} aria-label="Открыть сундук">
      {state !== 'closed' && <span className="chest-glow" />}
      {state === 'open' && (
        <span className="chest-sparkles">
          {Array.from({ length: 16 }, (_, i) => <i key={i} style={{ ['--a' as string]: `${i * 22.5}deg`, animationDelay: `${(i % 4) * 0.08}s` }}>✦</i>)}
        </span>
      )}
      <Sprite asset={asset} w={size} h={size} className="chest-sprite" />
      {state === 'closed' && <span className="chest-hint anim-blink">НАЖМИ, ЧТОБЫ ОТКРЫТЬ</span>}
    </button>
  );
}
