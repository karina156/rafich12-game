import { useEffect, useRef, useState } from 'react';
import type { LevelApi } from '../components/LevelShell';
import { useTimers } from '../hooks/useTimers';
import { useGameLoop } from '../hooks/useGameLoop';
import { Sprite } from '../components/Sprite';
import { ProgressBar } from '../components/ProgressBar';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { Monkey } from '../characters/Monkey';
import { Karini } from '../characters/Karini';
import { shuffle } from '../utils/random';
import { sound } from '../audio/sound';
import type { AssetKey, KariniEmotion } from '../types/game';

type ObjId = 'balloon' | 'garland' | 'speaker' | 'gift' | 'popper';
interface Obj { id: ObjId; name: string; fixVerb: string; broken: AssetKey; fixed: AssetKey; taps: number; x: number; y: number; w: number; h: number }

const OBJECTS: Obj[] = [
  { id: 'garland', name: 'Гирлянда', fixVerb: 'включить', broken: 'party.garlandBroken', fixed: 'party.garland', taps: 1, x: 50, y: 14, w: 360, h: 70 },
  { id: 'balloon', name: 'Шарик', fixVerb: 'надуть (3 тапа)', broken: 'party.balloonBroken', fixed: 'party.balloon', taps: 3, x: 15, y: 45, w: 110, h: 150 },
  { id: 'speaker', name: 'Колонка', fixVerb: 'включить музыку', broken: 'party.speakerBroken', fixed: 'party.speaker', taps: 1, x: 85, y: 50, w: 110, h: 130 },
  { id: 'gift', name: 'Подарок', fixVerb: 'поднять (2 тапа)', broken: 'party.giftBroken', fixed: 'party.gift', taps: 2, x: 38, y: 75, w: 110, h: 100 },
  { id: 'popper', name: 'Хлопушка', fixVerb: 'бахнуть', broken: 'party.popperBroken', fixed: 'party.popper', taps: 1, x: 64, y: 75, w: 100, h: 110 },
];

const WAVES = [2, 3, 5];
const CHAOS_PER_BROKEN = 1.7; // % в секунду за каждую сломанную вещь

export function PartyChaos({ onWin, onFail }: LevelApi) {
  const timers = useTimers();
  const [broken, setBroken] = useState<Record<ObjId, number>>({ balloon: 0, garland: 0, speaker: 0, gift: 0, popper: 0 });
  const [wave, setWave] = useState(0);
  const [monkeyRun, setMonkeyRun] = useState(false);
  const [restored, setRestored] = useState(false);
  const [burst, setBurst] = useState(0);
  const [karini, setKarini] = useState<[string, KariniEmotion]>(['Готовься, она идёт!', 'shocked']);
  const chaos = useRef(0);
  const [, setFrame] = useState(0);
  const sabotaged = useRef(false);
  const waveActive = useRef(false);
  const over = useRef(false);
  const brokenRef = useRef(broken);
  brokenRef.current = broken;

  const brokenCount = Object.values(broken).filter((v) => v > 0).length;

  const breakSome = (n: number) => {
    setMonkeyRun(true);
    sound.play('monkey_laugh');
    timers.after(900, () => {
      const pickIds = shuffle(OBJECTS).slice(0, n);
      setBroken((b) => {
        const nb = { ...b };
        for (const o of pickIds) nb[o.id] = o.taps;
        return nb;
      });
      waveActive.current = true;
      sound.play('hit');
      setKarini(['УБЕРИТЕ ЭТУ МАКАКУ!', 'angry']);
    });
    timers.after(1900, () => setMonkeyRun(false));
  };

  useEffect(() => {
    timers.after(800, () => breakSome(WAVES[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // волна закончилась, когда всё починено
  useEffect(() => {
    if (!waveActive.current || monkeyRun || restored || brokenCount > 0) return;
    waveActive.current = false;
    if (wave + 1 < WAVES.length) {
      setKarini([wave === 0 ? 'Фух. Но она вернётся...' : 'ОНА ОПЯТЬ ИДЁТ!', 'shocked']);
      const w = wave + 1;
      setWave(w);
      sabotaged.current = false;
      timers.after(1200, () => breakSome(WAVES[w]));
    } else {
      setRestored(true);
      sound.play('victory');
      setKarini(['PARTY RESTORED!', 'happy']);
      timers.after(2200, () => onWin());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brokenCount, monkeyRun]);

  useGameLoop((dt) => {
    if (restored || over.current) return;
    const n = Object.values(brokenRef.current).filter((v) => v > 0).length;
    chaos.current = Math.max(0, chaos.current + (n > 0 ? n * CHAOS_PER_BROKEN : -6) * dt);
    if (chaos.current >= 100) {
      over.current = true;
      onFail('Шкала хаоса заполнилась. Вечеринка в руинах, Макака танцует.');
      chaos.current = 100;
    }
    // в последней волне Макака один раз ломает уже починенную вещь
    if (wave === WAVES.length - 1 && !sabotaged.current && !monkeyRun && n > 0 && n <= 2) {
      sabotaged.current = true;
      const fixedOnes = OBJECTS.filter((o) => brokenRef.current[o.id] === 0);
      if (fixedOnes.length) {
        const o = fixedOnes[0];
        setBroken((b) => ({ ...b, [o.id]: o.taps }));
        setKarini(['ОНА ОПЯТЬ ЧТО-ТО СЛОМАЛА 😭', 'crying']);
        sound.play('monkey_laugh');
      }
    }
    setFrame((f) => (f + 1) % 1000);
  }, true);

  const tap = (o: Obj) => {
    const left = broken[o.id];
    if (left <= 0 || monkeyRun) return;
    const n = left - 1;
    setBroken((b) => ({ ...b, [o.id]: n }));
    if (n > 0) { sound.play('click'); return; }
    sound.play('fix');
    if (o.id === 'popper') { setBurst((x) => x + 1); sound.play('victory'); }
    setKarini([
      o.id === 'speaker' ? 'МУЗЫКА! 🎶' : o.id === 'popper' ? 'БАХ! КОНФЕТТИ!' : o.id === 'garland' ? 'СВЕТИТСЯ!' : 'ВОТ ТАК!',
      'happy',
    ]);
  };

  return (
    <div className="chaos">
      <div className="game-hud">
        <span className="gh-big">ВОЛНА {wave + 1}/{WAVES.length}</span>
        <span className="chaos-meter">ХАОС <ProgressBar value={chaos.current} max={100} color="var(--heart)" /></span>
      </div>
      <div className="chaos-body">
        <div className="chaos-field">
          {OBJECTS.map((o) => {
            const b = broken[o.id] > 0;
            return (
              <button
                key={o.id}
                className={`chaos-obj ${b ? 'is-broken anim-wiggle' : 'is-fixed'} ${o.id === 'speaker' && !b ? 'speaker-on' : ''}`}
                style={{ left: `${o.x}%`, top: `${o.y}%`, width: o.w, height: o.h }}
                onClick={() => tap(o)}
                aria-label={o.name}
              >
                <Sprite key={b ? 'b' : 'f'} asset={b ? o.broken : o.fixed} w={o.w} h={o.h} className={b ? '' : 'anim-pop'} />
                {b && o.taps > 1 && <span className="tap-count">{broken[o.id]}</span>}
                {o.id === 'speaker' && !b && <span className="notes">♪ ♫</span>}
              </button>
            );
          })}
          {burst > 0 && <ConfettiEffect key={burst} count={50} burst seed={burst} />}
          {restored && <ConfettiEffect count={80} />}
          {restored && <div className="big-banner anim-pop">PARTY RESTORED!</div>}
          {monkeyRun && <div className="chaos-monkey"><Monkey emotion="laugh" size={130} idle={false} /></div>}
          <div className="chaos-karini">
            <Karini emotion={karini[1]} size={80} />
            <span className="speech speech-small">{karini[0]}</span>
          </div>
        </div>
        <div className="tasks">
          <div className="tasks-title">ЗАДАЧИ</div>
          {OBJECTS.map((o) => (
            <div key={o.id} className={`task ${broken[o.id] > 0 ? 'todo' : 'done'}`}>
              {broken[o.id] > 0 ? '☐' : '☑'} {o.name}{broken[o.id] > 0 ? `: ${o.fixVerb}` : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
