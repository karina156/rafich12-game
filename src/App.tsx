import { useEffect, useState } from 'react';
import { useGame } from './store/gameStore';
import { Stage } from './components/Stage';
import { PixelTransition } from './components/PixelTransition';
import { AchievementPopup } from './components/AchievementPopup';
import { PauseMenu } from './components/PauseMenu';
import { LevelShell } from './components/LevelShell';
import { StartScreen } from './scenes/StartScreen';
import { IntroCutscene } from './scenes/IntroCutscene';
import { CharacterSelect } from './scenes/CharacterSelect';
import { BirthdayRoom } from './scenes/BirthdayRoom';
import { FinalReward } from './scenes/FinalReward';
import { PostCredits } from './scenes/PostCredits';
import { PhoneScreen, useIsPhone } from './scenes/PhoneScreen';
import { GiftRain } from './games/GiftRain';
import { CakeBuilder } from './games/CakeBuilder';
import { CandleChallenge } from './games/CandleChallenge';
import { FindGift } from './games/FindGift';
import { PartyChaos } from './games/PartyChaos';
import { LavenderRaf } from './games/LavenderRaf';
import { MonkeyBoss } from './games/MonkeyBoss';
import { sound } from './audio/sound';
import { BIRTHDAY_DATE } from './config';
import { useViewport } from './hooks/useViewport';
import type { LevelId, SceneId } from './types/game';
import type { LevelApi } from './components/LevelShell';
import type { ComponentType } from 'react';

const GAMES: Record<LevelId, ComponentType<LevelApi>> = {
  giftRain: GiftRain,
  cake: CakeBuilder,
  candles: CandleChallenge,
  findGift: FindGift,
  partyChaos: PartyChaos,
  coffee: LavenderRaf,
  boss: MonkeyBoss,
};

function Scene({ scene }: { scene: SceneId }) {
  const hasChar = useGame((s) => s.selectedCharacter !== null);
  if (scene.startsWith('level:')) {
    const id = scene.slice(6) as LevelId;
    const Game = GAMES[id];
    // защита: без выбранного Рафа в уровень не пускаем
    if (!Game || !hasChar) return <CharacterSelect />;
    return <LevelShell key={id} levelId={id} render={(api) => <Game {...api} />} />;
  }
  switch (scene) {
    case 'start': return <StartScreen />;
    case 'intro': return <IntroCutscene />;
    case 'select': return <CharacterSelect />;
    case 'room': return hasChar ? <BirthdayRoom /> : <CharacterSelect />;
    case 'final': return <FinalReward />;
    case 'credits': return <PostCredits />;
    default: return <StartScreen />;
  }
}

function RotateHint() {
  const { portrait } = useViewport();
  const scene = useGame((s) => s.currentScene);
  const [dismissed, setDismissed] = useState(false);
  const show = portrait && !dismissed && (scene.startsWith('level:') || scene === 'room');
  // подсказка сама прячется через 5 секунд и не мешает управлению
  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => setDismissed(true), 5000);
    return () => window.clearTimeout(t);
  }, [show]);
  if (!show) return null;
  return (
    <button className="rotate-hint" onClick={() => setDismissed(true)}>
      ⟲ В горизонтальном положении играть удобнее. Но можно и так — нажми, чтобы скрыть.
    </button>
  );
}

export default function App() {
  const scene = useGame((s) => s.currentScene);
  const soundEnabled = useGame((s) => s.soundEnabled);
  const musicEnabled = useGame((s) => s.musicEnabled);
  const unlock = useGame((s) => s.unlockAchievement);
  const paused = useGame((s) => s.paused);
  const setPaused = useGame((s) => s.setPaused);
  const phone = useIsPhone();

  useEffect(() => {
    sound.setSfxEnabled(soundEnabled);
    sound.setMusicEnabled(musicEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // «УЖЕ ДЕД» — игра запущена в день рождения (VITE_BIRTHDAY_DATE=MM-DD)
  useEffect(() => {
    if (!BIRTHDAY_DATE) return;
    const d = new Date();
    const today = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (today === BIRTHDAY_DATE.trim()) unlock('alreadyGrandpa');
  }, [unlock]);

  // Esc — пауза
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && scene !== 'start') setPaused(!useGame.getState().paused);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [scene, setPaused]);

  // на телефонах игра не запускается: вместо неё открытка
  if (phone) return <PhoneScreen />;

  return (
    <Stage>
      <div className={`scene scene-${scene.replace(':', '-')}`} key={scene}>
        <Scene scene={scene} />
      </div>
      <PixelTransition sceneKey={scene} />
      <AchievementPopup />
      {paused && <PauseMenu />}
      <RotateHint />
    </Stage>
  );
}
