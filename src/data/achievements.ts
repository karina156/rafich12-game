import type { AchievementId } from '../types/game';

export interface AchievementDef {
  id: AchievementId;
  title: string;
  description: string;
  secret?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'alreadyGrandpa', title: 'УЖЕ ДЕД', description: 'Запустить игру в свой 19-й день рождения' },
  { id: 'firstStep', title: 'ТЫ УЖЕ В СЮЖЕТЕ', description: 'Выбрать своего Рафа' },
  { id: 'sockMagnate', title: 'НОСОЧНЫЙ МАГНАТ', description: 'Поймать три носка' },
  { id: 'gordonCries', title: 'ГОРДОН РАМЗИ ПЛАЧЕТ', description: 'Приготовить странный торт' },
  { id: 'chef19', title: 'ШЕФ-ПОВАР 19 УРОВНЯ', description: 'Приготовить нормальный торт' },
  { id: 'candleLord', title: 'ПОВЕЛИТЕЛЬ СВЕЧЕЙ', description: 'Потушить 19 свечей' },
  { id: 'sherlock', title: 'ШЕРЛОК РАФ', description: 'Выиграть игру с коробками' },
  { id: 'organizer', title: 'ОРГАНИЗАТОР ГОДА', description: 'Восстановить комнату' },
  { id: 'rafSquared', title: 'РАФ² — РАФ В КВАДРАТЕ', description: 'Приготовить лавандовый раф', secret: true },
  { id: 'monkeySlayer', title: 'ПОБЕДИТЕЛЬ МАКАК', description: 'Победить финального босса' },
  { id: 'legend19', title: 'ЛЕГЕНДА 19 УРОВНЯ', description: 'Пройти игру' },
];

export const getAchievement = (id: AchievementId) => ACHIEVEMENTS.find((a) => a.id === id)!;
