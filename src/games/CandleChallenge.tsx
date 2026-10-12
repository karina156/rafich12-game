import { useEffect, useRef, useState } from 'react';
import type { LevelApi } from '../components/LevelShell';
import { useGame } from '../store/gameStore';
import { useTimers } from '../hooks/useTimers';
import { Sprite } from '../components/Sprite';
import { PixelButton } from '../components/PixelButton';
import { ProgressBar } from '../components/ProgressBar';
import { Monkey } from '../characters/Monkey';
import { Karini } from '../characters/Karini';
import { rand } from '../utils/random';
import { sound } from '../audio/sound';

const TOTAL = 19;
/** unlit — ещё не зажжена, lit — горит, extinguished — дымок (вот-вот вспыхнет снова),
 *  relit — искрящаяся, тушится только с двух нажатий, out — потушена окончательно */
type CandleState = 'unlit' | 'lit' | 'extinguished' | 'relit' | 'out';
const CANDLE_ASSET = { unlit: 'candles.unlit', lit: 'candles.lit', extinguished: 'candles.out', relit: 'candles.relit', out: 'candles.unlit' } as const;
const RELIT_TAPS = 2;

interface Hidden { id: number; x: number; y: number }

/** Позиции 19 свечей на верхушке торта (в % от блока торта): 10 сзади, 9 спереди со сдвигом */
const CANDLE_POS = Array.from({ length: TOTAL }, (_, i) => {
  const back = i < 10;
  const n = back ? 10 : 9;
  const j = back ? i : i - 10;
  const t = (j + 0.5) / n;
  const arc = Math.sin(t * Math.PI);
  return back
    ? { x: 17 + t * 66, y: 27 - arc * 2, z: 1, s: 0.9 }
    : { x: 21 + t * 58, y: 33 + arc * 1.5, z: 2, s: 1 };
});

export function CandleChallenge({ onWin }: LevelApi) {
  const char = useGame((s) => s.selectedCharacter);
  const timers = useTimers();
  const [stage, setStage] = useState<'find' | 'blow' | 'wish'>('find');

  /* ---------- этап 1: найди свечи ---------- */
  const [found, setFound] = useState(0);
  const [hidden, setHidden] = useState<Hidden[]>([]);
  const seq = useRef(1);
  const life = char === 'cute' || char === 'grandpa' ? 4600 : 3600;

  useEffect(() => {
    if (stage !== 'find') return;
    const spawn = () => {
      const id = seq.current++;
      setHidden((h) => (h.length >= 3 ? h : [...h, { id, x: rand(8, 92), y: rand(12, 88) }]));
      timers.after(life, () => setHidden((h) => h.filter((c) => c.id !== id)));
    };
    spawn(); spawn();
    const iv = timers.every(900, spawn);
    return () => timers.clear(iv);
  }, [stage, timers, life]);

  const collect = (id: number) => {
    setHidden((h) => h.filter((c) => c.id !== id));
    sound.play('gift_collect');
    setFound((f) => {
      if (f >= TOTAL) return f;
      const n = f + 1;
      if (n >= TOTAL) timers.after(600, () => setStage('blow'));
      return n;
    });
  };

  /* ---------- этап 2: задуй свечи ---------- */
  const [candles, setCandles] = useState<CandleState[]>(() => Array(TOTAL).fill('unlit'));
  const [blowReady, setBlowReady] = useState(false);
  const [monkeyMsg, setMonkeyMsg] = useState<string | null>(null);
  const relights = useRef(0);
  const [smoke, setSmoke] = useState<{ id: number; i: number }[]>([]);
  const smokeSeq = useRef(1);
  const maxRelights = char === 'cute' ? 3 : 5;
  const maxTricks = char === 'cute' ? 3 : 5;
  const tricks = useRef(0);
  const relitHits = useRef<number[]>(Array(TOTAL).fill(0));
  const [hit, setHit] = useState<{ i: number; n: number } | null>(null);
  const candlesRef = useRef(candles);
  candlesRef.current = candles;

  useEffect(() => {
    if (stage !== 'blow') return;
    for (let i = 0; i < TOTAL; i++) {
      timers.after(400 + i * 70, () => setCandles((c) => c.map((v, j) => (j === i ? 'lit' : v))));
    }
    timers.after(400 + TOTAL * 70 + 200, () => setBlowReady(true));
  }, [stage, timers]);

  useEffect(() => {
    if (stage !== 'blow' || !blowReady) return;
    const tick = () => {
      const c = candlesRef.current;
      const out = c.map((v, i) => (v === 'out' ? i : -1)).filter((i) => i >= 0);
      const lit = c.filter((v) => v === 'lit' || v === 'relit').length;
      // зажигает обратно не чаще раза в несколько секунд и не больше maxRelights раз
      if (relights.current < maxRelights && out.length >= 3 && lit > 0) {
        const i = out[Math.floor(Math.random() * out.length)];
        relights.current += 1;
        relitHits.current[i] = 0;
        setCandles((cs) => cs.map((v, j) => (j === i ? 'relit' : v)));
        setMonkeyMsg('УААА, Я ВКЛЮЧИЛА ИХ ОБРАТНО.');
        sound.play('monkey_laugh');
        timers.after(1600, () => setMonkeyMsg(null));
      }
      timers.after(rand(3500, 5500), tick);
    };
    const first = timers.after(3000, tick);
    return () => timers.clear(first);
  }, [stage, blowReady, timers, maxRelights]);

  const putOut = (i: number) => {
    const sid = smokeSeq.current++;
    setSmoke((s) => [...s, { id: sid, i }]);
    timers.after(900, () => setSmoke((s) => s.filter((x) => x.id !== sid)));
    const next = candlesRef.current.map((v, j) => (j === i ? 'out' : v)) as CandleState[];
    candlesRef.current = next;
    setCandles(next);
    if (next.every((v) => v === 'out')) {
      timers.clearAll();
      timers.after(700, () => { setStage('wish'); sound.playBirthdaySong(); });
    }
  };

  const blow = (i: number) => {
    if (!blowReady) return;
    const c = candlesRef.current[i];
    if (c === 'relit') {
      // искрящуюся свечу тушим с двух нажатий
      relitHits.current[i] += 1;
      sound.play('candle_blow');
      if (relitHits.current[i] < RELIT_TAPS) { setHit({ i, n: Date.now() }); timers.after(350, () => setHit(null)); return; }
      relitHits.current[i] = 0;
      putOut(i);
      return;
    }
    if (c !== 'lit') return;
    sound.play('candle_blow');
    const burning = candlesRef.current.filter((v) => v === 'lit' || v === 'relit').length;
    // иногда свеча только дымит, а потом вспыхивает снова — уже искрящейся
    if (burning > 1 && tricks.current < maxTricks && Math.random() < 0.3) {
      tricks.current += 1;
      const next = candlesRef.current.map((v, j) => (j === i ? 'extinguished' : v)) as CandleState[];
      candlesRef.current = next;
      setCandles(next);
      timers.after(900, () => {
        relitHits.current[i] = 0;
        setCandles((cs) => cs.map((v, j) => (j === i && v === 'extinguished' ? 'relit' : v)));
      });
      return;
    }
    putOut(i);
  };

  const litCount = candles.filter((v) => v === 'lit' || v === 'relit').length;

  if (stage === 'find') {
    return (
      <div className="candles">
        <div className="game-hud">
          <span className="gh-big">🕯 {found}/{TOTAL}</span>
          <span className="muted">Свечи мелькают по всей комнате — тапай по ним!</span>
        </div>
        <ProgressBar value={found} max={TOTAL} color="var(--yellow)" />
        <div className="candle-field">
          {hidden.map((h) => (
            <button key={h.id} className="hidden-candle anim-pop" style={{ left: `${h.x}%`, top: `${h.y}%` }} onClick={() => collect(h.id)} aria-label="Свеча">
              <Sprite asset="item.candle" w={44} h={64} />
            </button>
          ))}
          <div className="candle-monkey"><Monkey emotion="laugh" size={90} /></div>
        </div>
      </div>
    );
  }

  if (stage === 'blow') {
    return (
      <div className="candles">
        <div className="game-hud">
          <span className="gh-big">🔥 горит: {litCount}</span>
          <span className="muted">Нажимай на горящие свечи. Искрящиеся тушатся с двух раз!</span>
        </div>
        <div className="blow-stage">
          <Sprite asset="fx.sparkle" w={70} h={88} className="blow-sparkle blow-sparkle-l" />
          <Sprite asset="fx.sparkle" w={56} h={70} className="blow-sparkle blow-sparkle-r" />
          <div className={`blow-cake ${litCount > 0 ? 'is-lit' : ''}`}>
            <div className="blow-glow" style={{ opacity: litCount / TOTAL }} />
            <Sprite asset="candles.cake" w={320} h={244} className="blow-cake-img" />
            {CANDLE_POS.map((p, i) => (
              <button
                key={i}
                className={`candle candle-${candles[i]}${hit?.i === i ? ' candle-hit' : ''}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: p.z + 1 }}
                onClick={() => blow(i)}
                aria-label={`Свеча ${i + 1}`}
              >
                <Sprite asset={CANDLE_ASSET[candles[i]]} w={24 * p.s} h={54 * p.s} />
              </button>
            ))}
            {smoke.map((s) => (
              <span key={s.id} className="candle-smoke" style={{ left: `${CANDLE_POS[s.i].x}%`, top: `${CANDLE_POS[s.i].y - 16}%` }}>
                <Sprite asset="fx.smoke" w={34} h={32} />
              </span>
            ))}
          </div>
          {monkeyMsg && (
            <div className="blow-monkey anim-enter-right">
              <Monkey emotion="laugh" size={100} />
              <span className="speech">{monkeyMsg}</span>
            </div>
          )}
          {monkeyMsg && (
            <div className="blow-karini anim-enter-left">
              <Karini emotion="crying" size={90} />
              <span className="speech">РАФИК, У НАС БЕСКОНЕЧНЫЕ СВЕЧИ, ПОМОГИ.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wish">
      <div className="wish-stars">{Array.from({ length: 30 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 7) * 0.3}s` }}>✦</i>
      ))}</div>
      <div className="wish-card anim-fade">
        <h1 className="wish-title">MAKE A WISH ✨</h1>
        <p>Тебе исполнилось 19. Загадай желание. Пусть оно обязательно сбудется.</p>
        <p className="muted">P.S. Если загадал миллион долларов, я тоже не против.</p>
        <PixelButton size="lg" variant="pink" onClick={() => onWin()}>ЖЕЛАНИЕ ЗАГАДАНО</PixelButton>
      </div>
    </div>
  );
}
