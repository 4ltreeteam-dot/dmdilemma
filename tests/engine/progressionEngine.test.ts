import {
  addXp,
  checkUnlocks,
  computeSessionXp,
} from '@/features/campaign/engine/progressionEngine';
import type { CharacterProgress } from '@/shared/types/progress';
import type { CharacterId } from '@/shared/types/character';

const emptyProgress = (id: CharacterId): CharacterProgress => ({
  characterId: id,
  xp: 0,
  sessionCount: 0,
  unlockedMilestones: [],
});

describe('progressionEngine', () => {
  describe('computeSessionXp', () => {
    it('returns base + satisfaction bonus', () => {
      const xp = computeSessionXp({
        averageSatisfaction: 70,
        criticalCount: 0,
        rewardedAdWatched: false,
      });
      expect(xp).toBeGreaterThan(100);
    });

    it('doubles xp when rewarded ad watched', () => {
      const base = computeSessionXp({
        averageSatisfaction: 50,
        criticalCount: 0,
        rewardedAdWatched: false,
      });
      const boosted = computeSessionXp({
        averageSatisfaction: 50,
        criticalCount: 0,
        rewardedAdWatched: true,
      });
      expect(boosted).toBe(base * 2);
    });
  });

  describe('addXp', () => {
    it('increments xp and sessionCount', () => {
      const next = addXp(emptyProgress('fighter'), 100);
      expect(next.xp).toBe(100);
      expect(next.sessionCount).toBe(1);
    });

    it('unlocks milestone 500 at threshold', () => {
      const next = addXp(emptyProgress('fighter'), 500);
      expect(next.unlockedMilestones).toContain('xp_500');
    });

    it('does not duplicate already unlocked milestones', () => {
      const p: CharacterProgress = {
        ...emptyProgress('fighter'),
        xp: 500,
        unlockedMilestones: ['xp_500'],
      };
      const next = addXp(p, 100);
      const occurrences = next.unlockedMilestones.filter(m => m === 'xp_500').length;
      expect(occurrences).toBe(1);
    });

    it('unlocks multiple milestones when crossing several thresholds', () => {
      const next = addXp(emptyProgress('fighter'), 3500);
      expect(next.unlockedMilestones).toEqual(
        expect.arrayContaining(['xp_500', 'xp_1500', 'xp_3500']),
      );
    });
  });

  describe('checkUnlocks', () => {
    it('unlocks bard at 3 endings', () => {
      const unlocked = checkUnlocks({ collectedEndings: ['a', 'b', 'c'] });
      expect(unlocked).toContain('bard');
    });

    it('unlocks druid at 5 endings', () => {
      const unlocked = checkUnlocks({ collectedEndings: ['a', 'b', 'c', 'd', 'e'] });
      expect(unlocked).toContain('druid');
    });

    it('does not unlock druid before 5 endings', () => {
      const unlocked = checkUnlocks({ collectedEndings: ['a', 'b', 'c', 'd'] });
      expect(unlocked).not.toContain('druid');
    });
  });
});
