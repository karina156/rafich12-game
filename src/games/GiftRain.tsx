import { useRef, useState } from 'react';
import type { LevelApi } from '../components/LevelShell';
import { useGame } from '../store/gameStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { useHeldKeys } from '../hooks/useKeys';
import { Sprite } from '../components/Sprite';
import { Monkey } from '../characters/Monkey';
import { Karini } from '../characters/Karini';
import { ProgressBar } from '../components/ProgressBar';
import { clamp, pick, rand } from '../utils/random';
import { sound } from '../audio/sound';
import type { AssetKey, KariniEmotion, MonkeyEmotion } from '../types/game';

type Kind = 'gift' | 'sock' | 'banana' | 'star';
interface Item { id: number; kind: Kind; asset: AssetKey; x: number; y: number; vy: number; spin: number }
interface Float { id: number; x: number; y: number; text: string; good: boolean; t: number }

const GOAL = 19;
const GIFTS: AssetKey[] = ['item.giftRed', 'item.giftBlue', 'item.giftPurple', 'item.giftYellow'];
const BASKET_HALF = 0.09;
const CATCH_Y = 0.86;

const REACTIONS: Record<Kind, { k: [string, KariniEmotion][]; m?: [string, MonkeyEmotion] }> = {
  gift: { k: [['ЕСТЬ!', 'happy'], ['ДАВАЙ, Я В ТЕБЯ ВЕРЮ', 'happy'], ['ТЫ ЧЁ, КИБЕРСПОРТСМЕН?', 'shocked']] },
  star: { k: [['ЗВЕЗДА! +2 СЕКУНДЫ', 'happy']] },
  sock: { k: [['НОСОК?? РАФИК 😭', 'crying'], ['ЗАЧЕМ ТЕБЕ НОСОК', 'angry']], m: ['АХАХА НОСОЧЕК', 'laugh'] },
  banana: { k: [['Я ЖЕ ГОВОРИЛА, НЕ ЛОВИ БАНАНЫ', 'angry']], m: ['ХИ-ХИ, БАНАН ТВОЙ', 'banana'] },
};

export function GiftRain({ onWin, onFail }: LevelApi) {
  const char = useGame((s) => s.selectedCharacter);
  const unlockAchievement = useGame((s) => s.unlockAchievement);
  const timeLimit = 60 + (char === 'worker' ? 8 : 0);
  const speedMul = char === 'grandpa' ? 0.8 : 1;
  const giftChance = char === 'sigma' ? 0.66 : 0.56;

  const field = useRef<HTMLDivElement>(null);
  const g = useRef({
    items: [] as Item[], floats: [] as Float[], seq: 1, spawnIn: 0.6,
    basket: 0.5, target: 0.5, stun: 0, keys: { l: false, r: false },
    gifts: 0, score: 0, socks: 0, time: timeLimit, monkeyX: 0.5, monkeyDir: 1, over: false,
  });
  const [, setFrame] = useState(0);
  const [karini, setKarini] = useState<[string, KariniEmotion]>(['ЛОВИ ПОДАРКИ!', 'idle']);
  const [monkey, setMonkey] = useState<[string, MonkeyEmotion]>(['ЛОВИ, ИМЕНИННИК', 'laugh']);
  const lastReact = useRef(0);
  const heldKeys = useHeldKeys();

  const react = (kind: Kind) => {
    const now = performance.now();
    if (now - lastReact.current < 900 && kind === 'gift') return;
    lastReact.current = now;
    const r = REACTIONS[kind];
    setKarini(pick(r.k));
    if (r.m) setMonkey(r.m);
  };

  useGameLoop((dt) => {
    const s = g.current;
    if (s.over) return;
    s.time -= dt;
    if (s.time <= 0) {
      s.over = true;
      onFail(`Время вышло: поймано ${s.gifts}/${GOAL} подарков. Макака довольна.`);
      return;
    }

    // корзина
    const held = heldKeys.current;
    if (held.has('ArrowLeft') || held.has('a') || held.has('ф')) s.target = clamp(s.target - dt * 1.2, BASKET_HALF, 1 - BASKET_HALF);
    if (held.has('ArrowRight') || held.has('d') || held.has('в')) s.target = clamp(s.target + dt * 1.2, BASKET_HALF, 1 - BASKET_HALF);
    if (s.keys.l) s.target = clamp(s.target - dt * 1.2, BASKET_HALF, 1 - BASKET_HALF);
    if (s.keys.r) s.target = clamp(s.target + dt * 1.2, BASKET_HALF, 1 - BASKET_HALF);
    if (s.stun > 0) s.stun -= dt;
    else s.basket += (s.target - s.basket) * Math.min(1, dt * 14);

    // макака бегает по верху
    s.monkeyX += s.monkeyDir * dt * 0.25;
    if (s.monkeyX > 0.88 || s.monkeyX < 0.12) s.monkeyDir *= -1;

    // спавн
    s.spawnIn -= dt;
    if (s.spawnIn <= 0) {
      const progress = 1 - s.time / timeLimit;
      s.spawnIn = rand(0.6, 0.9) - progress * 0.2;
      const r = Math.random();
      const kind: Kind = r < giftChance ? 'gift' : r < giftChance + 0.13 ? 'sock' : r < 0.94 ? 'banana' : 'star';
      const asset: AssetKey = kind === 'gift' ? pick(GIFTS) : kind === 'sock' ? 'item.sock' : kind === 'banana' ? 'item.banana' : 'item.star';
      s.items.push({
        id: s.seq++, kind, asset,
        x: clamp(s.monkeyX + rand(-0.15, 0.15), 0.06, 0.94), y: 0.08,
        vy: (0.26 + progress * 0.16 + rand(0, 0.08)) * speedMul * (kind === 'star' ? 1.3 : 1),
        spin: rand(-90, 90),
      });
      if (kind === 'banana') setMonkey(['ЛОВИ БАНАНЧИК', 'banana']);
    }

    // движение и ловля
    const keep: Item[] = [];
    for (const it of s.items) {
      it.y += it.vy * dt;
      if (it.y >= CATCH_Y && it.y < CATCH_Y + 0.08 && Math.abs(it.x - s.basket) < BASKET_HALF + 0.01) {
        catchItem(it);
        continue;
      }
      if (it.y < 1.08) keep.push(it);
    }
    s.items = keep;
    s.floats = s.floats.filter((f) => (f.t -= dt) > 0);
    setFrame((f) => f + 1);

    function catchItem(it: Item) {
      const f = (text: string, good: boolean) => s.floats.push({ id: s.seq++, x: it.x, y: CATCH_Y - 0.06, text, good, t: 0.9 });
      if (it.kind === 'gift') {
        s.gifts += 1; s.score += 10; f('+1 🎁', true); sound.play('gift_collect');
        if (s.gifts >= GOAL) { s.over = true; onWin(); }
      } else if (it.kind === 'star') {
        s.score += 25; s.time = Math.min(timeLimit, s.time + 2); f('+25 ★', true); sound.play('gift_collect');
      } else if (it.kind === 'sock') {
        s.score = Math.max(0, s.score - 15); s.socks += 1; f('−15 носок', false); sound.play('wrong_item');
        if (s.socks === 3) unlockAchievement('sockMagnate');
      } else {
        s.score = Math.max(0, s.score - 10); s.stun = 0.5; f('−10 банан!', false); sound.play('wrong_item');
      }
      react(it.kind);
    }
  }, true);

  const setTargetFromEvent = (clientX: number) => {
    const el = field.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    g.current.target = clamp((clientX - r.left) / r.width, BASKET_HALF, 1 - BASKET_HALF);
  };

  const s = g.current;
  return (
    <div className="gr">
      <div className="game-hud">
        <span className="gh-big">🎁 {s.gifts}/{GOAL}</span>
        <span className={`gh-time ${s.time < 10 ? 'danger anim-blink' : ''}`}>⏱ {Math.ceil(s.time)}</span>
        <span>★ {s.score}</span>
        <span className="muted">носки: {s.socks}</span>
      </div>
      <ProgressBar value={s.gifts} max={GOAL} color="var(--heart)" />
      <div
        ref={field}
        className="gr-field"
        onPointerDown={(e) => setTargetFromEvent(e.clientX)}
        onPointerMove={(e) => setTargetFromEvent(e.clientX)}
      >
        <div className="gr-window" />
        <div className="gr-monkey" style={{ left: `${s.monkeyX * 100}%` }}>
          <Monkey emotion={monkey[1]} size={84} idle={false} flip={s.monkeyDir < 0} />
          <span className="speech speech-small">{monkey[0]}</span>
        </div>
        {s.items.map((it) => (
          <div key={it.id} className="gr-item" style={{ left: `${it.x * 100}%`, top: `${it.y * 100}%`, transform: `translate(-50%,-50%) rotate(${it.y * it.spin}deg)` }}>
            <Sprite asset={it.asset} w={52} h={52} />
          </div>
        ))}
        {s.floats.map((f) => (
          <div key={f.id} className={`float ${f.good ? 'good' : 'bad'}`} style={{ left: `${f.x * 100}%`, top: `${(f.y - (0.9 - f.t) * 0.1) * 100}%` }}>{f.text}</div>
        ))}
        <div className={`gr-basket ${s.stun > 0 ? 'anim-shake' : ''}`} style={{ left: `${s.basket * 100}%`, top: `${CATCH_Y * 100}%` }}>
          <Sprite asset="chest.half" w={104} h={100} />
        </div>
        <div className="gr-karini">
          <Karini emotion={karini[1]} size={78} idle />
          <span className="speech speech-small">{karini[0]}</span>
        </div>
      </div>
      <div className="touch-row">
        <button className="touch-btn" onPointerDown={() => (s.keys.l = true)} onPointerUp={() => (s.keys.l = false)} onPointerLeave={() => (s.keys.l = false)}>◀</button>
        <span className="muted">води пальцем по полю или жми стрелки</span>
        <button className="touch-btn" onPointerDown={() => (s.keys.r = true)} onPointerUp={() => (s.keys.r = false)} onPointerLeave={() => (s.keys.r = false)}>▶</button>
      </div>
    </div>
  );
}
