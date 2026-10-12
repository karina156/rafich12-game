import { useEffect, useRef, useState } from 'react';
import type { DialogueLine } from '../types/game';
import { CharacterPortrait, SPEAKER_NAMES } from './CharacterPortrait';
import { useGame } from '../store/gameStore';
import { sound } from '../audio/sound';
import { useKeyDown } from '../hooks/useKeys';

interface Props {
  lines: DialogueLine[];
  /** Уникальный id диалога — если уже видели, появляется «Пропустить» */
  id?: string;
  onDone: () => void;
  /** Вызывается, когда на экране появляется реплика с cue */
  onCue?: (cue: string, index: number) => void;
  /** Показывать большой портрет говорящего */
  portraits?: boolean;
  speed?: number;
}

/** RPG-окно диалога с печатающимся текстом. Тап/клик/пробел — дальше. */
export function DialogueBox({ lines, id, onDone, onCue, portraits = true, speed = 28 }: Props) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const seen = useGame((s) => (id ? s.seenDialogues.includes(id) : false));
  const markSeen = useGame((s) => s.markDialogueSeen);
  const doneRef = useRef(false);
  const line = lines[index];
  const full = line?.text ?? '';
  const typing = shown < full.length;

  useEffect(() => {
    setShown(0);
    if (line?.cue) onCue?.(line.cue, index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (!typing) return;
    const t = window.setTimeout(() => {
      setShown((n) => n + 1);
      if (shown % 3 === 0) sound.play('dialogue');
    }, 1000 / speed);
    return () => window.clearTimeout(t);
  }, [shown, typing, speed]);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (id) markSeen(id);
    onDone();
  };

  const next = () => {
    if (typing) { setShown(full.length); return; }
    if (index + 1 < lines.length) setIndex(index + 1);
    else finish();
  };

  useKeyDown((k, e) => {
    if (k === ' ' || k === 'Enter') { e.preventDefault(); next(); }
    if (k === 'Escape' && seen) finish();
  });

  if (!line) return null;
  const right = line.speaker === 'monkey';
  return (
    <div className={`dialogue ${right ? 'dialogue-right' : ''}`} onClick={next}>
      {portraits && line.speaker !== 'system' && (
        <div className="dialogue-portrait">
          <CharacterPortrait speaker={line.speaker} emotion={line.emotion} size={150} />
        </div>
      )}
      <div className={`dialogue-box speaker-${line.speaker}`}>
        <div className="dialogue-name">{SPEAKER_NAMES[line.speaker]}</div>
        <p className="dialogue-text">
          {full.slice(0, shown)}
          <span className="dialogue-ghost">{full.slice(shown)}</span>
        </p>
        <div className="dialogue-footer">
          <span className="dialogue-count">{index + 1}/{lines.length}</span>
          {!typing && <span className="dialogue-next anim-blink">▼</span>}
        </div>
        {seen && (
          <button className="dialogue-skip" onClick={(e) => { e.stopPropagation(); finish(); }}>
            ПРОПУСТИТЬ ⏭
          </button>
        )}
      </div>
    </div>
  );
}
