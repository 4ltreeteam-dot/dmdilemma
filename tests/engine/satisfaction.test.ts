import { applyEffects, clampSatisfaction } from '@/features/session/engine/satisfaction';
import type { PartySatisfaction } from '@/shared/types/session';
import type { SatisfactionEffect } from '@/shared/types/card';

const base: PartySatisfaction = { fighter: 50, wizard: 50, rogue: 50, cleric: 50, bard: 0, druid: 0 };

describe('satisfaction engine', () => {
  it('applies effect to a single character', () => {
    const effects: SatisfactionEffect[] = [{ target: 'fighter', delta: -2 }];
    const result = applyEffects(base, effects, ['fighter', 'wizard', 'rogue', 'cleric']);
    expect(result.fighter).toBe(48);
    expect(result.wizard).toBe(50);
  });

  it('applies "all" to every party member', () => {
    const effects: SatisfactionEffect[] = [{ target: 'all', delta: 1 }];
    const result = applyEffects(base, effects, ['fighter', 'wizard', 'rogue', 'cleric']);
    expect(result).toEqual({ fighter: 51, wizard: 51, rogue: 51, cleric: 51, bard: 0, druid: 0 });
  });

  it('applies "others" to non-specified members relative to first specified', () => {
    const effects: SatisfactionEffect[] = [
      { target: 'rogue', delta: 3 },
      { target: 'others', delta: -1 },
    ];
    const result = applyEffects(base, effects, ['fighter', 'wizard', 'rogue', 'cleric']);
    expect(result.rogue).toBe(53);
    expect(result.fighter).toBe(49);
    expect(result.wizard).toBe(49);
    expect(result.cleric).toBe(49);
  });

  it('clamps satisfaction within [0, 100]', () => {
    expect(clampSatisfaction(-5)).toBe(0);
    expect(clampSatisfaction(150)).toBe(100);
    expect(clampSatisfaction(75)).toBe(75);
  });

  it('clamps via applyEffects when delta exceeds bounds', () => {
    const edge: PartySatisfaction = { fighter: 98, wizard: 2, rogue: 50, cleric: 50, bard: 0, druid: 0 };
    const effects: SatisfactionEffect[] = [
      { target: 'fighter', delta: 5 },
      { target: 'wizard', delta: -5 },
    ];
    const result = applyEffects(edge, effects, ['fighter', 'wizard', 'rogue', 'cleric']);
    expect(result.fighter).toBe(100);
    expect(result.wizard).toBe(0);
  });
});
