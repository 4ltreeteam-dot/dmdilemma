import type { Card, SwipeDirection } from './card';
import type { CharacterId } from './character';

export type PartySatisfaction = Record<CharacterId, number>;

export type SessionPhase = 'opening' | 'main' | 'ending' | 'summary';

export type PlayedCardHistory = {
  cardId: string;
  direction: SwipeDirection;
  satisfactionBefore: PartySatisfaction;
  satisfactionAfter: PartySatisfaction;
};

export type SessionState = {
  sessionIndex: number;
  party: CharacterId[];
  satisfaction: PartySatisfaction;
  phase: SessionPhase;
  cardsPlayed: PlayedCardHistory[];
  cardsRemaining: number;
  currentCard: Card | null;
  isEnded: boolean;
  endReason: 'cards_exhausted' | 'player_left' | null;
};

export const TOTAL_CARDS_PER_SESSION = 20;
export const MAX_SATISFACTION = 100;
export const MIN_SATISFACTION = 0;
