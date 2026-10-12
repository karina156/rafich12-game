import { useGame } from '../store/gameStore';
import { Sprite } from './Sprite';

export function SoundToggle({ compact }: { compact?: boolean }) {
  const soundOn = useGame((s) => s.soundEnabled);
  const musicOn = useGame((s) => s.musicEnabled);
  const toggleSound = useGame((s) => s.toggleSound);
  const toggleMusic = useGame((s) => s.toggleMusic);
  return (
    <div className={`sound-toggle ${compact ? 'compact' : ''}`}>
      <button className={`chip ${soundOn ? 'on' : ''}`} onClick={toggleSound} aria-pressed={soundOn}>
        <Sprite asset="icon.soundOn" w={22} h={22} className={soundOn ? '' : 'icon-off'} />{!compact && ' Звуки'}
      </button>
      <button className={`chip ${musicOn ? 'on' : ''}`} onClick={toggleMusic} aria-pressed={musicOn}>
        {musicOn ? '♫' : '♪̸'}{!compact && ' Музыка'}
      </button>
    </div>
  );
}
