import { useRef, useState, type ReactNode } from 'react';
import type { DialogueLine, LevelId, LevelPhase } from '../types/game';
import { getLevel } from '../data/levels';
import { LEVEL_INTROS, LEVEL_VICTORY } from '../data/dialogues';
import { useGame } from '../store/gameStore';
import { DialogueBox } from './DialogueBox';
import { PixelButton } from './PixelButton';
import { Panel } from './Panel';
import { VictoryScreen } from './VictoryScreen';
import { Monkey } from '../characters/Monkey';
import { sound } from '../audio/sound';
import { LoadingScreen, useLevelPreload } from './LoadingScreen';

export interface WinOptions {
  lines?: DialogueLine[];
  extra?: ReactNode;
  title?: string;
}

export interface LevelApi {
  onWin: (opts?: WinOptions) => void;
  onFail: (message?: string) => void;
  attempt: number;
  phase: LevelPhase;
}

/**
 * Общая оболочка уровня: introduction → playing → victory → completed,
 * а при поражении — retry. Игра внутри перемонтируется на каждую попытку,
 * поэтому её таймеры и циклы гарантированно останавливаются.
 */
export function LevelShell({ levelId, render, introLines }: {
  levelId: LevelId;
  render: (api: LevelApi) => ReactNode;
  introLines?: DialogueLine[];
}) {
  const level = getLevel(levelId);
  const goTo = useGame((s) => s.goTo);
  const setPaused = useGame((s) => s.setPaused);
  const completeLevel = useGame((s) => s.completeLevel);
  const [phase, setPhaseState] = useState<LevelPhase>('introduction');
  // ref нужен, чтобы колбэки из игровых циклов видели актуальную фазу
  const phaseRef = useRef<LevelPhase>('introduction');
  const setPhase = (p: LevelPhase) => { phaseRef.current = p; setPhaseState(p); };
  const [introStep, setIntroStep] = useState<'dialogue' | 'card'>('dialogue');
  const [attempt, setAttempt] = useState(1);
  const [failMsg, setFailMsg] = useState('');
  const [win, setWin] = useState<WinOptions>({});
  const [firstTime, setFirstTime] = useState(false);

  const intro = introLines ?? LEVEL_INTROS[levelId] ?? [];
  const preload = useLevelPreload(levelId);

  const onWin = (opts: WinOptions = {}) => {
    if (phaseRef.current !== 'playing') return;
    sound.play('victory');
    setFirstTime(completeLevel(levelId));
    setWin({ ...opts, lines: opts.lines ?? LEVEL_VICTORY[levelId] });
    setPhase('victory');
  };
  const onFail = (message = 'Макака победила этот раунд.') => {
    if (phaseRef.current !== 'playing') return;
    sound.play('monkey_laugh');
    setFailMsg(message);
    setPhase('retry');
  };
  const restart = () => {
    setAttempt((a) => a + 1);
    setPhase('playing');
  };

  return (
    <div className={`level level-${levelId} phase-${phase}`}>
      <div className="level-bar">
        <div className="level-name">
          <span className="hf hf-l" /><span className="hf hf-m1" /><span className="hf hf-c" /><span className="hf hf-m2" /><span className="hf hf-r" />
          <span className="level-name-text">
            <span className="level-tag">{level.number ? `LEVEL 0${level.number}` : 'SECRET'}</span>
            {level.title}
          </span>
        </div>
        <button className="hud-btn" onClick={() => setPaused(true)} aria-label="Пауза">❚❚</button>
      </div>

      <div className="level-stage">
        {!preload.ready && <LoadingScreen done={preload.done} total={preload.total} />}
        {preload.ready && (phase === 'playing' || phase === 'victory' || phase === 'retry') && (
          <div className="level-game" key={attempt}>
            {render({ onWin, onFail, attempt, phase })}
          </div>
        )}

        {preload.ready && phase === 'introduction' && introStep === 'dialogue' && intro.length > 0 && (
          <DialogueBox id={`intro:${levelId}`} lines={intro} onDone={() => setIntroStep('card')} />
        )}
        {preload.ready && phase === 'introduction' && (introStep === 'card' || intro.length === 0) && (
          <div className="overlay">
            <Panel className="level-card anim-pop">
              <div className="level-card-kicker">{level.number ? `LEVEL 0${level.number}` : 'SECRET LEVEL'}</div>
              <h2>{level.title}</h2>
              <p>{level.mission}</p>
              <div className="row center">
                <PixelButton size="lg" onClick={() => setPhase('playing')}>НАЧАТЬ ▶</PixelButton>
                <PixelButton variant="ghost" size="sm" onClick={() => goTo('room')}>НАЗАД</PixelButton>
              </div>
            </Panel>
          </div>
        )}

        {phase === 'retry' && (
          <div className="overlay">
            <Panel className="level-card anim-pop">
              <Monkey emotion="laugh" size={110} />
              <h2>ПОПЫТКА ПРОВАЛЕНА</h2>
              <p>{failMsg}</p>
              <p className="muted">Карини: «РАФИК, ЭТО БЫЛ ТУТОРИАЛ». Давай ещё раз!</p>
              <div className="row center">
                <PixelButton size="lg" onClick={restart}>ЕЩЁ РАЗ ↺</PixelButton>
                <PixelButton variant="ghost" size="sm" onClick={() => goTo('room')}>В КОМНАТУ</PixelButton>
              </div>
            </Panel>
          </div>
        )}

        {phase === 'victory' && (
          <>
            <div className="victory-flash" />
            {win.lines && win.lines.length > 0 ? (
              <DialogueBox lines={win.lines} onDone={() => setPhase('completed')} />
            ) : (
              <AutoAdvance onDone={() => setPhase('completed')} />
            )}
          </>
        )}

        {phase === 'completed' && (
          <VictoryScreen
            level={level}
            firstTime={firstTime}
            extra={win.extra}
            title={win.title}
            onContinue={() => goTo('room')}
            onReplay={() => { setPhase('introduction'); setIntroStep('card'); setAttempt((a) => a + 1); }}
          />
        )}
      </div>
    </div>
  );
}

function AutoAdvance({ onDone }: { onDone: () => void }) {
  return (
    <div className="overlay" onClick={onDone}>
      <div className="big-banner anim-pop">VICTORY!</div>
    </div>
  );
}
