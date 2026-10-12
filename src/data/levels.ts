import type { AssetKey, ItemId, LevelId, AchievementId } from '../types/game';

export interface LevelDef {
  id: LevelId;
  number: number | null;
  title: string;
  roomLabel: string;
  /** Уровень, который нужно пройти, чтобы открыть этот */
  requires: LevelId | null;
  reward: { coins: number; item?: ItemId; achievement?: AchievementId };
  icon: AssetKey;
  mission: string;
}

export const LEVELS: LevelDef[] = [
  { id: 'giftRain', number: 1, title: 'Подарочный дождь', roomLabel: 'Окно', requires: null,
    reward: { coins: 19, item: 'gifts' }, icon: 'item.giftRed', mission: 'Макака выкидывает подарки из окна. Поймай 19 штук!' },
  { id: 'cake', number: 2, title: 'Торт катастрофы', roomLabel: 'Стол', requires: 'giftRain',
    reward: { coins: 19, item: 'cake' }, icon: 'cake.creamPink', mission: 'Макака съела торт. Собери новый за столом.' },
  { id: 'candles', number: 3, title: '19 свечей', roomLabel: 'Свечи', requires: 'cake',
    reward: { coins: 19, item: 'candles', achievement: 'candleLord' }, icon: 'candles.lit', mission: 'Найди 19 свечей и задуй их. Загадай желание.' },
  { id: 'findGift', number: 4, title: 'Найди украденный подарок', roomLabel: 'Коробки', requires: 'candles',
    reward: { coins: 19, item: 'goldenKey', achievement: 'sherlock' }, icon: 'boxes.closed', mission: 'Макака спрятала золотой ключ в коробках. Следи внимательно.' },
  { id: 'partyChaos', number: 5, title: 'Праздничный хаос', roomLabel: 'Украшения', requires: 'findGift',
    reward: { coins: 19, item: 'partyKit', achievement: 'organizer' }, icon: 'party.balloon', mission: 'Макака ломает украшения. Почини праздник!' },
  { id: 'boss', number: 6, title: 'FINAL BOSS: Макака', roomLabel: 'Дверь', requires: 'partyChaos',
    reward: { coins: 190, item: 'chest', achievement: 'monkeySlayer' }, icon: 'monkey.angry', mission: 'Иди за дверь и победи Макаку.' },
  { id: 'coffee', number: null, title: 'Раф на лавандовом кокосовом', roomLabel: 'Кофемашина', requires: null,
    reward: { coins: 50, item: 'lavenderRaf', achievement: 'rafSquared' }, icon: 'coffee.ready', mission: 'Секрет: приготовь идеальный лавандовый раф.' },
];

export const STORY_LEVELS = LEVELS.filter((l) => l.number !== null);
export const getLevel = (id: LevelId) => LEVELS.find((l) => l.id === id)!;
