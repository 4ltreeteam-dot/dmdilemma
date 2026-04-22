import type { DramaLevel } from '@/shared/types/card';
import type { SessionPhase } from '@/shared/types/session';

export type DramaWeights = {
  light: number;
  medium: number;
  heavy: number;
};

export function getPhase(cardIndex: number, totalCards: number): SessionPhase {
  const openingEnd = Math.max(1, Math.floor(totalCards * 0.2));
  const endingStart = Math.max(openingEnd + 1, Math.floor(totalCards * 0.85));
  if (cardIndex < openingEnd) return 'opening';
  if (cardIndex < endingStart) return 'main';
  return 'ending';
}

export function getDramaWeights(phase: SessionPhase): DramaWeights {
  switch (phase) {
    case 'opening':
      return { light: 0.7, medium: 0.3, heavy: 0 };
    case 'main':
      return { light: 0.3, medium: 0.6, heavy: 0.1 };
    case 'ending':
      return { light: 0.1, medium: 0.4, heavy: 0.5 };
    case 'summary':
      return { light: 1, medium: 0, heavy: 0 };
  }
}

export function dramaWeightFor(level: DramaLevel, phase: SessionPhase): number {
  return getDramaWeights(phase)[level];
}
