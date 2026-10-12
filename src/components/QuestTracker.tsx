import { currentMission, useGame } from '../store/gameStore';

export function QuestTracker() {
  const mission = useGame((s) => currentMission(s));
  return (
    <div className="quest">
      <span className="quest-tag">МИССИЯ</span>
      <span className="quest-text">{mission}</span>
    </div>
  );
}
