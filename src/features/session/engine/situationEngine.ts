import type { Card, SwipeDirection } from '@/shared/types/card';
import { isDiceChoice } from '@/shared/types/card';
import type { SituationFlow } from '@/shared/types/scenario';

export type SituationProgress = {
  situationIndex: number;
  currentCardId: string;
  cardsPlayedInSituation: number;
};

export function findCard(pool: Card[], id: string): Card | null {
  return pool.find(c => c.id === id) ?? null;
}

export function getCurrentSituation(
  situations: SituationFlow[],
  progress: SituationProgress,
): SituationFlow | null {
  return situations[progress.situationIndex] ?? null;
}

export function getCurrentCard(pool: Card[], progress: SituationProgress): Card | null {
  return findCard(pool, progress.currentCardId);
}

export type ChoiceResolution = {
  nextCardId: string | null;
  endsSituation: boolean;
};

export function resolveChoiceTarget(
  card: Card,
  direction: SwipeDirection,
): ChoiceResolution {
  const choice = card.choices.find(c => c.direction === direction);
  if (!choice) return { nextCardId: null, endsSituation: true };
  if (isDiceChoice(choice)) {
    return { nextCardId: null, endsSituation: true };
  }
  const nextCardId = choice.nextCardId ?? null;
  return { nextCardId, endsSituation: nextCardId === null };
}

export function advanceProgress(
  situations: SituationFlow[],
  progress: SituationProgress,
  choiceResult: ChoiceResolution,
): SituationProgress | null {
  const played = progress.cardsPlayedInSituation + 1;
  if (!choiceResult.endsSituation && choiceResult.nextCardId) {
    return {
      situationIndex: progress.situationIndex,
      currentCardId: choiceResult.nextCardId,
      cardsPlayedInSituation: played,
    };
  }

  const nextIndex = progress.situationIndex + 1;
  const nextSituation = situations[nextIndex];
  if (!nextSituation) return null;
  return {
    situationIndex: nextIndex,
    currentCardId: nextSituation.entryCardId,
    cardsPlayedInSituation: 0,
  };
}

export function startProgress(situations: SituationFlow[]): SituationProgress | null {
  const first = situations[0];
  if (!first) return null;
  return {
    situationIndex: 0,
    currentCardId: first.entryCardId,
    cardsPlayedInSituation: 0,
  };
}
