import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { CHARACTERS } from '../data/characters';
import { CharacterSelectCard } from '../components/CharacterSelectCard';
import { PixelButton } from '../components/PixelButton';
import { DialogueBox } from '../components/DialogueBox';
import { SceneBackground } from '../components/SceneBackground';
import { useKeyDown } from '../hooks/useKeys';
import { sound } from '../audio/sound';

export function CharacterSelect() {
  const selected = useGame((s) => s.selectedCharacter);
  const selectCharacter = useGame((s) => s.selectCharacter);
  const goTo = useGame((s) => s.goTo);
  const [idx, setIdx] = useState(Math.max(0, CHARACTERS.findIndex((c) => c.id === selected)));
  const [chosen, setChosen] = useState(false);
  const def = CHARACTERS[idx];

  const move = (d: number) => {
    if (chosen) return;
    sound.play('hover');
    setIdx((i) => (i + d + CHARACTERS.length) % CHARACTERS.length);
  };
  useKeyDown((k) => {
    if (k === 'ArrowLeft') move(-1);
    if (k === 'ArrowRight') move(1);
  }, !chosen);

  const choose = () => {
    selectCharacter(def.id);
    setChosen(true);
  };

  return (
    <div className="select">
      <SceneBackground asset="bg.select" />
      <h1 className="select-title">CHOOSE YOUR RAF</h1>
      <div className="select-row">
        <button className="arrow" onClick={() => move(-1)} aria-label="Предыдущий">◀</button>
        <CharacterSelectCard key={def.id} def={def} index={idx} total={CHARACTERS.length} />
        <button className="arrow" onClick={() => move(1)} aria-label="Следующий">▶</button>
      </div>
      <div className="select-dots">
        {CHARACTERS.map((c, i) => (
          <button key={c.id} className={`dot ${i === idx ? 'on' : ''}`} onClick={() => !chosen && setIdx(i)} aria-label={c.name} />
        ))}
      </div>
      {!chosen && (
        <PixelButton size="lg" variant="pink" onClick={choose}>ВЫБРАТЬ ЭТОГО РАФА</PixelButton>
      )}
      {chosen && (
        <DialogueBox
          lines={[
            { speaker: 'karini', text: def.kariniLine, emotion: def.id === 'lover' || def.id === 'cute' ? 'shy' : def.id === 'grandpa' ? 'shocked' : 'happy' },
            { speaker: 'karini', text: 'Ладно, пошли в комнату. Там... всё плохо.', emotion: 'crying' },
          ]}
          onDone={() => goTo('room')}
        />
      )}
    </div>
  );
}
