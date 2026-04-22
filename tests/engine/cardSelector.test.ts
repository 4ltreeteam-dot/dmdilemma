import { selectNextCard, CardSelectionContext } from '@/features/session/engine/cardSelector';
import { createRoller } from '@/features/dice/roller';
import type { Card } from '@/shared/types/card';

const roller = () => createRoller(42);

const baseCard = (overrides: Partial<Card>): Card => ({
  id: overrides.id ?? 'c1',
  category: overrides.category ?? 'rule_dispute',
  dramaLevel: overrides.dramaLevel ?? 'medium',
  minSession: overrides.minSession ?? 1,
  promptKo: 'ko',
  promptEn: 'en',
  choices: [
    { direction: 'left', labelKo: 'L', labelEn: 'L', effects: [] },
    { direction: 'right', labelKo: 'R', labelEn: 'R', effects: [] },
  ],
  weight: overrides.weight ?? 5,
  cooldown: overrides.cooldown ?? 10,
  tags: [],
  ...overrides,
});

describe('cardSelector', () => {
  it('returns a card from the pool', () => {
    const pool = [baseCard({ id: 'a' }), baseCard({ id: 'b' })];
    const ctx: CardSelectionContext = {
      pool,
      party: ['fighter', 'wizard', 'rogue', 'cleric'],
      cardsPlayedIds: [],
      cardIndex: 0,
      roller: roller(),
    };
    const card = selectNextCard(ctx);
    expect(card).not.toBeNull();
    expect(['a', 'b']).toContain(card!.id);
  });

  it('respects minSession filter', () => {
    const pool = [
      baseCard({ id: 'early', minSession: 1 }),
      baseCard({ id: 'late', minSession: 5 }),
    ];
    const ctx: CardSelectionContext = {
      pool,
      party: ['fighter', 'wizard', 'rogue', 'cleric'],
      cardsPlayedIds: [],
      cardIndex: 0,
      roller: roller(),
      sessionIndex: 1,
    };
    const ids = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const c = selectNextCard({ ...ctx, roller: createRoller(i) });
      if (c) ids.add(c.id);
    }
    expect(ids.has('early')).toBe(true);
    expect(ids.has('late')).toBe(false);
  });

  it('excludes cards within cooldown', () => {
    const pool = [
      baseCard({ id: 'recent', cooldown: 5 }),
      baseCard({ id: 'other', cooldown: 5 }),
    ];
    const ctx: CardSelectionContext = {
      pool,
      party: ['fighter', 'wizard', 'rogue', 'cleric'],
      cardsPlayedIds: ['recent', 'x', 'y'],
      cardIndex: 3,
      roller: roller(),
    };
    const card = selectNextCard(ctx);
    expect(card).not.toBeNull();
    expect(card!.id).toBe('other');
  });

  it('filters out cards requiring absent characters', () => {
    const pool = [
      baseCard({ id: 'needs_bard', requiresCharacter: ['fighter'] }),
      baseCard({ id: 'generic' }),
    ];
    const ctx: CardSelectionContext = {
      pool,
      party: ['wizard', 'rogue', 'cleric', 'fighter'],
      cardsPlayedIds: [],
      cardIndex: 0,
      roller: roller(),
    };
    const card = selectNextCard(ctx);
    expect(card).not.toBeNull();
  });

  it('returns null when no valid card remains', () => {
    const pool = [baseCard({ id: 'only', cooldown: 10 })];
    const ctx: CardSelectionContext = {
      pool,
      party: ['fighter', 'wizard', 'rogue', 'cleric'],
      cardsPlayedIds: ['only'],
      cardIndex: 1,
      roller: roller(),
    };
    const card = selectNextCard(ctx);
    expect(card).toBeNull();
  });
});
