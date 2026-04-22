import { resolveDiceChoice } from '@/features/session/engine/diceResolver';
import { createRoller } from '@/features/dice/roller';
import type { DiceChoice } from '@/shared/types/card';

const choice: DiceChoice = {
  direction: 'left',
  labelKo: '굴리기',
  labelEn: 'Roll',
  dice: {
    sides: 20,
    buckets: [
      { min: 1, max: 5, effects: [{ target: 'fighter', delta: -3 }] },
      { min: 6, max: 14, effects: [{ target: 'fighter', delta: -1 }] },
      { min: 15, max: 19, effects: [{ target: 'fighter', delta: 1 }] },
      { min: 20, max: 20, effects: [{ target: 'fighter', delta: 3 }] },
    ],
  },
};

describe('diceResolver', () => {
  it('returns bucket effects and raw roll', () => {
    const roller = createRoller(42);
    const result = resolveDiceChoice(choice, roller);
    expect(result.roll).toBeGreaterThanOrEqual(1);
    expect(result.roll).toBeLessThanOrEqual(20);
    expect(result.effects.length).toBeGreaterThan(0);
  });

  it('selects correct bucket when roll falls in range', () => {
    const rigged = { roll: () => 10 };
    const result = resolveDiceChoice(choice, rigged);
    expect(result.roll).toBe(10);
    expect(result.effects).toEqual([{ target: 'fighter', delta: -1 }]);
  });

  it('handles critical success (natural max)', () => {
    const rigged = { roll: () => 20 };
    const result = resolveDiceChoice(choice, rigged);
    expect(result.effects).toEqual([{ target: 'fighter', delta: 3 }]);
    expect(result.isCritical).toBe(true);
  });

  it('handles critical fail (natural 1)', () => {
    const rigged = { roll: () => 1 };
    const result = resolveDiceChoice(choice, rigged);
    expect(result.effects).toEqual([{ target: 'fighter', delta: -3 }]);
    expect(result.isCritFail).toBe(true);
  });

  it('falls through to last bucket when no match', () => {
    const gap: DiceChoice = {
      ...choice,
      dice: { sides: 20, buckets: [{ min: 1, max: 5, effects: [] }] },
    };
    const rigged = { roll: () => 15 };
    const result = resolveDiceChoice(gap, rigged);
    expect(result.effects).toEqual([]);
    expect(result.usedFallback).toBe(true);
  });
});
