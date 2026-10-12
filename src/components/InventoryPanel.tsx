import { useGame } from '../store/gameStore';
import { ITEMS } from '../data/items';
import { Sprite } from './Sprite';
import { Modal } from './Modal';
import type { ItemId } from '../types/game';

export function InventoryPanel({ onClose }: { onClose: () => void }) {
  const inventory = useGame((s) => s.inventory);
  const coins = useGame((s) => s.birthdayCoins);
  const all = Object.keys(ITEMS) as ItemId[];
  return (
    <Modal title="ИНВЕНТАРЬ" onClose={onClose} wide>
      <p className="muted">Birthday coins: <b>{coins}</b></p>
      <div className="inv-grid">
        {all.map((id) => {
          const has = inventory.includes(id);
          const it = ITEMS[id];
          return (
            <div key={id} className={`inv-slot ${has ? '' : 'inv-empty'}`}>
              {has ? <Sprite asset={it.sprite} w={56} h={56} /> : <span className="inv-q">?</span>}
              <div className="inv-name">{has ? it.name : '???'}</div>
              {has && <div className="inv-desc">{it.description}</div>}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
