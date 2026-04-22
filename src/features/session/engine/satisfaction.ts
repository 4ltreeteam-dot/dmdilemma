import type { CharacterId } from '@/shared/types/character';
import type { SatisfactionEffect } from '@/shared/types/card';
import type { PartySatisfaction } from '@/shared/types/session';
import { MAX_SATISFACTION, MIN_SATISFACTION } from '@/shared/types/session';

export function clampSatisfaction(value: number): number {
  if (value < MIN_SATISFACTION) return MIN_SATISFACTION;
  if (value > MAX_SATISFACTION) return MAX_SATISFACTION;
  return value;
}

export function applyEffects(
  current: PartySatisfaction,
  effects: SatisfactionEffect[],
  party: CharacterId[],
): PartySatisfaction {
  const next: PartySatisfaction = { ...current };

  const explicitTargets = new Set<CharacterId>();
  for (const effect of effects) {
    if (effect.target !== 'all' && effect.target !== 'others') {
      explicitTargets.add(effect.target);
    }
  }

  for (const effect of effects) {
    if (effect.target === 'all') {
      for (const member of party) {
        next[member] = clampSatisfaction(next[member] + effect.delta);
      }
    } else if (effect.target === 'others') {
      for (const member of party) {
        if (!explicitTargets.has(member)) {
          next[member] = clampSatisfaction(next[member] + effect.delta);
        }
      }
    } else {
      if (party.includes(effect.target)) {
        next[effect.target] = clampSatisfaction(next[effect.target] + effect.delta);
      }
    }
  }

  return next;
}
