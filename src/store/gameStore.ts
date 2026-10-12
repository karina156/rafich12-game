import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AchievementId, CharacterId, GameState, ItemId, LevelId, SceneId } from '../types/game';
import { SAVE_KEY } from '../config';
import { getLevel, STORY_LEVELS } from '../data/levels';
import { PLAYABLE } from '../data/characters';
import { sound } from '../audio/sound';

export interface Popup {
  id: number;
  kind: 'achievement' | 'item' | 'coins';
  ref: string;
}

interface Actions {
  goTo: (scene: SceneId) => void;
  selectCharacter: (id: CharacterId) => void;
  markIntroSeen: () => void;
  /** Засчитывает уровень. Награда выдаётся только при первом прохождении. Возвращает true, если это первое прохождение. */
  completeLevel: (id: LevelId) => boolean;
  unlockAchievement: (id: AchievementId) => void;
  addItem: (id: ItemId) => void;
  addCoins: (n: number) => void;
  setCoffeeUnlocked: () => void;
  markDialogueSeen: (id: string) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  finishGame: () => void;
  /** «Пройти игру ещё раз»: сбрасывает сюжет, но сохраняет достижения, монеты и выбор Рафа */
  newGamePlus: () => void;
  resetAll: () => void;
  dismissPopup: (id: number) => void;
  setPaused: (p: boolean) => void;
}

interface Transient {
  popups: Popup[];
  paused: boolean;
}

export type Store = GameState & Transient & Actions;

const initialState: GameState = {
  selectedCharacter: null,
  currentScene: 'start',
  introSeen: false,
  completedLevels: [],
  inventory: [],
  achievements: [],
  birthdayCoins: 0,
  coffeeUnlocked: false,
  coffeeCompleted: false,
  monkeyDefeated: false,
  stickerPackUnlocked: false,
  soundEnabled: true,
  musicEnabled: true,
  seenDialogues: [],
  timesFinished: 0,
};

let popupSeq = 1;

export const useGame = create<Store>()(
  persist(
    (set, get) => {
      const pushPopup = (kind: Popup['kind'], ref: string) =>
        set((s) => ({ popups: [...s.popups, { id: popupSeq++, kind, ref }] }));

      return {
        ...initialState,
        popups: [],
        paused: false,

        goTo: (scene) => set({ currentScene: scene, paused: false }),

        selectCharacter: (id) => {
          set({ selectedCharacter: id });
          get().unlockAchievement('firstStep');
        },

        markIntroSeen: () => set({ introSeen: true }),

        completeLevel: (id) => {
          const s = get();
          if (s.completedLevels.includes(id)) return false;
          const level = getLevel(id);
          set({
            completedLevels: [...s.completedLevels, id],
            birthdayCoins: s.birthdayCoins + level.reward.coins,
            ...(id === 'coffee' ? { coffeeCompleted: true } : {}),
            ...(id === 'boss' ? { monkeyDefeated: true } : {}),
          });
          pushPopup('coins', String(level.reward.coins));
          if (level.reward.item) get().addItem(level.reward.item);
          if (level.reward.achievement) get().unlockAchievement(level.reward.achievement);
          return true;
        },

        unlockAchievement: (id) => {
          if (get().achievements.includes(id)) return;
          set((s) => ({ achievements: [...s.achievements, id] }));
          pushPopup('achievement', id);
          sound.play('achievement');
        },

        addItem: (id) => {
          if (get().inventory.includes(id)) return;
          set((s) => ({ inventory: [...s.inventory, id] }));
          pushPopup('item', id);
        },

        addCoins: (n) => set((s) => ({ birthdayCoins: Math.max(0, s.birthdayCoins + n) })),

        setCoffeeUnlocked: () => set({ coffeeUnlocked: true }),

        markDialogueSeen: (id) => {
          if (get().seenDialogues.includes(id)) return;
          set((s) => ({ seenDialogues: [...s.seenDialogues, id] }));
        },

        toggleSound: () => {
          const v = !get().soundEnabled;
          set({ soundEnabled: v });
          sound.setSfxEnabled(v);
        },
        toggleMusic: () => {
          const v = !get().musicEnabled;
          set({ musicEnabled: v });
          sound.setMusicEnabled(v);
        },

        finishGame: () => {
          const s = get();
          if (!s.stickerPackUnlocked) {
            set({ stickerPackUnlocked: true, timesFinished: s.timesFinished + 1 });
            get().addItem('stickerPack');
          }
          get().unlockAchievement('legend19');
        },

        newGamePlus: () =>
          set((s) => ({
            ...initialState,
            selectedCharacter: s.selectedCharacter,
            achievements: s.achievements,
            birthdayCoins: s.birthdayCoins,
            seenDialogues: s.seenDialogues,
            soundEnabled: s.soundEnabled,
            musicEnabled: s.musicEnabled,
            timesFinished: s.timesFinished,
            introSeen: true,
            currentScene: 'select',
          })),

        resetAll: () => set({ ...initialState, popups: [], paused: false }),

        dismissPopup: (id) => set((s) => ({ popups: s.popups.filter((p) => p.id !== id) })),
        setPaused: (p) => set({ paused: p }),
      };
    },
    {
      name: SAVE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        const { popups: _p, paused: _pa, ...rest } = s;
        const data: Partial<Store> = {};
        for (const k of Object.keys(initialState) as (keyof GameState)[]) {
          (data as Record<string, unknown>)[k] = rest[k];
        }
        return data as GameState;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        const merged = { ...current, ...p };
        // вариант Рафи убрали с экрана выбора — просим выбрать заново
        if (merged.selectedCharacter && !PLAYABLE.includes(merged.selectedCharacter)) {
          merged.selectedCharacter = null;
          merged.currentScene = 'select';
        }
        // Если игрок закрыл вкладку посреди уровня — возвращаем в безопасную сцену
        if (merged.currentScene?.startsWith('level:') || merged.currentScene === 'intro') {
          merged.currentScene = merged.selectedCharacter ? 'room' : 'start';
        }
        return merged;
      },
    },
  ),
);

/* ---------- селекторы ---------- */

export const isLevelUnlocked = (s: GameState, id: LevelId): boolean => {
  if (id === 'coffee') return s.coffeeUnlocked;
  const lvl = getLevel(id);
  return lvl.requires === null || s.completedLevels.includes(lvl.requires);
};

export const storyProgress = (s: GameState): number =>
  STORY_LEVELS.filter((l) => s.completedLevels.includes(l.id)).length;

export const currentMission = (s: GameState): string => {
  const next = STORY_LEVELS.find((l) => !s.completedLevels.includes(l.id));
  if (next) return next.mission;
  if (!s.stickerPackUnlocked) return 'Макака уронила сундук. Открой его золотым ключом!';
  return 'Праздник спасён. Можно пересмотреть стикерпак или перепройти уровни.';
};
