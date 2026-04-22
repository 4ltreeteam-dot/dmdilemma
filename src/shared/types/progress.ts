import type { CharacterId } from './character';

export type MilestoneId = 'xp_500' | 'xp_1500' | 'xp_3500' | 'xp_10000';

export const MILESTONE_THRESHOLDS: Record<MilestoneId, number> = {
  xp_500: 500,
  xp_1500: 1500,
  xp_3500: 3500,
  xp_10000: 10000,
};

export type CharacterProgress = {
  characterId: CharacterId;
  xp: number;
  sessionCount: number;
  unlockedMilestones: MilestoneId[];
};

export type PlayerProfile = {
  legendPoints: number;
  unlockedCharacters: CharacterId[];
  collectedEndings: string[];
  characterProgress: Record<CharacterId, CharacterProgress>;
};

export const DEFAULT_UNLOCKED_CHARACTERS: CharacterId[] = [
  'fighter',
  'wizard',
  'rogue',
  'cleric',
];

export const LEGEND_POINTS_PER_UNLOCK = 50;
