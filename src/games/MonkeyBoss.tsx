import { useEffect, useRef, useState } from 'react';
import type { LevelApi } from '../components/LevelShell';
import { useGame } from '../store/gameStore';
import { getCharacter } from '../data/characters';
import { BOSS_DEFEAT } from '../data/dialogues';
import { useTimers } from '../hooks/useTimers';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyDown } from '../hooks/useKeys';
import { Sprite } from '../components/Sprite';
import { SceneBackground } from '../components/SceneBackground';
import { ProgressBar } from '../components/ProgressBar';
import { PixelButton } from '../components/PixelButton';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { Monkey } from '../characters/Monkey';
import { Karini } from '../characters/Karini';
import { Raf } from '../characters/Raf';
import { randInt, rand } from '../utils/random';
import { sound } from '../audio/sound';
import type { AssetKey, CharacterId, KariniEmotion, MonkeyEmotion } from '../types/game';

/* ---------- настройки боя ---------- */
const RAF_MAX = 100;
const MONKEY_MAX = 300;
const PHASE3_AT = 120;
const DODGES_TO_WIN = 12;

/** Чекпоинт: при повторной попытке после фазы 1 начинаем сразу со второй */
let checkpoint: 'dodge' | 'battle' = 'dodge';

type Stage = 'dodge' | 'toBattle' | 'battle' | 'defeat';
type AttackId = 'cake' | 'gift' | 'confetti' | 'banana' | 'special' | 'ult';

interface Banana { id: number; lane: number; y: number; warn: number; resolved: boolean }
interface Fx { id: number; asset: AssetKey; fallback?: AssetKey; big?: boolean }
interface Num { id: number; text: string; target: 'monkey' | 'raf'; kind: 'dmg' | 'crit' | 'heal' | 'miss' }

const SPECIAL_DMG: Record<CharacterId, { min: number; max: number }> = {
  worker: { min: 70, max: 85 }, lover: { min: 22, max: 28 }, cute: { min: 18, max: 24 },
  lavender: { min: 60, max: 75 }, sigma: { min: 64, max: 76 }, grandpa: { min: 14, max: 18 },
};

export function MonkeyBoss({ onWin, onFail, attempt }: LevelApi) {
  const charId = useGame((s) => s.selectedCharacter) ?? 'worker';
  const char = getCharacter(charId);
  const coffeeCompleted = useGame((s) => s.coffeeCompleted);
  const timers = useTimers();

  const [stage, setStage] = useState<Stage>(() => {
    if (attempt === 1) checkpoint = 'dodge';
    return checkpoint;
  });
  const [rafHp, setRafHp] = useState(RAF_MAX);
  const [monkeyHp, setMonkeyHp] = useState(MONKEY_MAX);
  const [mEmotion, setMEmotion] = useState<MonkeyEmotion>('banana');
  const [karini, setKarini] = useState<[string, KariniEmotion]>(['УКЛОНЯЙСЯ! Стрелки или кнопки внизу!', 'shocked']);
  const [shake, setShake] = useState(false);
  const [fx, setFx] = useState<Fx[]>([]);
  const [nums, setNums] = useState<Num[]>([]);
  const seq = useRef(1);

  const doShake = () => { setShake(true); timers.after(400, () => setShake(false)); };
  const addNum = (text: string, target: Num['target'], kind: Num['kind']) => {
    const id = seq.current++;
    setNums((n) => [...n, { id, text, target, kind }]);
    timers.after(1100, () => setNums((n) => n.filter((x) => x.id !== id)));
  };
  const addFx = (asset: AssetKey, fallback?: AssetKey, big?: boolean) => {
    const id = seq.current++;
    setFx((f) => [...f, { id, asset, fallback, big }]);
    timers.after(big ? 1600 : 800, () => setFx((f) => f.filter((x) => x.id !== id)));
  };

  /* ================= ФАЗА 1: уклонение ================= */
  const [lane, setLane] = useState(1);
  const laneRef = useRef(1);
  laneRef.current = lane;
  const dodge = useRef({ bananas: [] as Banana[], spawnIn: 1.2, dodged: 0, over: false });
  const hpRef = useRef(RAF_MAX);
  hpRef.current = rafHp;
  const [, setFrame] = useState(0);

  const move = (d: number) => setLane((l) => Math.max(0, Math.min(2, l + d)));
  useKeyDown((k) => {
    if (stage !== 'dodge') return;
    if (k === 'ArrowLeft' || k === 'a' || k === 'ф') move(-1);
    if (k === 'ArrowRight' || k === 'd' || k === 'в') move(1);
  });

  useGameLoop((dt) => {
    const d = dodge.current;
    if (d.over) return;
    d.spawnIn -= dt;
    if (d.spawnIn <= 0) {
      const progress = d.dodged / DODGES_TO_WIN;
      d.spawnIn = rand(1.1, 1.4) - progress * 0.4;
      d.bananas.push({ id: seq.current++, lane: randInt(0, 2), y: 0, warn: 0.75 - progress * 0.2, resolved: false });
      setMEmotion('banana');
    }
    for (const b of d.bananas) {
      if (b.warn > 0) { b.warn -= dt; continue; }
      b.y += dt * 1.5;
      if (!b.resolved && b.y >= 0.78) {
        b.resolved = true;
        if (b.lane === laneRef.current) {
          const hp = Math.max(0, hpRef.current - 12);
          setRafHp(hp);
          hpRef.current = hp;
          sound.play('hit');
          doShake();
          addNum('−12', 'raf', 'dmg');
          setMEmotion('laugh');
          setKarini(['РАФИК, ТЫ ЧТО ДЕЛАЕШЬ 😭', 'crying']);
          if (hp <= 0) { d.over = true; onFail('Банановая атака оказалась непобедимой. Пока что.'); }
        } else {
          d.dodged += 1;
          sound.play('candle_blow');
          if (d.dodged % 4 === 0) setKarini([`УКЛОНИЛСЯ! ${d.dodged}/${DODGES_TO_WIN}`, 'happy']);
          if (d.dodged >= DODGES_TO_WIN) {
            d.over = true;
            setMEmotion('angry');
            setKarini(['ОНА ВЫДОХЛАСЬ! ТЕПЕРЬ БЕЙ ЕЁ!', 'happy']);
            checkpoint = 'battle';
            setStage('toBattle');
            timers.after(1800, () => { setStage('battle'); setRafHp(RAF_MAX); });
          }
        }
      }
    }
    d.bananas = d.bananas.filter((b) => b.y < 1.1);
    setFrame((f) => (f + 1) % 1000);
  }, stage === 'dodge');

  /* ================= ФАЗА 2–3: пошаговый бой ================= */
  const [turn, setTurn] = useState<'raf' | 'monkey' | 'busy'>('raf');
  const [log, setLog] = useState('Твой ход! Выбери атаку.');
  const [specialCd, setSpecialCd] = useState(0);
  const [ultUsed, setUltUsed] = useState(false);
  const [monkeySkip, setMonkeySkip] = useState(0);
  const [loverHealed, setLoverHealed] = useState(false);
  const phase3 = monkeyHp <= PHASE3_AT;
  const phase3Announced = useRef(false);

  useEffect(() => {
    if (stage !== 'battle') return;
    setMEmotion('angry');
    setKarini(['РАФИК, ПОЖАЛУЙСТА, ПОБЕДИ ЕЁ. Я УЖЕ ХОЧУ ТОРТИК.', 'crying']);
  }, [stage]);

  useEffect(() => {
    if (stage === 'battle' && phase3 && !phase3Announced.current && monkeyHp > 0) {
      phase3Announced.current = true;
      setMEmotion('angry');
      setKarini(coffeeCompleted
        ? ['ФАЗА 3! РАФИК, У ТЕБЯ ЖЕ ЕСТЬ ЛАВАНДОВЫЙ РАФ! ☕', 'shocked']
        : ['ФАЗА 3! Она злится. Бей чем есть, ты справишься!', 'shocked']);
      setLog('ФАЗА 3: ЯРОСТЬ МАКАКИ. Её удары сильнее.');
    }
  }, [phase3, stage, coffeeCompleted, monkeyHp]);

  const hitMonkey = (dmg: number, crit: boolean, text: string) => {
    const hp = Math.max(0, monkeyHp - dmg);
    setMonkeyHp(hp);
    addNum(`${crit ? 'КРИТ! ' : ''}−${dmg}`, 'monkey', crit ? 'crit' : 'dmg');
    sound.play('hit');
    setMEmotion(crit ? 'shocked' : hp < 80 ? 'crying' : 'angry');
    if (crit) setKarini(['КРИТ!! ТЫ ЧЁ, КИБЕРСПОРТСМЕН?', 'shocked']);
    setLog(text);
    return hp;
  };

  const attack = (a: AttackId) => {
    if (turn !== 'raf' || stage !== 'battle') return;
    setTurn('busy');
    let hp = monkeyHp;
    let skip = monkeySkip;
    let rafHpNow = rafHp;
    const roll = Math.random();
    switch (a) {
      case 'cake': {
        const crit = roll < 0.2;
        const dmg = randInt(28, 38) * (crit ? 2 : 1);
        addFx('fx.cake');
        hp = hitMonkey(dmg, crit, `Раф бросает торт! ${crit ? 'Прямо в лицо!' : ''}`);
        break;
      }
      case 'gift': {
        addFx('fx.gift', 'item.giftBlue');
        hp = hitMonkey(randInt(20, 26), false, 'Раф кидает подарок. Макака ловит его лицом.');
        break;
      }
      case 'confetti': {
        addFx('fx.confetti');
        hp = hitMonkey(randInt(10, 45), false, 'КОНФЕТТИ-ВЗРЫВ!');
        if (roll < 0.3) { skip = Math.max(skip, 1); setLog('КОНФЕТТИ-ВЗРЫВ! Макака ничего не видит и пропустит ход.'); }
        break;
      }
      case 'banana': {
        if (roll < 0.4) {
          addNum('ПРОМАХ', 'monkey', 'miss');
          setMEmotion('banana');
          setLog('Макака поймала банан и съела. Ну конечно.');
          setKarini(['ЗАЧЕМ ТЫ ДАЛ ЕЙ БАНАН', 'angry']);
        } else {
          addFx('fx.banana', 'item.banana');
          hp = hitMonkey(randInt(45, 60), false, 'Удар бананом! Её же оружием!');
        }
        break;
      }
      case 'special': {
        const r = SPECIAL_DMG[charId];
        const dmg = randInt(r.min, r.max);
        addFx('fx.hit');
        doShake();
        setSpecialCd(3);
        const crit = charId === 'sigma';
        hp = hitMonkey(dmg, crit, `${char.special.name}! ${char.special.description}.`);
        if (charId === 'worker') { rafHpNow = Math.max(1, rafHp - 5); setRafHp(rafHpNow); addNum('−5', 'raf', 'dmg'); }
        if (charId === 'lover') { rafHpNow = Math.min(RAF_MAX, rafHp + 30); setRafHp(rafHpNow); addNum('+30', 'raf', 'heal'); setKarini(['ОБНИМАШКИ ВКЛЮЧЕНЫ ♡', 'shy']); }
        if (charId === 'cute') { skip = Math.max(skip, 1); setKarini(['НУ ТАКОГО ДАЖЕ МАКАКА НЕ МОЖЕТ БИТЬ', 'shy']); }
        if (charId === 'grandpa') { skip = Math.max(skip, 2); setKarini(['Она уснула на слове «циклон». Гениально.', 'happy']); }
        break;
      }
      case 'ult': {
        setUltUsed(true);
        addFx('fx.coffee', undefined, true);
        doShake();
        timers.after(300, doShake);
        const dmg = charId === 'lavender' ? 210 : 160;
        hp = hitMonkey(dmg, true, '☕ РАФ НА ЛАВАНДОВОМ! Фиолетовая кофейная волна!');
        setMEmotion('shocked');
        setKarini(['ЭТО ЛАВАНДОВЫЙ РАФ, ДЕТКА ☕', 'happy']);
        timers.after(700, () => setLog('Макака: «ПОЧЕМУ ЭТОТ КОФЕ ЗОВУТ РАФОМ???»'));
        break;
      }
    }
    setMonkeySkip(skip);

    if (hp <= 0) {
      win();
      return;
    }
    if (a !== 'special') setSpecialCd((c) => Math.max(0, c - 1));
    timers.after(1000, () => monkeyTurn(skip, rafHpNow, hp));
  };

  const monkeyTurn = (skip: number, rafHpNow: number, mHp: number) => {
    setTurn('monkey');
    if (skip > 0) {
      setMonkeySkip(skip - 1);
      setLog(charId === 'grandpa' ? 'Макака храпит. Zzz...' : 'Макака пропускает ход!');
      setMEmotion('shocked');
      timers.after(800, () => setTurn('raf'));
      return;
    }
    const missChance = charId === 'cute' ? 0.25 : 0.1;
    if (Math.random() < missChance) {
      addNum('ПРОМАХ', 'raf', 'miss');
      setLog('Макака промахнулась бананом!');
      setMEmotion('angry');
      timers.after(800, () => setTurn('raf'));
      return;
    }
    const enraged = mHp <= PHASE3_AT;
    const dmg = enraged ? randInt(12, 18) : randInt(8, 14);
    let hp = Math.max(0, rafHpNow - dmg);
    setMEmotion('laugh');
    sound.play('monkey_laugh');
    doShake();
    addNum(`−${dmg}`, 'raf', 'dmg');
    setLog(enraged ? `Макака в ярости кидает связку бананов! −${dmg}` : `Макака кидает банан! −${dmg}`);
    if (charId === 'lover' && !loverHealed && hp > 0 && hp < 35) {
      setLoverHealed(true);
      hp = Math.min(RAF_MAX, hp + 25);
      timers.after(500, () => { addNum('+25', 'raf', 'heal'); setKarini(['Я ТЕБЯ НЕ ОТДАМ! +25 HP ♡', 'angry']); });
    }
    setRafHp(hp);
    if (hp <= 0) {
      timers.after(700, () => onFail('Рафа закидали бананами. Карини уже несёт пластырь.'));
      return;
    }
    timers.after(800, () => setTurn('raf'));
  };

  const win = () => {
    setStage('defeat');
    setMEmotion('crying');
    checkpoint = 'dodge';
    sound.play('victory');
    timers.after(2600, () => onWin({ lines: BOSS_DEFEAT, title: 'MONKEY DEFEATED' }));
  };

  /* ================= рендер ================= */
  const d = dodge.current;
  const attacks: { id: AttackId; name: string; hint: string; disabled?: boolean; cls?: string }[] = [
    { id: 'cake', name: '🎂 Бросить торт', hint: '28–38, шанс крита' },
    { id: 'gift', name: '🎁 Кинуть подарок', hint: '20–26, не промахивается' },
    { id: 'confetti', name: '🎉 Конфетти-взрыв', hint: '10–45, может оглушить' },
    { id: 'banana', name: '🍌 Удар бананом', hint: '45–60, но 40% промах' },
    { id: 'special', name: `✦ ${char.special.name}`, hint: specialCd > 0 ? `перезарядка: ${specialCd}` : char.special.description, disabled: specialCd > 0, cls: 'atk-special' },
  ];
  if (phase3 && coffeeCompleted && !ultUsed) {
    attacks.push({ id: 'ult', name: '☕ РАФ НА ЛАВАНДОВОМ', hint: 'секретная ульта', cls: 'atk-ult' });
  }

  return (
    <div className={`boss ${shake ? 'shake' : ''}`}>
      <SceneBackground asset="final.bg" />
      <div className="boss-bars">
        <div className="hpbox">
          <span>rafich12_</span>
          <ProgressBar value={rafHp} max={RAF_MAX} color="var(--mint)" label={`${rafHp}/${RAF_MAX}`} />
        </div>
        <div className="boss-phase">
          {stage === 'dodge' || stage === 'toBattle' ? 'ФАЗА 1: БАНАНОВАЯ АТАКА' : phase3 ? 'ФАЗА 3: ЯРОСТЬ' : 'ФАЗА 2: ТОРТОВАЯ БИТВА'}
        </div>
        <div className="hpbox right">
          <span>МАКАКА</span>
          <ProgressBar value={monkeyHp} max={MONKEY_MAX} color="var(--heart)" label={`${monkeyHp}/${MONKEY_MAX}`} />
        </div>
      </div>

      {(stage === 'dodge' || stage === 'toBattle') && (
        <div className="dodge">
          <Sprite asset="boss.arena" w={560} h={337} className="arena-floor" />
          <div className="dodge-monkey"><Monkey emotion={mEmotion} size={110} /></div>
          <div className="lanes">
            {[0, 1, 2].map((l) => (
              <button key={l} className={`lane ${d.bananas.some((b) => b.lane === l && b.warn > 0) ? 'lane-warn' : ''}`} onClick={() => setLane(l)} aria-label={`Дорожка ${l + 1}`} />
            ))}
            {d.bananas.filter((b) => b.warn <= 0).map((b) => (
              <div key={b.id} className="banana" style={{ left: `${b.lane * 33.33 + 16.66}%`, top: `${b.y * 100}%` }}>
                <Sprite asset="item.banana" w={56} h={56} />
              </div>
            ))}
            <div className="dodge-raf" style={{ left: `${lane * 33.33 + 16.66}%` }}>
              <Raf size={92} idle={false} />
            </div>
            {nums.filter((n) => n.target === 'raf').map((n) => <span key={n.id} className={`dmg dmg-${n.kind}`} style={{ left: `${lane * 33.33 + 16.66}%`, top: '70%' }}>{n.text}</span>)}
          </div>
          <div className="dodge-info">
            <span className="gh-big">УКЛОНЕНИЯ {Math.min(d.dodged, DODGES_TO_WIN)}/{DODGES_TO_WIN}</span>
          </div>
          <div className="touch-row">
            <button className="touch-btn" onPointerDown={() => move(-1)}>◀</button>
            <span className="muted">←/→ или тап по дорожке</span>
            <button className="touch-btn" onPointerDown={() => move(1)}>▶</button>
          </div>
          {stage === 'toBattle' && <div className="big-banner anim-pop">ФАЗА 2!</div>}
        </div>
      )}

      {(stage === 'battle' || stage === 'defeat') && (
        <div className="battle">
          <div className="battle-field">
            <Sprite asset="boss.arena" w={560} h={337} className="arena-floor" />
            <div className="battle-raf"><Raf size={150} /></div>
            <div className={`battle-monkey ${phase3 ? 'enraged' : ''}`}>
              <Monkey emotion={mEmotion} size={190} />
              {fx.map((f) => (
                <span key={f.id} className={`fx ${f.big ? 'fx-big' : ''}`}><Sprite asset={f.asset} fallback={f.fallback} w={f.big ? 320 : 130} h={f.big ? 320 : 130} /></span>
              ))}
              {nums.filter((n) => n.target === 'monkey').map((n) => <span key={n.id} className={`dmg dmg-${n.kind}`}>{n.text}</span>)}
            </div>
            {nums.filter((n) => n.target === 'raf').map((n) => <span key={n.id} className={`dmg dmg-${n.kind} dmg-raf`}>{n.text}</span>)}
            {fx.some((f) => f.big) && <div className="coffee-wave" />}
            {stage === 'defeat' && (
              <>
                <div className="big-banner anim-pop">MONKEY DEFEATED</div>
                <div className="chest-drop"><Sprite asset="chest.closed" w={110} h={110} /></div>
                <ConfettiEffect count={60} />
              </>
            )}
          </div>
          <div className="battle-ui">
            <div className="battle-log">{log}</div>
            {stage === 'battle' && (
              <div className="attacks">
                {attacks.map((a) => (
                  <PixelButton key={a.id} size="sm" variant={a.id === 'ult' ? 'pink' : 'primary'} className={`atk ${a.cls ?? ''}`} disabled={turn !== 'raf' || a.disabled} onClick={() => attack(a.id)}>
                    <span className="atk-name">{a.name}</span>
                    <span className="atk-hint">{a.hint}</span>
                  </PixelButton>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="boss-karini">
        <Karini emotion={karini[1]} size={70} />
        <span className="speech speech-small">{karini[0]}</span>
      </div>
    </div>
  );
}
