import type manifest from '../data/assets.manifest.json';

export type AssetKey = keyof typeof manifest.assets;

export type CharacterId = 'worker' | 'lover' | 'cute' | 'lavender' | 'sigma' | 'grandpa';

export type KariniEmotion = 'idle' | 'happy' | 'angry' | 'shocked' | 'crying' | 'shy' | 'party';
export type MonkeyEmotion = 'laugh' | 'angry' | 'shocked' | 'banana' | 'gift' | 'crying';

export type LevelId = 'giftRain' | 'cake' | 'candles' | 'findGift' | 'partyChaos' | 'boss' | 'coffee';

export type SceneId =
  | 'start'
  | 'intro'
  | 'select'
  | 'room'
  | 'final'
  | 'credits'
  | `level:${LevelId}`;

export type LevelPhase = 'introduction' | 'playing' | 'victory' | 'retry' | 'completed';

export type ItemId = 'gifts' | 'cake' | 'candles' | 'goldenKey' | 'partyKit' | 'lavenderRaf' | 'chest' | 'stickerPack';

export type AchievementId =
  | 'alreadyGrandpa'
  | 'sockMagnate'
  | 'gordonCries'
  | 'chef19'
  | 'candleLord'
  | 'sherlock'
  | 'organizer'
  | 'rafSquared'
  | 'monkeySlayer'
  | 'legend19'
  | 'firstStep';

export type Speaker = 'karini' | 'monkey' | 'raf' | 'system';

export interface DialogueLine {
  speaker: Speaker;
  text: string;
  emotion?: KariniEmotion | MonkeyEmotion;
  /** Произвольная метка, чтобы сцена могла отреагировать (показать предмет, glitch и т.д.) */
  cue?: string;
}

export interface GameState {
  selectedCharacter: CharacterId | null;
  currentScene: SceneId;
  introSeen: boolean;
  completedLevels: LevelId[];
  inventory: ItemId[];
  achievements: AchievementId[];
  birthdayCoins: number;
  coffeeUnlocked: boolean;
  coffeeCompleted: boolean;
  monkeyDefeated: boolean;
  stickerPackUnlocked: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  seenDialogues: string[];
  /** Сколько раз игра пройдена до конца */
  timesFinished: number;
}
