import type { KariniEmotion, MonkeyEmotion, Speaker } from '../types/game';
import { Karini } from '../characters/Karini';
import { Monkey } from '../characters/Monkey';
import { Raf } from '../characters/Raf';

export const SPEAKER_NAMES: Record<Speaker, string> = {
  karini: 'КАРИНИ',
  monkey: 'МАКАКА',
  raf: 'rafich12_',
  system: 'BIRTHDAY_OS',
};

export function CharacterPortrait({ speaker, emotion, size = 120 }: {
  speaker: Speaker; emotion?: string; size?: number;
}) {
  return (
    <div className={`portrait portrait-${speaker}`}>
      {speaker === 'karini' && <Karini emotion={(emotion as KariniEmotion) ?? 'idle'} size={size} />}
      {speaker === 'monkey' && <Monkey emotion={(emotion as MonkeyEmotion) ?? 'laugh'} size={size} />}
      {speaker === 'raf' && <Raf size={size} />}
      {speaker === 'system' && <div className="portrait-system">⚠</div>}
    </div>
  );
}
