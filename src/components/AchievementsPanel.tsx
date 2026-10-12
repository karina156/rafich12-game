import { Sprite } from './Sprite';
import { useGame } from '../store/gameStore';
import { ACHIEVEMENTS } from '../data/achievements';
import { Modal } from './Modal';

export function AchievementsPanel({ onClose }: { onClose: () => void }) {
  const got = useGame((s) => s.achievements);
  return (
    <Modal title={`ДОСТИЖЕНИЯ ${got.length}/${ACHIEVEMENTS.length}`} onClose={onClose} wide>
      <div className="ach-list">
        {ACHIEVEMENTS.map((a) => {
          const has = got.includes(a.id);
          return (
            <div key={a.id} className={`ach-row ${has ? 'ach-got' : 'ach-locked'}`}>
              <span className="ach-icon"><Sprite asset={has ? 'icon.star' : 'icon.lock'} w={28} h={28} /></span>
              <div>
                <div className="ach-title">{has || !a.secret ? a.title : '??? СЕКРЕТ'}</div>
                <div className="ach-desc">{has || !a.secret ? a.description : 'Попробуй потыкать на всё в комнате...'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
