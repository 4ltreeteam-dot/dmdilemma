import { createRoller } from '@/features/dice/roller';

describe('dice roller', () => {
  it('rolls d20 within [1, 20]', () => {
    const roller = createRoller(42);
    for (let i = 0; i < 100; i++) {
      const result = roller.roll(20);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    }
  });

  it('rolls d4 within [1, 4]', () => {
    const roller = createRoller(1);
    for (let i = 0; i < 20; i++) {
      const result = roller.roll(4);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(4);
    }
  });

  it('is deterministic when seeded identically', () => {
    const rollerA = createRoller(123);
    const rollerB = createRoller(123);
    const seqA = Array.from({ length: 10 }, () => rollerA.roll(20));
    const seqB = Array.from({ length: 10 }, () => rollerB.roll(20));
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const rollerA = createRoller(1);
    const rollerB = createRoller(2);
    const seqA = Array.from({ length: 10 }, () => rollerA.roll(20));
    const seqB = Array.from({ length: 10 }, () => rollerB.roll(20));
    expect(seqA).not.toEqual(seqB);
  });

  it('rejects invalid die sides', () => {
    const roller = createRoller(0);
    expect(() => roller.roll(0)).toThrow();
    expect(() => roller.roll(-1)).toThrow();
    expect(() => roller.roll(1.5)).toThrow();
  });
});
