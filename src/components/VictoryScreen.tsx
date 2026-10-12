import type { ReactNode } from 'react';
import { ConfettiEffect } from './ConfettiEffect';
import { PixelButton } from './PixelButton';
import { Panel } from './Panel';
import { Sprite } from './Sprite';
import type { LevelDef } from '../data/levels';
import { ITEMS } from '../data/items';
import { getAchievement } from '../data/achievements';

export function VictoryScreen({ level, firstTime, onContinue, onReplay, extra, title = 'VICTORY!' }: {
  level: LevelDef; firstTime: boolean; onContinue: () => void; onReplay: () => void; extra?: ReactNode; title?: string;
}) {
  const r = level.reward;
  return (
    <div className="victory">
      <div className="victory-flash" />
      <ConfettiEffect count={70} />
      <Panel className="victory-card anim-pop">
        <div className="victory-trophy"><Sprite asset="icon.trophy" w={84} h={84} /></div>
        <h2 className="victory-title">{title}</h2>
        <div className="victory-level">{level.number ? `LEVEL 0${level.number}` : 'SECRET LEVEL'} · {level.title}</div>
        {extra}
        {firstTime ? (
          <div className="victory-rewards">
            <div className="reward-row">◉ +{r.coins} birthday coins</div>
            {r.item && (
              <div className="reward-row"><Sprite asset={ITEMS[r.item].sprite} w={36} h={36} /> {ITEMS[r.item].name}</div>
            )}
            {r.achievement && <div className="reward-row">★ {getAchievement(r.achievement).title}</div>}
          </div>
        ) : (
          <p className="muted">Награды за этот уровень уже получены. Но респект за перепрохождение.</p>
        )}
        <div className="row center">
          <PixelButton variant="pink" onClick={onContinue}>В КОМНАТУ ⌂</PixelButton>
          <PixelButton variant="ghost" size="sm" onClick={onReplay}>ЕЩЁ РАЗ ↺</PixelButton>
        </div>
      </Panel>
    </div>
  );
}
