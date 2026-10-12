import type { CharacterId, DialogueLine } from '../types/game';

const K = (text: string, emotion: DialogueLine['emotion'] = 'idle', cue?: string): DialogueLine => ({
  speaker: 'karini', text, emotion, cue,
});
const M = (text: string, emotion: DialogueLine['emotion'] = 'laugh', cue?: string): DialogueLine => ({
  speaker: 'monkey', text, emotion, cue,
});
const R = (text: string): DialogueLine => ({ speaker: 'raf', text });

export const INTRO_PART_1: DialogueLine[] = [
  K('РАФИИИК, С ДНЁМ РОЖДЕНИЯЯЯ!! Я ТУТ ТЕБЕ ТАКОЕ ПРИГОТОВИЛА.', 'party', 'showGift'),
  { speaker: 'system', text: '...', cue: 'glitch' },
  M('УАААА 🐒 ПОДАРОЧЕК ТЕПЕРЬ МОЙ.', 'gift', 'monkeySteal'),
  K('...', 'shocked'),
  K('РАФИК.', 'shocked'),
  K('ЭТА МАКАКА УКРАЛА ТВОЙ ПОДАРОК.', 'shocked'),
  M('АХАХАХАХАХАХ.', 'laugh', 'monkeyPeek'),
  K('ВСЁ. МНЕ НАДОЕЛО. ИДИ ЕЁ ПОБЕЖДАЙ.', 'angry', 'monkeyLeave'),
];
export const INTRO_PART_2: DialogueLine[] = [
  R('Я просто хотел отметить др...'),
  K('Поздно. Ты уже в сюжете.', 'happy'),
];

export const ROOM_FIRST_VISIT: DialogueLine[] = [
  K('Вот твоя комната. Ну, то, что от неё осталось.', 'crying'),
  K('Подарков нет, торта нет, гирлянда не горит. Макака постаралась.', 'angry'),
  K('Нажимай на предметы в комнате, где мигает значок. Начни с окна!', 'happy'),
];

export const LEVEL_INTROS: Record<string, DialogueLine[]> = {
  giftRain: [
    M('ЛОВИ, ИМЕНИННИК. ЛОВИ СВОИ ПОДАРКИ АХАХА.', 'banana'),
    K('НЕ ЛОВИ БАНАНЫ, ОНА ИХ СПЕЦИАЛЬНО КИДАЕТ.', 'angry'),
    K('Двигай корзину пальцем, мышкой или стрелками. Нужно 19 подарков!', 'idle'),
  ],
  cake: [
    M('Я УЖЕ ПОЕЛА ТВОЙ ТОРТ. ОЧЕНЬ ВКУСНЫЙ БЫЛ.', 'laugh'),
    K('УБЕРИТЕ ЭТУ МАКАКУ С КУХНИ.', 'angry'),
    K('Собери новый торт: корж, крем, начинка, украшение. Только не слушай её советы.', 'idle'),
  ],
  candles: [
    M('А СВЕЧЕЙ-ТО НЕТУ. ЖЕЛАНИЕ НЕ ЗАГАДАЕШЬ, ХИ-ХИ.', 'laugh'),
    K('Она их раскидала по всей комнате. Собери все 19, они мелькают то тут, то там!', 'angry'),
  ],
  findGift: [
    M('ДАВАЙ, УМНИК, ИЩИ.', 'gift'),
    K('РАФИК, СМОТРИ ВНИМАТЕЛЬНО. ЭТА МАКАКА ЖУЛЬНИЧАЕТ.', 'shocked'),
    K('Запомни коробку с ключом и следи за ней. Три раунда.', 'idle'),
  ],
  partyChaos: [
    K('ВСЁ, Я БОЛЬШЕ НИКОГДА НЕ БУДУ ДЕЛАТЬ ДЕНЬ РОЖДЕНИЯ В ОДИНОЧКУ.', 'crying'),
    M('АХАХАХА СЛЕДУЮЩИЙ РАЗ МЕНЯ ПРИГЛАСИТЕ.', 'laugh'),
    K('Нажимай на сломанные вещи и чини их, пока шкала хаоса не заполнилась!', 'angry'),
  ],
  coffee: [
    K('РАФ, А ТЫ ЗНАЕШЬ, ЧТО ТЫ КОФЕ?', 'happy'),
    K('Добро пожаловать в секретную кофейню. Приготовь идеальный ЛАВАНДОВЫЙ РАФ НА КОКОСОВОМ МОЛОКЕ.', 'happy'),
    M('Я ТОЖЕ ТУТ РАБОТАЮ. БАРИСТОЙ. Я ВСЁ ПЕРЕСТАВЛЯЮ.', 'laugh'),
  ],
  boss: [
    M('УААА, ТЫ ДОБРАЛСЯ. НО МОИ БАНАНЫ НЕПОБЕДИМЫ.', 'banana'),
    K('РАФИК, ПОЖАЛУЙСТА, ПОБЕДИ ЕЁ. Я УЖЕ ХОЧУ ТОРТИК.', 'crying'),
  ],
};

export const LEVEL_VICTORY: Record<string, DialogueLine[]> = {
  giftRain: [K('УРААА, МОЛОДЕЦ. ХОТЬ ЧТО-ТО ИЗ ЭТОГО ПРАЗДНИКА МЫ СПАСЛИ.', 'happy')],
  findGift: [M('ТЫ ПОДГЛЯДЫВАЛ. Я ЗНАЮ.', 'angry'), K('ОН ПРОСТО УМНЫЙ, СМИРИСЬ.', 'happy')],
  partyChaos: [K('PARTY RESTORED! Комната как новая. Я сейчас расплачусь.', 'happy'), M('ЭЭЭ, А ГДЕ МОЙ ХАОС?', 'shocked')],
  candles: [K('Ну вот. Теперь желание точно сбудется.', 'shy')],
};

export const CAKE_WEIRD: DialogueLine[] = [
  K('РАФИК, А ТЫ ТОЧНО ХОЧЕШЬ ДОЖИТЬ ДО 20?', 'shocked'),
  M('МНЕ НРАВИТСЯ. ОСОБЕННО НОСОК.', 'laugh'),
];
export const CAKE_NORMAL: DialogueLine[] = [
  K('Я ТЕБЯ БЕРУ ШЕФ-ПОВАРОМ НА СЛЕДУЮЩИЙ ДР.', 'happy'),
  M('ФУ. НОРМАЛЬНЫЙ ТОРТ. СКУКОТА.', 'angry'),
];

export const COFFEE_WRONG = 'ЭТО НЕ РАФ. ЭТО КАКОЙ-ТО АРТЁМ НА ОВСЯНОМ.';
export const coffeeWin = (char: CharacterId | null): DialogueLine[] => [
  K('РАФ ПРИГОТОВИЛ РАФА. ВСЕЛЕННАЯ БОЛЬШЕ НЕ ИМЕЕТ СМЫСЛА.', 'shocked'),
  ...(char === 'lavender' ? [K('БРАТ, ТЫ ТОЛЬКО ЧТО ПРИГОТОВИЛ СЕБЯ.', 'shocked')] : []),
  K('Это теперь твоя секретная атака против Макаки. ☕', 'happy'),
];

export const BOSS_DEFEAT: DialogueLine[] = [
  M('ЛАДНООО. ТВОЙ ДЕНЬ РОЖДЕНИЯ. ЗАБИРАЙ.', 'crying', 'dropChest'),
  K('РАФИИИИК, МЫ ЭТО СДЕЛАЛИ.', 'happy'),
];

export const FINAL_TALK: DialogueLine[] = [
  K('Ладно, на самом деле я всё это затеяла, потому что хотела сделать тебе особенный подарок.', 'shy'),
  K('Он немного странный. Но зато только наш.', 'happy'),
];

export const POST_CREDITS: DialogueLine[] = [
  M('ПОДОЖДИТЕ.', 'shocked'),
  M('А Я В СТИКЕРПАКЕ ЕСТЬ?', 'gift'),
  K('К СОЖАЛЕНИЮ, ДА.', 'angry'),
  M('УАААА. ЛАДНО, С ДР РАФИК.', 'laugh', 'monkeyRun'),
];

/** Случайные реплики Карини в комнате при нажатии на неё */
export const KARINI_ROOM_QUIPS: DialogueLine[] = [
  K('ДАВАЙ, Я В ТЕБЯ ВЕРЮ.', 'happy'),
  K('ТЫ ЧЁ, КИБЕРСПОРТСМЕН?', 'shocked'),
  K('Я ВООБЩЕ-ТО ЭТУ ИГРУ ДЕЛАЛА.', 'angry'),
  K('УБЕРИТЕ ЭТУ МАКАКУ.', 'angry'),
  K('РАФИК, ТЫ ЧТО ДЕЛАЕШЬ 😭', 'crying'),
  K('С днём рождения, кстати. Я напоминаю на всякий случай.', 'shy'),
];
