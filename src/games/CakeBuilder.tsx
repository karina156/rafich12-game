import { useMemo, useState } from 'react';
import type { LevelApi } from '../components/LevelShell';
import { useGame } from '../store/gameStore';
import { Sprite } from '../components/Sprite';
import { PixelButton } from '../components/PixelButton';
import { Karini } from '../characters/Karini';
import { Monkey } from '../characters/Monkey';
import { CAKE_NORMAL, CAKE_WEIRD } from '../data/dialogues';
import { pick } from '../utils/random';
import { sound } from '../audio/sound';
import type { AssetKey, KariniEmotion } from '../types/game';

interface Option { id: string; name: string; asset: AssetKey; bad?: boolean }
interface Step { key: 'base' | 'cream' | 'filling' | 'decor'; title: string; options: Option[] }

const STEPS: Step[] = [
  { key: 'base', title: 'Шаг 1. Выбери корж', options: [
    { id: 'vanilla', name: 'Ванильный корж', asset: 'cake.baseVanilla' },
    { id: 'chocolate', name: 'Шоколадный корж', asset: 'cake.baseChocolate' },
    { id: 'sneaker', name: 'Кроссовок', asset: 'bad.sneaker', bad: true },
  ] },
  { key: 'cream', title: 'Шаг 2. Выбери крем', options: [
    { id: 'pink', name: 'Розовый крем', asset: 'cake.creamPink' },
    { id: 'lavender', name: 'Лавандовый крем', asset: 'cake.creamLavender' },
    { id: 'ketchup', name: 'Кетчуп', asset: 'bad.ketchup', bad: true },
  ] },
  { key: 'filling', title: 'Шаг 3. Выбери начинку', options: [
    { id: 'berries', name: 'Ягоды', asset: 'cake.berries' },
    { id: 'cherry', name: 'Вишня', asset: 'cake.cherry' },
    { id: 'fish', name: 'Рыба', asset: 'bad.fish', bad: true },
    { id: 'broccoli', name: 'Брокколи', asset: 'bad.broccoli', bad: true },
  ] },
  { key: 'decor', title: 'Шаг 4. Выбери украшение', options: [
    { id: 'whipped', name: 'Сливки', asset: 'cake.whipped' },
    { id: 'berriesTop', name: 'Ягоды сверху', asset: 'cake.berries' },
    { id: 'sock', name: 'Носок', asset: 'item.sock', bad: true },
    { id: 'peel', name: 'Банановая кожура', asset: 'bad.bananaPeel', bad: true },
    { id: 'cucumber', name: 'Огурец', asset: 'bad.cucumber', bad: true },
  ] },
];

type Picks = Partial<Record<Step['key'], Option>>;

/** Торт собирается из слоёв: корж → крем → начинка → украшение (слои 512×~130 из набора торта) */
const LAYER_W = 180;
const LAYER_H = LAYER_W * 0.26;
const STAND = { w: 180, h: 142, top: 100 };

export function CakeView({ picks, size = 260 }: { picks: Picks; size?: number }) {
  const k = size / 260;
  const layers = [picks.base, picks.cream, picks.filling, picks.decor];
  // каждый слой ложится на предыдущий: съедобные слои перекрываются, «добавки Макаки» занимают больше места
  let y = STAND.top;
  const bottoms = layers.map((o) => { const b = y; if (o) y += o.bad ? 52 : LAYER_H * 0.62; return b; });
  return (
    <div className="cake-view" style={{ width: size, height: size }}>
      <Sprite asset="cake.plate" w={STAND.w * k} h={STAND.h * k} className="cake-layer" style={{ left: ((260 - STAND.w) / 2) * k, bottom: 0 }} />
      {layers.map((o, i) => {
        if (!o) return null;
        const w = (o.bad ? 70 : LAYER_W) * k;
        const h = (o.bad ? 70 : LAYER_H) * k;
        return (
          <Sprite
            key={o.id}
            asset={o.asset}
            w={w}
            h={h}
            className="cake-layer anim-drop"
            style={{ left: (size - w) / 2, bottom: bottoms[i] * k, zIndex: i + 1 }}
          />
        );
      })}
    </div>
  );
}

export function CakeBuilder({ onWin }: LevelApi) {
  const unlock = useGame((s) => s.unlockAchievement);
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Picks>({});
  const [reaction, setReaction] = useState<{ who: 'karini' | 'monkey'; text: string; emotion: KariniEmotion }>({ who: 'karini', text: 'Ну давай, шеф. Не подведи.', emotion: 'idle' });
  const cur = STEPS[step];
  // Макака каждый шаг «рекомендует» что-нибудь ужасное
  const monkeyTip = useMemo(() => (cur ? pick(cur.options.filter((o) => o.bad)) : null), [cur]);

  const choose = (o: Option) => {
    setPicks((p) => ({ ...p, [cur.key]: o }));
    if (o.bad) {
      sound.play('wrong_item');
      setReaction(pick([
        { who: 'karini', text: `${o.name.toUpperCase()}?? РАФИК, ТЫ ЧТО ДЕЛАЕШЬ 😭`, emotion: 'crying' },
        { who: 'monkey', text: 'ДА! ДА! ЕЩЁ!', emotion: 'idle' },
        { who: 'karini', text: 'Я ВООБЩЕ-ТО ЭТОТ ТОРТ ЕСТЬ БУДУ.', emotion: 'angry' },
      ] as const));
    } else {
      sound.play('gift_collect');
      setReaction(pick([
        { who: 'karini', text: 'О, красиво!', emotion: 'happy' },
        { who: 'karini', text: 'Вкусно выглядит. Не трогай, Макака.', emotion: 'happy' },
        { who: 'monkey', text: 'ФУ. СЛИШКОМ НОРМАЛЬНО.', emotion: 'idle' },
      ] as const));
    }
    setStep((s) => s + 1);
  };

  const confirm = () => {
    const weird = Object.values(picks).some((o) => o?.bad);
    unlock(weird ? 'gordonCries' : 'chef19');
    onWin({
      lines: weird ? CAKE_WEIRD : CAKE_NORMAL,
      title: weird ? 'ТОРТ... ГОТОВ?' : 'ИДЕАЛЬНЫЙ ТОРТ!',
      extra: (
        <div className="cake-result">
          <CakeView picks={picks} size={160} />
          <ul>{STEPS.map((s) => <li key={s.key} className={picks[s.key]?.bad ? 'bad' : ''}>{picks[s.key]?.name}</li>)}</ul>
        </div>
      ),
    });
  };

  return (
    <div className="cake">
      <div className="cake-left">
        <CakeView picks={picks} />
        <div className="cake-recipe">
          {STEPS.map((s, i) => (
            <div key={s.key} className={`recipe-row ${i === step ? 'current' : ''} ${picks[s.key]?.bad ? 'bad' : ''}`}>
              {i + 1}. {picks[s.key]?.name ?? '—'}
            </div>
          ))}
        </div>
      </div>
      <div className="cake-right">
        <div className="cake-reaction">
          {reaction.who === 'karini' ? <Karini emotion={reaction.emotion} size={72} /> : <Monkey emotion="laugh" size={72} />}
          <span className="speech">{reaction.text}</span>
        </div>
        {cur ? (
          <>
            <h3 className="cake-step">{cur.title}</h3>
            <div className="options">
              {cur.options.map((o) => (
                <button key={o.id} className={`option ${o.bad ? 'option-bad' : ''}`} onClick={() => choose(o)}>
                  <Sprite asset={o.asset} w={64} h={64} />
                  <span>{o.name}</span>
                  {monkeyTip?.id === o.id && <span className="option-tip">🐒 СОВЕТ МАКАКИ</span>}
                </button>
              ))}
            </div>
            {step > 0 && <PixelButton variant="ghost" size="sm" onClick={() => setStep(step - 1)}>← ШАГ НАЗАД</PixelButton>}
          </>
        ) : (
          <div className="cake-confirm">
            <h3 className="cake-step">Шаг 5. Торт готов?</h3>
            <div className="row center">
              <PixelButton size="lg" variant="pink" onClick={confirm}>ПОДТВЕРДИТЬ ТОРТ ✓</PixelButton>
              <PixelButton variant="ghost" size="sm" onClick={() => { setPicks({}); setStep(0); }}>ЗАНОВО</PixelButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
