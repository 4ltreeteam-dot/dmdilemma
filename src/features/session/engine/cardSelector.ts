import type { Card } from '@/shared/types/card';
import type { CharacterId } from '@/shared/types/character';
import type { DiceRoller } from '@/features/dice/roller';

export type CardSelectionContext = {
  pool: Card[];
  party: CharacterId[];
  cardsPlayedIds: string[];
  cardIndex: number;
  roller: DiceRoller;
  sessionIndex?: number;
};

function isEligible(card: Card, ctx: CardSelectionContext): boolean {
  const sessionIndex = ctx.sessionIndex ?? 1;
  if (card.minSession > sessionIndex) return false;
  if (card.maxSession !== undefined && card.maxSession < sessionIndex) return false;

  const playsAgo = ctx.cardsPlayedIds.lastIndexOf(card.id);
  if (playsAgo !== -1) {
    const distance = ctx.cardIndex - playsAgo;
    if (distance <= card.cooldown) return false;
  }

  if (card.requiresCharacter && card.requiresCharacter.length > 0) {
    const allPresent = card.requiresCharacter.every(c => ctx.party.includes(c));
    if (!allPresent) return false;
  }

  if (card.excludesCharacter && card.excludesCharacter.length > 0) {
    const anyExcluded = card.excludesCharacter.some(c => ctx.party.includes(c));
    if (anyExcluded) return false;
  }

  return true;
}

function weightedPick(candidates: Card[], roller: DiceRoller): Card {
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  const roll = roller.roll(totalWeight);
  let acc = 0;
  for (const card of candidates) {
    acc += card.weight;
    if (roll <= acc) return card;
  }
  return candidates[candidates.length - 1]!;
}

export function selectNextCard(ctx: CardSelectionContext): Card | null {
  const eligible = ctx.pool.filter(c => isEligible(c, ctx));
  if (eligible.length === 0) return null;
  return weightedPick(eligible, ctx.roller);
}
