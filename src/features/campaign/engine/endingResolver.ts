import type { CharacterId } from '@/shared/types/character';
import type { Ending, EndingTriggerRule } from '@/shared/types/ending';

export type ResolveContext = {
  party: CharacterId[];
  finalSatisfaction: Record<CharacterId, number>;
  playerLeft: CharacterId | null;
};

function matchesRule(rule: EndingTriggerRule, ctx: ResolveContext): boolean {
  switch (rule.type) {
    case 'player_left':
      return ctx.playerLeft !== null;
    case 'completion_all_high': {
      if (ctx.playerLeft !== null) return false;
      const values = ctx.party.map(id => ctx.finalSatisfaction[id]);
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      const gap = Math.max(...values) - Math.min(...values);
      return avg >= rule.minAverage && gap <= rule.maxGap;
    }
    case 'completion_character_dominant': {
      if (ctx.playerLeft !== null) return false;
      if (!ctx.party.includes(rule.character)) return false;
      const own = ctx.finalSatisfaction[rule.character];
      const others = ctx.party.filter(id => id !== rule.character);
      const othersMax = Math.max(...others.map(id => ctx.finalSatisfaction[id]));
      return own >= rule.minValue && othersMax <= rule.maxOthers;
    }
    case 'completion_default':
      return ctx.playerLeft === null;
  }
}

const PRIORITY: Record<EndingTriggerRule['type'], number> = {
  player_left: 3,
  completion_all_high: 2,
  completion_character_dominant: 1,
  completion_default: 0,
};

export function resolveEnding(endings: Ending[], ctx: ResolveContext): Ending {
  const matched = endings.filter(e => matchesRule(e.trigger, ctx));
  if (matched.length === 0) {
    throw new Error('no matching ending — default should always match');
  }
  matched.sort((a, b) => PRIORITY[b.trigger.type] - PRIORITY[a.trigger.type]);
  return matched[0]!;
}
