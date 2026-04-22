import type { CharacterId } from '@/shared/types/character';
import type {
  CharacterProgress,
  MilestoneId,
  PlayerProfile,
} from '@/shared/types/progress';
import { MILESTONE_THRESHOLDS } from '@/shared/types/progress';

export type SessionXpInput = {
  averageSatisfaction: number;
  criticalCount: number;
  rewardedAdWatched: boolean;
};

export function computeSessionXp(input: SessionXpInput): number {
  const base = 100;
  const satisfactionBonus = Math.max(0, Math.floor(input.averageSatisfaction / 2));
  const criticalBonus = input.criticalCount * 10;
  const raw = base + satisfactionBonus + criticalBonus;
  return input.rewardedAdWatched ? raw * 2 : raw;
}

export function addXp(current: CharacterProgress, delta: number): CharacterProgress {
  const newXp = current.xp + delta;
  const unlocked = new Set(current.unlockedMilestones);
  const milestoneIds = Object.keys(MILESTONE_THRESHOLDS) as MilestoneId[];
  for (const id of milestoneIds) {
    if (newXp >= MILESTONE_THRESHOLDS[id]) {
      unlocked.add(id);
    }
  }
  return {
    ...current,
    xp: newXp,
    sessionCount: current.sessionCount + 1,
    unlockedMilestones: Array.from(unlocked),
  };
}

export type UnlockContext = {
  collectedEndings: string[];
};

export function checkUnlocks(ctx: UnlockContext): CharacterId[] {
  const unlocked: CharacterId[] = [];
  if (ctx.collectedEndings.length >= 3) unlocked.push('bard');
  if (ctx.collectedEndings.length >= 5) unlocked.push('druid');
  return unlocked;
}

export function applySessionXpToParty(
  profile: PlayerProfile,
  party: CharacterId[],
  totalXp: number,
): PlayerProfile {
  const perPlayer = Math.floor(totalXp / party.length);
  const nextProgress = { ...profile.characterProgress };
  for (const id of party) {
    const current = nextProgress[id] ?? {
      characterId: id,
      xp: 0,
      sessionCount: 0,
      unlockedMilestones: [],
    };
    nextProgress[id] = addXp(current, perPlayer);
  }
  return { ...profile, characterProgress: nextProgress };
}
