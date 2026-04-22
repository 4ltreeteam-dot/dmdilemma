import { resolveEnding } from '@/features/campaign/engine/endingResolver';
import type { Ending } from '@/shared/types/ending';
import type { CharacterId } from '@/shared/types/character';

const endings: Ending[] = [
  {
    id: 'bad_walkout',
    kind: 'bad',
    nameKo: '',
    nameEn: '',
    descriptionKo: '',
    descriptionEn: '',
    trigger: { type: 'player_left' },
    legendPoints: 10,
  },
  {
    id: 'legendary',
    kind: 'legendary',
    nameKo: '',
    nameEn: '',
    descriptionKo: '',
    descriptionEn: '',
    trigger: { type: 'completion_all_high', minAverage: 75, maxGap: 15 },
    legendPoints: 80,
  },
  {
    id: 'fighter_dom',
    kind: 'good',
    nameKo: '',
    nameEn: '',
    descriptionKo: '',
    descriptionEn: '',
    trigger: { type: 'completion_character_dominant', character: 'fighter', minValue: 85, maxOthers: 70 },
    legendPoints: 30,
  },
  {
    id: 'default',
    kind: 'good',
    nameKo: '',
    nameEn: '',
    descriptionKo: '',
    descriptionEn: '',
    trigger: { type: 'completion_default' },
    legendPoints: 20,
  },
];

const party: CharacterId[] = ['fighter', 'wizard', 'rogue', 'cleric'];

const fullSatisfaction = (overrides: Partial<Record<CharacterId, number>>): Record<CharacterId, number> => ({
  fighter: 50,
  wizard: 50,
  rogue: 50,
  cleric: 50,
  bard: 0,
  druid: 0,
  ...overrides,
});

describe('endingResolver', () => {
  it('returns bad ending when a player left', () => {
    const result = resolveEnding(endings, {
      party,
      finalSatisfaction: fullSatisfaction({ fighter: 0, wizard: 70, rogue: 60, cleric: 50 }),
      playerLeft: 'fighter',
    });
    expect(result.id).toBe('bad_walkout');
  });

  it('returns legendary when all high and narrow gap', () => {
    const result = resolveEnding(endings, {
      party,
      finalSatisfaction: fullSatisfaction({ fighter: 85, wizard: 80, rogue: 82, cleric: 78 }),
      playerLeft: null,
    });
    expect(result.id).toBe('legendary');
  });

  it('returns character-dominant when one shines and others moderate', () => {
    const result = resolveEnding(endings, {
      party,
      finalSatisfaction: fullSatisfaction({ fighter: 90, wizard: 60, rogue: 55, cleric: 65 }),
      playerLeft: null,
    });
    expect(result.id).toBe('fighter_dom');
  });

  it('falls back to default when no specific rule matches', () => {
    const result = resolveEnding(endings, {
      party,
      finalSatisfaction: fullSatisfaction({ fighter: 60, wizard: 55, rogue: 58, cleric: 52 }),
      playerLeft: null,
    });
    expect(result.id).toBe('default');
  });
});
