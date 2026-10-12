import { useEffect, useState } from 'react';
import type { LevelApi } from '../components/LevelShell';
import { useGame } from '../store/gameStore';
import { useTimers } from '../hooks/useTimers';
import { Sprite } from '../components/Sprite';
import { SceneBackground } from '../components/SceneBackground';
import { Karini } from '../characters/Karini';
import { Monkey } from '../characters/Monkey';
import { COFFEE_WRONG, coffeeWin } from '../data/dialogues';
import { shuffle } from '../utils/random';
import { sound } from '../audio/sound';
import type { AssetKey, KariniEmotion } from '../types/game';

interface Ingredient { id: string; name: string; asset: AssetKey }

const RECIPE: Ingredient[] = [
  { id: 'cup', name: 'Чашка', asset: 'coffee.cupEmpty' },
  { id: 'espresso', name: 'Эспрессо', asset: 'coffee.espresso' },
  { id: 'coconut', name: 'Кокосовое молоко', asset: 'coffee.coconut' },
  { id: 'syrup', name: 'Лавандовый сироп', asset: 'coffee.syrup' },
  { id: 'foam', name: 'Сливочная пенка', asset: 'coffee.foam' },
];
const JUNK: Ingredient[] = [
  { id: 'ketchup', name: 'Кетчуп', asset: 'bad.ketchup' },
  { id: 'banana', name: 'Банан (от Макаки)', asset: 'item.banana' },
];
/** Как выглядит чашка после N правильных шагов */
const CUP_STAGES: (AssetKey | null)[] = [null, 'coffee.cupEmpty', 'coffee.cupEspresso', 'coffee.cupMilk', 'coffee.cupSyrup', 'coffee.ready'];
const MAX_MISTAKES = 3;
/** Доски с рецептом нет: Карини подсказывает, что добавить следующим */
const NEXT_HINT = ['Сначала поставь чашку.', 'Теперь эспрессо!', 'Теперь кокосовое молоко.', 'Теперь лавандовый сироп.', 'И сверху сливочная пенка!'];

export function LavenderRaf({ onWin, onFail }: LevelApi) {
  const char = useGame((s) => s.selectedCharacter);
  const timers = useTimers();
  const [shelf, setShelf] = useState(() => shuffle([...RECIPE, ...JUNK]));
  const [done, setDone] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [karini, setKarini] = useState<[string, KariniEmotion]>([NEXT_HINT[0], 'happy']);
  const [monkeyMsg, setMonkeyMsg] = useState<string | null>(null);
  const [splash, setSplash] = useState(0);

  // Макака-бариста периодически переставляет полку
  useEffect(() => {
    const iv = timers.every(6000, () => {
      setShelf((s) => shuffle(s));
      setMonkeyMsg('Я ВСЁ ПЕРЕСТАВИЛА 🐒');
      sound.play('monkey_laugh');
      timers.after(1500, () => setMonkeyMsg(null));
    });
    return () => timers.clear(iv);
  }, [timers]);

  const add = (ing: Ingredient) => {
    if (done >= RECIPE.length) return;
    if (ing.id === RECIPE[done].id) {
      const n = done + 1;
      setDone(n);
      setSplash((x) => x + 1);
      sound.play('gift_collect');
      const praise = ['Так, чашка есть.', 'Эспрессо! Хорошо.', 'Кокосовое, правильно!', 'Лаванда... пахнет как ты.', 'ПЕНКА!!'][n - 1];
      setKarini([n < RECIPE.length ? `${praise} ${NEXT_HINT[n]}` : praise, 'happy']);
      if (n === RECIPE.length) {
        timers.clearAll();
        timers.after(900, () => onWin({ lines: coffeeWin(char), title: 'РАФ² — РАФ В КВАДРАТЕ' }));
      }
      return;
    }
    sound.play('wrong_item');
    const m = mistakes + 1;
    setMistakes(m);
    setDone(0);
    setKarini([COFFEE_WRONG, 'angry']);
    if (m < MAX_MISTAKES) timers.after(1800, () => setKarini((k) => (k[0] === COFFEE_WRONG ? [`Заново. ${NEXT_HINT[0]}`, 'idle'] : k)));
    setShelf((s) => shuffle(s));
    if (m >= MAX_MISTAKES) timers.after(900, () => onFail('Три «Артёма на овсяном» подряд. Кофейня закрыта на санобработку.'));
  };

  const cup = CUP_STAGES[done];
  return (
    <div className="coffee">
      <SceneBackground asset="coffee.bg" />
      <div className="game-hud">
        <span className="gh-big">☕ {done}/{RECIPE.length}</span>
        <span className="muted">ошибки: {mistakes}/{MAX_MISTAKES}</span>
      </div>
      <div className="coffee-body">
        <div className="coffee-cup">
          {cup ? <Sprite key={`cup-${done}`} asset={cup} fallback="coffee.cupEmpty" w={170} h={170} className="anim-pop" /> : <div className="cup-empty-slot">поставь чашку</div>}
          {splash > 0 && <span key={`splash-${splash}`} className="cup-splash">✦</span>}
          <div className="coffee-karini"><Karini emotion={karini[1]} size={80} /><span className="speech">{karini[0]}</span></div>
        </div>
        <div className="shelf">
          {shelf.map((ing) => (
            <button key={ing.id} className="shelf-item" onClick={() => add(ing)}>
              <Sprite asset={ing.asset} w={60} h={60} />
              <span>{ing.name}</span>
            </button>
          ))}
        </div>
      </div>
      {monkeyMsg && <div className="coffee-monkey anim-enter-right"><Monkey emotion="laugh" size={90} /><span className="speech">{monkeyMsg}</span></div>}
    </div>
  );
}
