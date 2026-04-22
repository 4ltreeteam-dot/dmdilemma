import { create } from 'zustand';
import type { Card, SwipeDirection } from '@/shared/types/card';
import { isDiceChoice } from '@/shared/types/card';
import type { CharacterId, PlayerCharacter } from '@/shared/types/character';
import type { PartySatisfaction, SessionState } from '@/shared/types/session';
import { TOTAL_CARDS_PER_SESSION } from '@/shared/types/session';
import { applyEffects } from '@/features/session/engine/satisfaction';
import { selectNextCard } from '@/features/session/engine/cardSelector';
import { createRoller, type DiceRoller } from '@/features/dice/roller';
import charactersData from '@/content/characters.json';
import cardsData from '@/content/cards.json';

const characters = charactersData as unknown as PlayerCharacter[];
const cards = cardsData as unknown as Card[];

type GameStore = {
  session: SessionState | null;
  roller: DiceRoller;
  startSession: (seed?: number) => void;
  applyChoice: (direction: SwipeDirection) => void;
  forceSatisfaction: (next: PartySatisfaction) => void;
  reset: () => void;
};

function initialSatisfaction(party: CharacterId[]): PartySatisfaction {
  const map: Partial<PartySatisfaction> = {};
  for (const id of party) {
    const char = characters.find(c => c.id === id);
    map[id] = char?.defaultSatisfaction ?? 50;
  }
  return map as PartySatisfaction;
}

function anyoneLeft(satisfaction: PartySatisfaction, party: CharacterId[]): boolean {
  return party.some(id => satisfaction[id] <= 0);
}

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  roller: createRoller(Date.now()),

  startSession: (seed?: number) => {
    const roller = createRoller(seed ?? Date.now());
    const party: CharacterId[] = ['fighter', 'wizard', 'rogue', 'cleric'];
    const satisfaction = initialSatisfaction(party);

    const firstCard = selectNextCard({
      pool: cards,
      party,
      cardsPlayedIds: [],
      cardIndex: 0,
      roller,
      sessionIndex: 1,
    });

    set({
      roller,
      session: {
        sessionIndex: 1,
        party,
        satisfaction,
        phase: 'main',
        cardsPlayed: [],
        cardsRemaining: TOTAL_CARDS_PER_SESSION,
        currentCard: firstCard,
        isEnded: false,
        endReason: null,
      },
    });
  },

  applyChoice: (direction: SwipeDirection) => {
    const { session, roller } = get();
    if (!session || !session.currentCard || session.isEnded) return;

    const choice = session.currentCard.choices.find(c => c.direction === direction);
    if (!choice) return;
    if (isDiceChoice(choice)) return;

    const before = session.satisfaction;
    const after = applyEffects(before, choice.effects, session.party);

    const cardsPlayed = [
      ...session.cardsPlayed,
      {
        cardId: session.currentCard.id,
        direction,
        satisfactionBefore: before,
        satisfactionAfter: after,
      },
    ];
    const cardsRemaining = session.cardsRemaining - 1;
    const cardIndex = cardsPlayed.length;

    const someoneLeft = anyoneLeft(after, session.party);

    if (someoneLeft) {
      set({
        session: {
          ...session,
          satisfaction: after,
          cardsPlayed,
          cardsRemaining,
          currentCard: null,
          isEnded: true,
          endReason: 'player_left',
        },
      });
      return;
    }

    if (cardsRemaining <= 0) {
      set({
        session: {
          ...session,
          satisfaction: after,
          cardsPlayed,
          cardsRemaining: 0,
          currentCard: null,
          isEnded: true,
          endReason: 'cards_exhausted',
        },
      });
      return;
    }

    const nextCard = selectNextCard({
      pool: cards,
      party: session.party,
      cardsPlayedIds: cardsPlayed.map(p => p.cardId),
      cardIndex,
      roller,
      sessionIndex: session.sessionIndex,
    });

    set({
      session: {
        ...session,
        satisfaction: after,
        cardsPlayed,
        cardsRemaining,
        currentCard: nextCard,
        isEnded: nextCard === null,
        endReason: nextCard === null ? 'cards_exhausted' : null,
      },
    });
  },

  forceSatisfaction: (next: PartySatisfaction) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, satisfaction: next } });
  },

  reset: () => {
    set({ session: null, roller: createRoller(Date.now()) });
  },
}));
