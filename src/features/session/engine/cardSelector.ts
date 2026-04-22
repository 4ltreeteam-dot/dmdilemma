import type { Card } from '@/shared/types/card';
import type { CharacterId } from '@/shared/types/character';
import type { SessionPhase } from '@/shared/types/session';
import type { DiceRoller } from '@/features/dice/roller';
import { dramaWeightFor } from './phaseEngine';

export type CardSelectionContext = {
  pool: Card[];
  party: CharacterId[];
  cardsPlayedIds: string[];
  cardIndex: number;
  roller: DiceRoller;
  sessionIndex?: number;
  phase?: SessionPhase;
  themeTags?: string[];
};

const THEME_TAG_BONUS = 2.5;

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

function themeMultiplier(card: Card, themeTags: string[] | undefined): number {
  if (!themeTags || themeTags.length === 0) return 1;
  const hit = card.tags.some(t => themeTags.includes(t));
  return hit ? THEME_TAG_BONUS : 1;
}

function effectiveWeight(card: Card, ctx: CardSelectionContext): number {
  const phase = ctx.phase ?? 'main';
  const phaseMultiplier = dramaWeightFor(card.dramaLevel, phase);
  const base = phaseMultiplier === 0 ? 0.01 : card.weight * (phaseMultiplier * 3);
  return base * themeMultiplier(card, ctx.themeTags);
}

function weightedPick(candidates: Card[], ctx: CardSelectionContext): Card {
  const weights = candidates.map(c => effectiveWeight(c, ctx));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const scaled = Math.max(1, Math.round(totalWeight * 100));
  const roll = ctx.roller.roll(scaled);
  let acc = 0;
  for (let i = 0; i < candidates.length; i++) {
    acc += Math.round(weights[i]! * 100);
    if (roll <= acc) return candidates[i]!;
  }
  return candidates[candidates.length - 1]!;
}

export function selectNextCard(ctx: CardSelectionContext): Card | null {
  const eligible = ctx.pool.filter(c => isEligible(c, ctx));
  if (eligible.length === 0) return null;
  return weightedPick(eligible, ctx);
}
