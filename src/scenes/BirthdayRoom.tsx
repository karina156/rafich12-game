import { useMemo, useRef, useState } from 'react';
import { isLevelUnlocked, useGame } from '../store/gameStore';
import { GameHUD } from '../components/GameHUD';
import { QuestTracker } from '../components/QuestTracker';
import { FitBox } from '../components/FitBox';
import { Sprite } from '../components/Sprite';
import { SceneBackground } from '../components/SceneBackground';
import { DialogueBox } from '../components/DialogueBox';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { Karini } from '../characters/Karini';
import { KARINI_ROOM_QUIPS, ROOM_FIRST_VISIT, LEVEL_INTROS } from '../data/dialogues';
import { KARINI_SPOT, ROOM_OBJECTS, ROOM_SIZE, type RoomObject } from '../data/roomLayout';
import { getLevel, STORY_LEVELS } from '../data/levels';
import { COFFEE_TAPS_TO_UNLOCK } from '../config';
import { pick } from '../utils/random';
import { useTimers } from '../hooks/useTimers';
import { sound } from '../audio/sound';
import type { DialogueLine, GameState, LevelId } from '../types/game';

const visible = (o: RoomObject, s: GameState) => {
  switch (o.when) {
    case undefined:
    case 'always': return true;
    case 'notPartyChaos': return !s.completedLevels.includes('partyChaos');
    case 'boss': return s.monkeyDefeated;
    default: return s.completedLevels.includes(o.when);
  }
};

export function BirthdayRoom() {
  const state = useGame();
  const { goTo, setCoffeeUnlocked } = state;
  const timers = useTimers();
  const [talk, setTalk] = useState<{ id?: string; lines: DialogueLine[]; after?: () => void } | null>(
    state.seenDialogues.includes('room:first') ? null : { id: 'room:first', lines: ROOM_FIRST_VISIT },
  );
  const [bubble, setBubble] = useState<{ text: string; x: number; y: number } | null>(null);
  const coffeeTaps = useRef(0);
  const restored = state.completedLevels.includes('partyChaos');
  const nextLevel = STORY_LEVELS.find((l) => !state.completedLevels.includes(l.id))?.id;

  const say = (text: string, x: number, y: number) => {
    setBubble({ text, x, y });
    timers.after(1800, () => setBubble(null));
  };

  const openLevel = (id: LevelId, o: RoomObject) => {
    if (!isLevelUnlocked(state, id)) {
      sound.play('wrong_item');
      const req = getLevel(id).requires;
      say(req ? `Сначала: «${getLevel(req).title}»` : 'Пока закрыто', o.x + o.w / 2, o.y);
      return;
    }
    sound.play('click');
    goTo(`level:${id}`);
  };

  const onObject = (o: RoomObject) => {
    if (o.id === 'chest') { goTo('final'); return; }
    if (o.id === 'coffee') {
      if (state.coffeeUnlocked) { goTo('level:coffee'); return; }
      coffeeTaps.current += 1;
      sound.play('click');
      if (coffeeTaps.current >= COFFEE_TAPS_TO_UNLOCK) {
        setCoffeeUnlocked();
        setTalk({ lines: [LEVEL_INTROS.coffee[0]], after: () => goTo('level:coffee') });
      } else {
        say(['*бжжж*', '*пшшш*', 'кофемашина что-то знает...', 'ещё чуть-чуть...'][coffeeTaps.current - 1] ?? '...', o.x + o.w / 2, o.y);
      }
      return;
    }
    if (o.level) { openLevel(o.level, o); return; }
    say(pick(['Обычная мебель. Но праздничная.', 'Тут ничего нет.', 'Макака тут тоже побывала.']), o.x + o.w / 2, o.y);
  };

  const objects = useMemo(() => ROOM_OBJECTS.filter((o) => visible(o, state)), [state]);

  return (
    <div className="room-scene">
      <GameHUD />
      <div className="room-wrap">
        <FitBox w={ROOM_SIZE.w} h={ROOM_SIZE.h}>
          <div className={`room ${restored ? 'room-festive' : 'room-broken'}`}>
            <SceneBackground asset="room.base" className="room-base" />
            {objects.map((o) => {
              const lvl = o.level ?? (o.id === 'coffee' && state.coffeeUnlocked ? 'coffee' : undefined);
              const unlocked = lvl ? isLevelUnlocked(state, lvl) : false;
              const done = lvl ? state.completedLevels.includes(lvl) : false;
              const interactive = !!o.level || o.id === 'coffee' || o.id === 'chest';
              return (
                <button
                  key={o.id}
                  className={`room-obj ${o.zone ? 'room-obj-zone' : ''} ${interactive ? 'room-obj-hot' : ''} ${o.id === 'chest' ? 'anim-glow' : ''}`}
                  style={{ left: o.x, top: o.y, width: o.w, height: o.h, zIndex: o.z }}
                  onClick={() => onObject(o)}
                  aria-label={lvl ? getLevel(lvl).title : o.id}
                >
                  {!o.zone && <Sprite asset={o.asset} w={o.w} h={o.h} />}
                  {o.level && (
                    <span className={`marker ${done ? 'marker-done' : unlocked ? 'marker-open' : 'marker-locked'} ${o.level === nextLevel ? 'anim-bounce' : ''}`}>
                      {done ? '✓' : unlocked ? '!' : <Sprite asset="icon.lock" w={16} h={16} />}
                    </span>
                  )}
                  {o.id === 'chest' && <span className="marker marker-open anim-bounce">★</span>}
                  {lvl && <span className="room-label">{getLevel(lvl).title}</span>}
                </button>
              );
            })}
            <button
              className="room-karini"
              style={{ left: KARINI_SPOT.x, top: KARINI_SPOT.y, zIndex: 9 }}
              onClick={() => !talk && setTalk({ lines: [pick(KARINI_ROOM_QUIPS)] })}
              aria-label="Карини"
            >
              <Karini emotion={restored ? 'happy' : state.completedLevels.length === 0 ? 'crying' : 'idle'} size={KARINI_SPOT.size} />
            </button>
            {restored && <div className="room-lights" />}
            {restored && <ConfettiEffect count={24} />}
            {bubble && (
              <div className="bubble anim-pop" style={{ left: bubble.x, top: bubble.y }}>{bubble.text}</div>
            )}
          </div>
        </FitBox>
      </div>
      <QuestTracker />
      {talk && (
        <DialogueBox
          id={talk.id}
          lines={talk.lines}
          onDone={() => { const a = talk.after; setTalk(null); a?.(); }}
        />
      )}
    </div>
  );
}
