import { create } from 'zustand';
import type { Card, SwipeDirection } from '@/shared/types/card';
import { isDiceChoice } from '@/shared/types/card';
import type { CharacterId, PlayerCharacter } from '@/shared/types/character';
import type { PartySatisfaction, SessionState } from '@/shared/types/session';
import { TOTAL_CARDS_PER_SESSION } from '@/shared/types/session';
import type { SituationFlow } from '@/shared/types/scenario';
import { applyEffects } from '@/features/session/engine/satisfaction';
import { selectNextCard } from '@/features/session/engine/cardSelector';
import { getPhase } from '@/features/session/engine/phaseEngine';
import { resolveDiceChoice } from '@/features/session/engine/diceResolver';
import {
  startProgress,
  advanceProgress,
  resolveChoiceTarget,
  findCard,
  type SituationProgress,
} from '@/features/session/engine/situationEngine';
import { computeSessionXp } from '@/features/campaign/engine/progressionEngine';
import { createRoller, type DiceRoller } from '@/features/dice/roller';
import { useCampaignStore } from './campaignStore';
import charactersData from '@/content/characters.json';
import cardsData from '@/content/cards.json';
import scenariosData from '@/content/scenarios.json';
import type { Scenario } from '@/shared/types/scenario';

const characters = charactersData as unknown as PlayerCharacter[];
const cards = cardsData as unknown as Card[];
const scenarios = scenariosData as unknown as Scenario[];

type GameStore = {
  session: SessionState | null;
  roller: DiceRoller;
  diceRollCount: number;
  criticalCount: number;
  situationProgress: SituationProgress | null;
  situations: SituationFlow[] | null;
  startSession: (seed?: number) => void;
  applyChoice: (direction: SwipeDirection) => void;
  forceSatisfaction: (next: PartySatisfaction) => void;
  reset: () => void;
};

function initialSatisfaction(party: CharacterId[]): PartySatisfaction {
  const base: PartySatisfaction = {
    fighter: 0, wizard: 0, rogue: 0, cleric: 0, bard: 0, druid: 0,
  };
  for (const id of party) {
    const char = characters.find(c => c.id === id);
    base[id] = char?.defaultSatisfaction ?? 50;
  }
  return base;
}

function anyoneLeft(satisfaction: PartySatisfaction, party: CharacterId[]): CharacterId | null {
  for (const id of party) {
    if (satisfaction[id] <= 0) return id;
  }
  return null;
}

function getSituationsFor(scenarioId: string | undefined, sessionIndex: number): SituationFlow[] | null {
  if (!scenarioId) return null;
  const scenario = scenarios.find(s => s.id === scenarioId);
  const theme = scenario?.sessionThemes.find(t => t.sessionIndex === sessionIndex);
  return theme?.situations ?? null;
}

function finalizeSession(
  session: SessionState,
  diceRollCount: number,
  criticalCount: number,
  playerLeft: CharacterId | null,
): void {
  if (!useCampaignStore.getState().campaign) return;
  const values = session.party.map(id => session.satisfaction[id]);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const xp = computeSessionXp({
    averageSatisfaction: avg,
    criticalCount,
    rewardedAdWatched: false,
  });
  useCampaignStore.getState().finishCurrentSession({
    finalSatisfaction: session.satisfaction as Record<CharacterId, number>,
    cardsPlayed: session.cardsPlayed.length,
    diceRolls: diceRollCount,
    sessionXp: xp,
    playerLeft,
  });
}

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  roller: createRoller(Date.now()),
  diceRollCount: 0,
  criticalCount: 0,
  situationProgress: null,
  situations: null,

  startSession: (seed?: number) => {
    const campaign = useCampaignStore.getState().campaign;
    const roller = createRoller(seed ?? Date.now());
    const scenarioId = campaign?.scenarioId;
    const sessionIndex = campaign?.sessionIndex ?? 1;
    const situations = getSituationsFor(scenarioId, sessionIndex);

    if (campaign && campaign.currentSession) {
      const progress = situations ? startProgress(situations) : null;
      const firstCard = progress ? findCard(cards, progress.currentCardId) : campaign.currentSession.currentCard;
      set({
        roller,
        situations,
        situationProgress: progress,
        session: { ...campaign.currentSession, currentCard: firstCard ?? null },
        diceRollCount: 0,
        criticalCount: 0,
      });
      return;
    }

    const party: CharacterId[] = ['fighter', 'wizard', 'rogue', 'cleric'];
    const satisfaction = initialSatisfaction(party);
    const firstCard = selectNextCard({
      pool: cards,
      party,
      cardsPlayedIds: [],
      cardIndex: 0,
      roller,
      sessionIndex: 1,
      phase: getPhase(0, TOTAL_CARDS_PER_SESSION),
    });
    set({
      roller,
      situations: null,
      situationProgress: null,
      diceRollCount: 0,
      criticalCount: 0,
      session: {
        sessionIndex: 1,
        party,
        satisfaction,
        phase: 'opening',
        cardsPlayed: [],
        cardsRemaining: TOTAL_CARDS_PER_SESSION,
        currentCard: firstCard,
        isEnded: false,
        endReason: null,
      },
    });
  },

  applyChoice: (direction: SwipeDirection) => {
    const { session, roller, diceRollCount, criticalCount, situations, situationProgress } = get();
    if (!session || !session.currentCard || session.isEnded) return;

    const choice = session.currentCard.choices.find(c => c.direction === direction);
    if (!choice) return;

    const before = session.satisfaction;
    let after: PartySatisfaction;
    let dRolls = diceRollCount;
    let cCount = criticalCount;

    if (isDiceChoice(choice)) {
      const resolution = resolveDiceChoice(choice, roller);
      dRolls += 1;
      if (resolution.isCritical) cCount += 1;
      after = applyEffects(before, resolution.effects, session.party);
    } else {
      after = applyEffects(before, choice.effects, session.party);
    }

    const cardsPlayed = [
      ...session.cardsPlayed,
      {
        cardId: session.currentCard.id,
        direction,
        satisfactionBefore: before,
        satisfactionAfter: after,
      },
    ];
    const playerLeft = anyoneLeft(after, session.party);

    if (playerLeft) {
      const endedSession: SessionState = {
        ...session,
        satisfaction: after,
        cardsPlayed,
        cardsRemaining: 0,
        currentCard: null,
        isEnded: true,
        endReason: 'player_left',
      };
      set({ session: endedSession, diceRollCount: dRolls, criticalCount: cCount });
      finalizeSession(endedSession, dRolls, cCount, playerLeft);
      return;
    }

    if (situations && situationProgress) {
      const resolution = resolveChoiceTarget(session.currentCard, direction);
      const nextProgress = advanceProgress(situations, situationProgress, resolution);

      if (!nextProgress) {
        const endedSession: SessionState = {
          ...session,
          satisfaction: after,
          cardsPlayed,
          cardsRemaining: 0,
          currentCard: null,
          isEnded: true,
          endReason: 'cards_exhausted',
        };
        set({ session: endedSession, diceRollCount: dRolls, criticalCount: cCount, situationProgress: null });
        finalizeSession(endedSession, dRolls, cCount, null);
        return;
      }

      const nextCard = findCard(cards, nextProgress.currentCardId);
      set({
        diceRollCount: dRolls,
        criticalCount: cCount,
        situationProgress: nextProgress,
        session: {
          ...session,
          satisfaction: after,
          cardsPlayed,
          cardsRemaining: Math.max(0, session.cardsRemaining - 1),
          currentCard: nextCard,
          isEnded: false,
          endReason: null,
        },
      });
      return;
    }

    const cardsRemaining = session.cardsRemaining - 1;
    const cardIndex = cardsPlayed.length;

    if (cardsRemaining <= 0) {
      const endedSession: SessionState = {
        ...session,
        satisfaction: after,
        cardsPlayed,
        cardsRemaining: 0,
        currentCard: null,
        isEnded: true,
        endReason: 'cards_exhausted',
      };
      set({ session: endedSession, diceRollCount: dRolls, criticalCount: cCount });
      finalizeSession(endedSession, dRolls, cCount, null);
      return;
    }

    const nextCard = selectNextCard({
      pool: cards,
      party: session.party,
      cardsPlayedIds: cardsPlayed.map(p => p.cardId),
      cardIndex,
      roller,
      sessionIndex: session.sessionIndex,
      phase: getPhase(cardIndex, TOTAL_CARDS_PER_SESSION),
    });

    set({
      diceRollCount: dRolls,
      criticalCount: cCount,
      session: {
        ...session,
        phase: getPhase(cardIndex, TOTAL_CARDS_PER_SESSION),
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
    set({
      session: null,
      roller: createRoller(Date.now()),
      diceRollCount: 0,
      criticalCount: 0,
      situations: null,
      situationProgress: null,
    });
  },
}));
