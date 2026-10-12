import { useState } from 'react';
import { storyProgress, useGame } from '../store/gameStore';
import { getCharacter } from '../data/characters';
import { STORY_LEVELS } from '../data/levels';
import { Raf } from '../characters/Raf';
import { ProgressBar } from './ProgressBar';
import { InventoryPanel } from './InventoryPanel';
import { AchievementsPanel } from './AchievementsPanel';
import { Sprite } from './Sprite';
import { SoundToggle } from './SoundToggle';
import { ACHIEVEMENTS } from '../data/achievements';

export function GameHUD() {
  const char = useGame((s) => getCharacter(s.selectedCharacter));
  const progress = useGame((s) => storyProgress(s));
  const coins = useGame((s) => s.birthdayCoins);
  const invCount = useGame((s) => s.inventory.length);
  const achCount = useGame((s) => s.achievements.length);
  const setPaused = useGame((s) => s.setPaused);
  const [panel, setPanel] = useState<'inv' | 'ach' | null>(null);

  return (
    <>
      <div className="hud">
        <div className="hud-player">
          <div className="hud-avatar"><Raf size={44} idle={false} /></div>
          <div className="hud-player-info">
            <div className="hud-nick">rafich12_ <span className="hud-lvl">LVL 19</span></div>
            <div className="hud-class">{char.name}</div>
          </div>
        </div>
        <div className="hud-progress">
          <ProgressBar value={progress} max={STORY_LEVELS.length} color="var(--pink)" label={`ПРАЗДНИК ${Math.round((progress / STORY_LEVELS.length) * 100)}%`} segments />
        </div>
        <div className="hud-buttons">
          <span className="hud-coins" title="Birthday coins"><Sprite asset="icon.coin" w={22} h={22} /> {coins}</span>
          <button className="hud-btn" onClick={() => setPanel('inv')} title="Инвентарь"><Sprite asset="icon.bag" w={26} h={26} /><span className="hud-badge">{invCount}</span></button>
          <button className="hud-btn" onClick={() => setPanel('ach')} title="Достижения"><Sprite asset="icon.trophy" w={26} h={26} /><span className="hud-badge">{achCount}/{ACHIEVEMENTS.length}</span></button>
          <SoundToggle compact />
          <button className="hud-btn" onClick={() => setPaused(true)} title="Пауза и настройки"><Sprite asset="icon.settings" w={26} h={26} /></button>
        </div>
      </div>
      {panel === 'inv' && <InventoryPanel onClose={() => setPanel(null)} />}
      {panel === 'ach' && <AchievementsPanel onClose={() => setPanel(null)} />}
    </>
  );
}
