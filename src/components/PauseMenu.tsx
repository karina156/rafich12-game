import { useState } from 'react';
import { useGame } from '../store/gameStore';
import { Modal } from './Modal';
import { PixelButton } from './PixelButton';
import { SoundToggle } from './SoundToggle';
import { AchievementsPanel } from './AchievementsPanel';

export function PauseMenu() {
  const paused = useGame((s) => s.paused);
  const setPaused = useGame((s) => s.setPaused);
  const scene = useGame((s) => s.currentScene);
  const goTo = useGame((s) => s.goTo);
  const resetAll = useGame((s) => s.resetAll);
  const [confirm, setConfirm] = useState(false);
  const [ach, setAch] = useState(false);
  if (!paused) return null;
  if (ach) return <AchievementsPanel onClose={() => setAch(false)} />;
  return (
    <Modal title="ПАУЗА" onClose={() => setPaused(false)}>
      <div className="menu-col">
        <PixelButton onClick={() => setPaused(false)}>▶ ПРОДОЛЖИТЬ</PixelButton>
        <SoundToggle />
        <PixelButton variant="mint" onClick={() => setAch(true)}>★ ДОСТИЖЕНИЯ</PixelButton>
        {scene.startsWith('level:') && (
          <PixelButton variant="pink" onClick={() => goTo('room')}>⌂ ВЫЙТИ В КОМНАТУ</PixelButton>
        )}
        {scene !== 'start' && (
          <PixelButton variant="ghost" onClick={() => goTo('start')}>ГЛАВНОЕ МЕНЮ</PixelButton>
        )}
        {!confirm ? (
          <PixelButton variant="danger" size="sm" onClick={() => setConfirm(true)}>СБРОСИТЬ ПРОГРЕСС</PixelButton>
        ) : (
          <div className="confirm">
            <p>Точно? Всё пропадёт, даже достижения.</p>
            <div className="row">
              <PixelButton variant="danger" size="sm" onClick={() => { resetAll(); setConfirm(false); }}>ДА, СБРОСИТЬ</PixelButton>
              <PixelButton variant="ghost" size="sm" onClick={() => setConfirm(false)}>НЕТ</PixelButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
