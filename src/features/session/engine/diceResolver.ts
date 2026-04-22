import type { DiceChoice, SatisfactionEffect } from '@/shared/types/card';
import type { DiceRoller } from '@/features/dice/roller';

export type DiceResolution = {
  roll: number;
  effects: SatisfactionEffect[];
  isCritical: boolean;
  isCritFail: boolean;
  usedFallback: boolean;
  flavorKo?: string;
  flavorEn?: string;
};

export function resolveDiceChoice(choice: DiceChoice, roller: DiceRoller): DiceResolution {
  const roll = roller.roll(choice.dice.sides);
  const bucket = choice.dice.buckets.find(b => roll >= b.min && roll <= b.max);

  if (!bucket) {
    return {
      roll,
      effects: [],
      isCritical: false,
      isCritFail: false,
      usedFallback: true,
    };
  }

  return {
    roll,
    effects: bucket.effects,
    isCritical: roll === choice.dice.sides,
    isCritFail: roll === 1,
    usedFallback: false,
    flavorKo: bucket.flavorKo,
    flavorEn: bucket.flavorEn,
  };
}
