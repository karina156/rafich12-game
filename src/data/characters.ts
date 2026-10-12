import type { AssetKey, CharacterId } from '../types/game';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  ability: string;
  description: string;
  kariniLine: string;
  sprite: AssetKey;
  stats: { label: string; value: number }[];
  /** Особая атака в бою с Макакой */
  special: { name: string; description: string };
  /** Короткий бонус, который показывается игроку */
  bonusText: string;
  /** Фраза Карини в финале */
  finalLine: string;
}

/** Все варианты Рафи, которые поддерживает код. */
export const ALL_CHARACTERS: CharacterDef[] = [
  {
    id: 'worker',
    name: 'Раф-работяга',
    ability: 'Сверхурочные',
    description: 'Устал ещё до начала игры. Даже в свой день рождения думает о работе.',
    kariniLine: 'ТЫ ЧЁ, ДАЖЕ В ДЕНЬ РОЖДЕНИЯ НА СМЕНУ СОБРАЛСЯ?',
    sprite: 'raf.worker',
    stats: [
      { label: 'Выносливость', value: 9 },
      { label: 'Милота', value: 5 },
      { label: 'Скорость', value: 6 },
      { label: 'Кофеин', value: 8 },
    ],
    special: { name: 'Ночная смена', description: 'Двойной урон, но Раф устаёт (−5 HP)' },
    bonusText: '+8 секунд в «Подарочном дожде»',
    finalLine: 'Сегодня без смен. Сегодня только праздник.',
  },
  {
    id: 'lover',
    name: 'Влюблённый Раф',
    ability: 'Сила обнимашек',
    description: 'Милота +100. Бонус к поддержке Карини.',
    kariniLine: 'ОЙ НУ ВСЁ, РОМАНТИК ВЫШЕЛ НА ОХОТУ.',
    sprite: 'raf.lover',
    stats: [
      { label: 'Выносливость', value: 6 },
      { label: 'Милота', value: 10 },
      { label: 'Скорость', value: 5 },
      { label: 'Кофеин', value: 4 },
    ],
    special: { name: 'Обнимашки Карини', description: 'Карини лечит Рафа на 30 HP и бьёт Макаку' },
    bonusText: 'Карини лечит в бою с боссом',
    finalLine: 'Ну всё, романтик, можешь обнимать.',
  },
  {
    id: 'cute',
    name: 'Милый Раф',
    ability: 'Щенячий взгляд',
    description: 'Слишком милый, чтобы проигрывать.',
    kariniLine: 'НУ ТАКОГО ДАЖЕ МАКАКА НЕ ДОЛЖНА ОБИЖАТЬ.',
    sprite: 'raf.cute',
    stats: [
      { label: 'Выносливость', value: 5 },
      { label: 'Милота', value: 10 },
      { label: 'Скорость', value: 7 },
      { label: 'Кофеин', value: 5 },
    ],
    special: { name: 'Щенячий взгляд', description: 'Макака растрогана и пропускает ход' },
    bonusText: 'Макака реже зажигает свечи и чаще промахивается',
    finalLine: 'Самый милый именинник. Официально.',
  },
  {
    id: 'lavender',
    name: 'Лавандовый Раф',
    ability: 'Кокосовый перегруз',
    description: 'На 90% состоит из лавандового рафа на кокосовом молоке.',
    kariniLine: 'АХАХАХА ЛАВАНДОВЫЙ РАФ ИДЁТ СПАСАТЬ ПРАЗДНИК.',
    sprite: 'raf.lavender',
    stats: [
      { label: 'Выносливость', value: 6 },
      { label: 'Милота', value: 8 },
      { label: 'Скорость', value: 6 },
      { label: 'Кофеин', value: 10 },
    ],
    special: { name: 'Кокосовый перегруз', description: 'Мощный удар; кофейная ульта сильнее' },
    bonusText: 'Кофейная ульта наносит больше урона',
    finalLine: 'Ты буквально кофе. Но мой любимый кофе.',
  },
  {
    id: 'sigma',
    name: 'Раф-сигма',
    ability: 'Сигма-взгляд',
    description: 'Не просит подарки. Они сами к нему приходят.',
    kariniLine: 'НУ ВСЁ, МАКАКЕ КОНЕЦ.',
    sprite: 'raf.sigma',
    stats: [
      { label: 'Выносливость', value: 7 },
      { label: 'Милота', value: 4 },
      { label: 'Скорость', value: 8 },
      { label: 'Кофеин', value: 7 },
    ],
    special: { name: 'Сигма-взгляд', description: 'Гарантированный крит' },
    bonusText: 'Подарки падают чаще',
    finalLine: 'Подарок сам к тебе пришёл. Как ты и говорил.',
  },
  {
    id: 'grandpa',
    name: 'Раф-дед',
    ability: 'Боль в спине',
    description: '19 лет. Уже пора пить таблетки и обсуждать погоду.',
    kariniLine: 'ДЕДУЛЯ, ТЕБЕ ВООБЩЕ-ТО ТОЛЬКО 19.',
    sprite: 'raf.grandpa',
    stats: [
      { label: 'Выносливость', value: 4 },
      { label: 'Милота', value: 7 },
      { label: 'Скорость', value: 3 },
      { label: 'Кофеин', value: 6 },
    ],
    special: { name: 'Лекция о погоде', description: 'Макака засыпает на 2 хода' },
    bonusText: 'Всё падает медленнее (спина же)',
    finalLine: 'Дедуль, с днём рождения. Таблетки на тумбочке.',
  },
];

/**
 * Варианты, доступные на экране выбора. Нарисованы три скина: работяга, влюблённый, дед.
 * Чтобы вернуть остальных, добавь их id сюда и положи PNG в public/assets/characters/raf/.
 */
export const PLAYABLE: CharacterId[] = ['worker', 'lover', 'grandpa'];

export const CHARACTERS: CharacterDef[] = ALL_CHARACTERS.filter((c) => PLAYABLE.includes(c.id));

/** Если в сохранении остался вариант, которого больше нет на выборе, берётся первый доступный */
export const getCharacter = (id: CharacterId | null): CharacterDef =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
