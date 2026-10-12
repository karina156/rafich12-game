import type { CharacterDef } from '../data/characters';
import { Raf } from '../characters/Raf';
import { Panel } from './Panel';

export function CharacterSelectCard({ def, index, total }: { def: CharacterDef; index: number; total: number }) {
  return (
    <Panel className="cs-card" key={def.id}>
      <div className="cs-num">{index + 1}/{total}</div>
      <div className="cs-art"><Raf id={def.id} size={200} /></div>
      <div className="cs-info">
        <h2 className="cs-name">{def.name}</h2>
        <div className="cs-ability">✦ Способность: <b>{def.ability}</b></div>
        <p className="cs-desc">{def.description}</p>
        <div className="cs-stats">
          {def.stats.map((s) => (
            <div className="cs-stat" key={s.label}>
              <span>{s.label}</span>
              <span className="cs-stat-bar">
                {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < s.value ? 'on' : ''} />)}
              </span>
            </div>
          ))}
        </div>
        <div className="cs-bonus">БОНУС: {def.bonusText}</div>
        <div className="cs-bonus">СУПЕРАТАКА: {def.special.name}</div>
      </div>
    </Panel>
  );
}
