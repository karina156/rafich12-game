import { useEffect, useState } from 'react';
import { useGame } from '../store/gameStore';
import { POST_CREDITS } from '../data/dialogues';
import { DialogueBox } from '../components/DialogueBox';
import { PixelButton } from '../components/PixelButton';
import { Monkey } from '../characters/Monkey';
import { Karini } from '../characters/Karini';
import { useTimers } from '../hooks/useTimers';
import type { MonkeyEmotion } from '../types/game';

type Step = 'end' | 'orIsIt' | 'monkey' | 'buttons';

export function PostCredits() {
  const goTo = useGame((s) => s.goTo);
  const newGamePlus = useGame((s) => s.newGamePlus);
  const timers = useTimers();
  const [step, setStep] = useState<Step>('end');
  const [mEmotion, setMEmotion] = useState<MonkeyEmotion>('shocked');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    timers.after(2600, () => setStep('orIsIt'));
    timers.after(4600, () => setStep('monkey'));
  }, [timers]);

  return (
    <div className="credits">
      {step === 'end' && <h1 className="the-end anim-fade">THE END</h1>}
      {step === 'orIsIt' && <h1 className="the-end glitch-text anim-fade">...OR IS IT?</h1>}
      {(step === 'monkey' || step === 'buttons') && (
        <div className="credits-stage">
          <div className={`credits-monkey ${running ? 'run-away' : 'anim-enter-right'}`}>
            <Monkey emotion={mEmotion} size={180} />
          </div>
          <div className="credits-karini anim-enter-left"><Karini emotion="angry" size={150} /></div>
        </div>
      )}
      {step === 'monkey' && (
        <DialogueBox
          id="credits"
          lines={POST_CREDITS}
          onCue={(c) => { if (c === 'monkeyRun') { setMEmotion('laugh'); } }}
          onDone={() => { setRunning(true); timers.after(900, () => setStep('buttons')); }}
        />
      )}
      {step === 'buttons' && (
        <div className="menu-col credits-buttons anim-pop">
          <PixelButton variant="pink" onClick={() => goTo('final')}>ПОСМОТРЕТЬ СТИКЕРПАК</PixelButton>
          <PixelButton onClick={() => goTo('room')}>ВЕРНУТЬСЯ В КОМНАТУ</PixelButton>
          <PixelButton variant="mint" onClick={newGamePlus}>ПРОЙТИ ИГРУ ЕЩЁ РАЗ</PixelButton>
        </div>
      )}
    </div>
  );
}
