import { useEffect, useState } from 'react';
import type { LevelApi } from '../components/LevelShell';
import { useTimers, wait } from '../hooks/useTimers';
import { Sprite } from '../components/Sprite';
import { PixelButton } from '../components/PixelButton';
import { Monkey } from '../characters/Monkey';
import { Karini } from '../characters/Karini';
import { randInt } from '../utils/random';
import { sound } from '../audio/sound';
import type { KariniEmotion, MonkeyEmotion } from '../types/game';

const ROUNDS = [
  { swaps: 4, ms: 650 },
  { swaps: 7, ms: 450 },
  { swaps: 11, ms: 320 },
];
const BOXES = 3;
const slotX = (slot: number) => 20 + slot * 30; // % от ширины

type Phase = 'ready' | 'show' | 'shuffle' | 'pick' | 'right' | 'wrong';

export function FindGift({ onWin }: LevelApi) {
  const timers = useTimers();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [slots, setSlots] = useState<number[]>([0, 1, 2]); // slots[boxId] = позиция
  const [keyBox, setKeyBox] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [arc, setArc] = useState<Record<number, 'up' | 'down'>>({});
  const [speed, setSpeed] = useState(ROUNDS[0].ms);
  const [say, setSay] = useState<{ k: [string, KariniEmotion]; m: [string, MonkeyEmotion] }>({
    k: ['Следи за коробкой с ключом!', 'idle'], m: ['ДАВАЙ, УМНИК, ИЩИ.', 'gift'],
  });

  // отмена асинхронной анимации при уходе со сцены
  const [alive] = useState(() => ({ v: true }));
  useEffect(() => () => { alive.v = false; }, [alive]);

  const play = async () => {
    const cfg = ROUNDS[round];
    setSpeed(cfg.ms);
    setPicked(null);
    const k = randInt(0, BOXES - 1);
    setKeyBox(k);
    setPhase('show');
    await wait(1400);
    if (!alive.v) return;
    setPhase('shuffle');
    setSay({ k: ['Не моргай...', 'shocked'], m: ['ХИ-ХИ-ХИ', 'laugh'] });
    await wait(350);
    let cur = [...slots];
    for (let i = 0; i < cfg.swaps; i++) {
      if (!alive.v) return;
      const a = randInt(0, BOXES - 1);
      let b = randInt(0, BOXES - 2);
      if (b >= a) b += 1;
      const sa = cur[a];
      cur = cur.map((s, id) => (id === a ? cur[b] : id === b ? sa : s));
      setArc({ [a]: 'up', [b]: 'down' });
      setSlots(cur);
      sound.play('hover');
      await wait(cfg.ms + 40);
    }
    if (!alive.v) return;
    setArc({});
    setPhase('pick');
    setSay({ k: ['Ну? Где ключ?', 'idle'], m: ['ТОЧНО НЕ ТУТ. НАВЕРНОЕ.', 'laugh'] });
  };

  const choose = (id: number) => {
    if (phase !== 'pick') return;
    setPicked(id);
    if (id === keyBox) {
      setPhase('right');
      sound.play('gift_collect');
      setSay({ k: ['ДА! ОН ПРОСТО УМНЫЙ!', 'happy'], m: ['ЧТО?!', 'shocked'] });
      timers.after(1500, () => {
        if (round + 1 >= ROUNDS.length) onWin();
        else { setRound(round + 1); setPhase('ready'); setSay({ k: [`Раунд ${round + 2}. Она ускоряется!`, 'shocked'], m: ['ТЕПЕРЬ БЫСТРЕЕ!', 'angry'] }); }
      });
    } else {
      setPhase('wrong');
      sound.play('wrong_item');
      sound.play('monkey_laugh');
      setSay({ k: ['РАФИК, ЭТО БЫЛ ТУТОРИАЛ.', 'crying'], m: ['АХАХАХАХАХ МИМО', 'laugh'] });
      timers.after(2000, () => setPhase('ready'));
    }
  };

  const boxAsset = (id: number) => {
    if ((phase === 'show' || phase === 'right' || phase === 'wrong') && id === keyBox) return 'boxes.openKey' as const;
    if (phase === 'wrong' && id === picked) return 'boxes.openEmpty' as const;
    return 'boxes.closed' as const;
  };

  return (
    <div className="find">
      <div className="game-hud">
        <span className="gh-big">РАУНД {round + 1}/{ROUNDS.length}</span>
        <span className="muted">перемешиваний: {ROUNDS[round].swaps}</span>
      </div>
      <div className="find-chars">
        <div className="find-say"><Karini emotion={say.k[1]} size={72} /><span className="speech">{say.k[0]}</span></div>
        <div className="find-say right"><span className="speech">{say.m[0]}</span><Monkey emotion={say.m[1]} size={72} /></div>
      </div>
      <div className="find-table">
        {Array.from({ length: BOXES }, (_, id) => (
          <button
            key={id}
            className={`box ${arc[id] ? `arc-${arc[id]}` : ''} ${phase === 'pick' ? 'box-pickable' : ''} ${picked === id && phase === 'wrong' ? 'anim-shake' : ''}`}
            style={{ left: `${slotX(slots[id])}%`, transitionDuration: `${speed}ms`, animationDuration: `${speed}ms` }}
            onClick={() => choose(id)}
            aria-label={`Коробка ${slots[id] + 1}`}
          >
            <Sprite asset={boxAsset(id)} fallback="boxes.closed" w={130} h={130} />
          </button>
        ))}
      </div>
      <div className="find-footer">
        {phase === 'ready' && <PixelButton size="lg" onClick={play}>{round === 0 ? 'ПОКАЗАТЬ КЛЮЧ' : 'СЛЕДУЮЩИЙ РАУНД'} ▶</PixelButton>}
        {phase === 'pick' && <div className="find-hint anim-blink">ВЫБЕРИ КОРОБКУ</div>}
        {phase === 'wrong' && <div className="find-hint">Мимо! Повторяем этот раунд.</div>}
      </div>
    </div>
  );
}
