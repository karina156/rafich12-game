import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { DialogueBox } from '../components/DialogueBox';
import { PixelButton } from '../components/PixelButton';
import { Sprite } from '../components/Sprite';
import { SceneBackground } from '../components/SceneBackground';
import { Karini } from '../characters/Karini';
import { Monkey } from '../characters/Monkey';
import { INTRO_PART_1, INTRO_PART_2 } from '../data/dialogues';
import { sound } from '../audio/sound';
import { useTimers } from '../hooks/useTimers';
import type { KariniEmotion } from '../types/game';

type Monkeystate = 'none' | 'steal' | 'peek' | 'gone';

export function IntroCutscene() {
  const goTo = useGame((s) => s.goTo);
  const markIntroSeen = useGame((s) => s.markIntroSeen);
  const introSeen = useGame((s) => s.introSeen);
  const timers = useTimers();
  const [part, setPart] = useState<1 | 'choice' | 2>(1);
  const [gift, setGift] = useState<'hidden' | 'shown' | 'stolen'>('hidden');
  const [glitch, setGlitch] = useState(false);
  const [monkey, setMonkey] = useState<Monkeystate>('none');
  const [kEmotion, setKEmotion] = useState<KariniEmotion>('party');

  const onCue = (cue: string) => {
    if (cue === 'showGift') setGift('shown');
    if (cue === 'glitch') {
      setGlitch(true);
      sound.play('glitch');
      sound.pauseMusicFor(1800);
      timers.after(700, () => setGlitch(false));
    }
    if (cue === 'monkeySteal') {
      setMonkey('steal');
      sound.play('monkey_laugh');
      timers.after(900, () => { setGift('stolen'); setKEmotion('shocked'); });
      timers.after(1700, () => setMonkey('gone'));
    }
    if (cue === 'monkeyPeek') { setMonkey('peek'); sound.play('monkey_laugh'); }
    if (cue === 'monkeyLeave') setMonkey('gone');
  };

  const finish = () => {
    markIntroSeen();
    goTo('select');
  };

  return (
    <div className={`cutscene ${glitch ? 'glitch-screen' : ''}`}>
      <SceneBackground asset="bg.intro" />
      <div className="cutscene-floor" />
      <div className="cut-karini anim-enter-left">
        <Karini emotion={kEmotion} size={210} />
      </div>
      {gift !== 'hidden' && (
        <div className={`cut-gift ${gift === 'stolen' ? 'cut-gift-stolen' : 'anim-drop'}`}>
          <Sprite asset="item.bigGift" w={140} h={140} />
        </div>
      )}
      {monkey === 'steal' && (
        <div className="cut-monkey-run"><Monkey emotion="gift" size={170} idle={false} /></div>
      )}
      {monkey === 'peek' && (
        <div className="cut-monkey-peek"><Monkey emotion="laugh" size={150} flip /></div>
      )}

      {part === 1 && (
        <DialogueBox
          id="intro"
          lines={INTRO_PART_1}
          onCue={(c, i) => { onCue(c); const e = INTRO_PART_1[i].emotion; if (INTRO_PART_1[i].speaker === 'karini' && e) setKEmotion(e as KariniEmotion); }}
          onDone={() => setPart('choice')}
          portraits={false}
        />
      )}
      {part === 'choice' && (
        <div className="choice anim-pop">
          <PixelButton size="lg" onClick={() => { setKEmotion('happy'); setPart(2); }}>
            «Я просто хотел отметить др...»
          </PixelButton>
        </div>
      )}
      {part === 2 && (
        <DialogueBox lines={INTRO_PART_2.slice(1)} onDone={finish} portraits={false} />
      )}
      {introSeen && part !== 2 && (
        <button className="skip-cutscene" onClick={finish}>ПРОПУСТИТЬ ⏭</button>
      )}
    </div>
  );
}
