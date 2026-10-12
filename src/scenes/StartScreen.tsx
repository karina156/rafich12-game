import { useEffect, useState } from 'react';
import { useGame } from '../store/gameStore';
import { PixelButton } from '../components/PixelButton';
import { ProgressBar } from '../components/ProgressBar';
import { SceneBackground } from '../components/SceneBackground';
import { useTimers } from '../hooks/useTimers';
import { sound } from '../audio/sound';

const BOOT = ['BIRTHDAY_OS v19.0', '', 'PLAYER: rafich12_', 'NEW LEVEL DETECTED: 19', '', 'LOADING BIRTHDAY...'];

type Step = 'boot' | 'loading' | 'error' | 'menu';

export function StartScreen() {
  const goTo = useGame((s) => s.goTo);
  const introSeen = useGame((s) => s.introSeen);
  const hasSave = useGame((s) => s.selectedCharacter !== null);
  const resetAll = useGame((s) => s.resetAll);
  const timers = useTimers();
  const [lines, setLines] = useState(0);
  const [pct, setPct] = useState(0);
  const [step, setStep] = useState<Step>('boot');

  useEffect(() => {
    BOOT.forEach((_, i) => timers.after(250 + i * 280, () => setLines(i + 1)));
    timers.after(250 + BOOT.length * 280, () => setStep((st) => (st === 'boot' ? 'loading' : st)));
  }, [timers]);

  useEffect(() => {
    if (step !== 'loading') return;
    const id = timers.every(70, () => {
      setPct((p) => {
        if (p >= 19) {
          timers.clear(id);
          timers.after(500, () => setStep((st) => { if (st !== 'loading') return st; sound.play('glitch'); return 'error'; }));
          return 19;
        }
        return p + 1;
      });
    });
    return () => timers.clear(id);
  }, [step, timers]);

  useEffect(() => {
    if (step === 'error') timers.after(1300, () => setStep((st) => (st === 'error' ? 'menu' : st)));
  }, [step, timers]);

  const skip = () => { if (step !== 'menu') { setLines(BOOT.length); setPct(19); setStep('menu'); } };

  return (
    <div className={`start ${step === 'error' ? 'glitch-screen' : ''}`} onClick={skip}>
      <SceneBackground asset="bg.start" />
      {/* когда открылось меню, загрузочный текст убираем, чтобы кнопка помещалась на экран */}
      {step !== 'menu' && <div className="crt">
        <pre className="boot">
          {BOOT.slice(0, lines).join('\n')}
          {step !== 'boot' && `\n${pct}%`}
          {step === 'error' && <span className="boot-error">{'\n\nERROR!'}</span>}
        </pre>
        {step === 'loading' && <ProgressBar value={pct} max={100} color="var(--mint)" />}
      </div>}

      {step === 'menu' && (
        <div className="start-menu anim-pop" onClick={(e) => e.stopPropagation()}>
          <h1 className="title">RAFICH12_:<br /><span>THE BIRTHDAY INCIDENT</span></h1>
          <p className="subtitle">«Раф против Макаки. Основано на реальном дне рождения».</p>
          <div className="syserr">
            <div className="syserr-head">⚠ SYSTEM ERROR</div>
            <p>Торт пропал.<br />Подарки украдены.<br />Украшения сломаны.<br />День рождения под угрозой.</p>
          </div>
          <div className="menu-col">
            {hasSave ? (
              <>
                <PixelButton size="lg" onClick={() => goTo('room')}>ПРОДОЛЖИТЬ ▶</PixelButton>
                <PixelButton variant="ghost" size="sm" onClick={() => { resetAll(); goTo('intro'); }}>НОВАЯ ИГРА</PixelButton>
              </>
            ) : (
              <PixelButton size="lg" onClick={() => goTo(introSeen ? 'select' : 'intro')}>НАЧАТЬ ПРИКЛЮЧЕНИЕ</PixelButton>
            )}
          </div>
        </div>
      )}
      {step !== 'menu' && <div className="tap-hint">нажми, чтобы пропустить</div>}
    </div>
  );
}
