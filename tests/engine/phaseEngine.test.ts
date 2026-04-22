import { getPhase, getDramaWeights } from '@/features/session/engine/phaseEngine';

describe('phaseEngine', () => {
  it('returns opening for cards 1-4 of 20', () => {
    expect(getPhase(0, 20)).toBe('opening');
    expect(getPhase(3, 20)).toBe('opening');
  });

  it('returns main for cards 5-17 of 20', () => {
    expect(getPhase(4, 20)).toBe('main');
    expect(getPhase(12, 20)).toBe('main');
    expect(getPhase(16, 20)).toBe('main');
  });

  it('returns ending for cards 18-20 of 20', () => {
    expect(getPhase(17, 20)).toBe('ending');
    expect(getPhase(19, 20)).toBe('ending');
  });

  it('drama weights skew light for opening', () => {
    const w = getDramaWeights('opening');
    expect(w.light).toBeGreaterThan(w.medium);
    expect(w.heavy).toBe(0);
  });

  it('drama weights skew heavy for ending phase', () => {
    const w = getDramaWeights('ending');
    expect(w.heavy).toBeGreaterThan(0);
    expect(w.light + w.medium + w.heavy).toBeCloseTo(1, 2);
  });
});
