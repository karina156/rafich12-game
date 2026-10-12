import { useEffect } from 'react';
import { useGame, type Popup } from '../store/gameStore';
import { getAchievement } from '../data/achievements';
import { ITEMS } from '../data/items';
import { Sprite } from './Sprite';
import type { AchievementId, ItemId } from '../types/game';

function PopupCard({ p }: { p: Popup }) {
  const dismiss = useGame((s) => s.dismissPopup);
  useEffect(() => {
    const t = window.setTimeout(() => dismiss(p.id), 3200);
    return () => window.clearTimeout(t);
  }, [p.id, dismiss]);

  if (p.kind === 'achievement') {
    const a = getAchievement(p.ref as AchievementId);
    return (
      <div className="toast toast-ach" onClick={() => dismiss(p.id)}>
        <span className="toast-star">★</span>
        <div><div className="toast-kicker">ДОСТИЖЕНИЕ!</div><div className="toast-title">{a.title}</div></div>
      </div>
    );
  }
  if (p.kind === 'item') {
    const it = ITEMS[p.ref as ItemId];
    return (
      <div className="toast toast-item" onClick={() => dismiss(p.id)}>
        <Sprite asset={it.sprite} w={40} h={40} />
        <div><div className="toast-kicker">ПОЛУЧЕН ПРЕДМЕТ</div><div className="toast-title">{it.name}</div></div>
      </div>
    );
  }
  return (
    <div className="toast toast-coins" onClick={() => dismiss(p.id)}>
      <span className="toast-star">◉</span>
      <div><div className="toast-kicker">BIRTHDAY COINS</div><div className="toast-title">+{p.ref}</div></div>
    </div>
  );
}

/** Очередь уведомлений: достижения, предметы, монеты */
export function AchievementPopup() {
  const popups = useGame((s) => s.popups);
  return (
    <div className="toasts">
      {popups.slice(0, 3).map((p) => <PopupCard key={p.id} p={p} />)}
    </div>
  );
}
