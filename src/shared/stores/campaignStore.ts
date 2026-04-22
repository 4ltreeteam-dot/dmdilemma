import { create } from 'zustand';
import type { CharacterId } from '@/shared/types/character';
import type { Card } from '@/shared/types/card';
import type { SessionState } from '@/shared/types/session';
import type {
  CampaignState,
  DmAction,
  SessionResult,
} from '@/shared/types/campaign';
import type { Ending } from '@/shared/types/ending';
import { CAMPAIGN_TOTAL_SESSIONS, DEFAULT_DM_SCREEN } from '@/shared/types/campaign';
import { TOTAL_CARDS_PER_SESSION } from '@/shared/types/session';
import { selectNextCard } from '@/features/session/engine/cardSelector';
import { getPhase } from '@/features/session/engine/phaseEngine';
import { createRoller } from '@/features/dice/roller';
import { resolveEnding } from '@/features/campaign/engine/endingResolver';
import { useProfileStore } from './profileStore';
import charactersData from '@/content/characters.json';
import cardsData from '@/content/cards.json';
import endingsData from '@/content/endings.json';

const cards = cardsData as unknown as Card[];
const endings = endingsData as unknown as Ending[];

type SessionOutcome = {
  finalSatisfaction: Record<CharacterId, number>;
  cardsPlayed: number;
  diceRolls: number;
  sessionXp: number;
  playerLeft: CharacterId | null;
};

type CampaignStore = {
  campaign: CampaignState | null;
  startCampaign: (party: CharacterId[], seed?: number) => void;
  finishCurrentSession: (outcome: SessionOutcome) => void;
  advanceToNextSession: (seed?: number) => void;
  useDmAction: (action: DmAction) => boolean;
  reset: () => void;
};

function defaultSatisfactionFor(party: CharacterId[]): Record<CharacterId, number> {
  const base: Record<CharacterId, number> = {
    fighter: 0,
    wizard: 0,
    rogue: 0,
    cleric: 0,
    bard: 0,
    druid: 0,
  };
  for (const id of party) {
    const entry = (charactersData as any[]).find(c => c.id === id);
    base[id] = entry?.defaultSatisfaction ?? 50;
  }
  return base;
}

function buildInitialSession(
  party: CharacterId[],
  sessionIndex: number,
  seed: number,
): SessionState {
  const roller = createRoller(seed);
  const satisfaction = defaultSatisfactionFor(party);
  const firstCard = selectNextCard({
    pool: cards,
    party,
    cardsPlayedIds: [],
    cardIndex: 0,
    roller,
    sessionIndex,
    phase: getPhase(0, TOTAL_CARDS_PER_SESSION),
  });
  return {
    sessionIndex,
    party,
    satisfaction,
    phase: 'opening',
    cardsPlayed: [],
    cardsRemaining: TOTAL_CARDS_PER_SESSION,
    currentCard: firstCard,
    isEnded: false,
    endReason: null,
  };
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaign: null,

  startCampaign: (party, seed) => {
    if (party.length !== 4) throw new Error('party must be exactly 4 members');
    if (new Set(party).size !== 4) throw new Error('party members must be unique');
    const id = `cp_${Date.now()}`;
    const finalSeed = seed ?? Date.now();
    set({
      campaign: {
        id,
        party,
        startedAt: Date.now(),
        sessionIndex: 1,
        totalSessions: CAMPAIGN_TOTAL_SESSIONS,
        sessionHistory: [],
        currentSession: buildInitialSession(party, 1, finalSeed),
        dmScreen: { ...DEFAULT_DM_SCREEN },
        isEnded: false,
        endingId: null,
      },
    });
  },

  finishCurrentSession: outcome => {
    const campaign = get().campaign;
    if (!campaign) return;
    const result: SessionResult = {
      sessionIndex: campaign.sessionIndex,
      finalSatisfaction: outcome.finalSatisfaction,
      cardsPlayed: outcome.cardsPlayed,
      diceRolls: outcome.diceRolls,
      sessionXp: outcome.sessionXp,
    };
    const nextHistory = [...campaign.sessionHistory, result];

    useProfileStore.getState().awardSessionXp(campaign.party, outcome.sessionXp);

    const isLastSession = campaign.sessionIndex >= campaign.totalSessions;
    const campaignEnds = outcome.playerLeft !== null || isLastSession;

    if (campaignEnds) {
      const ending = resolveEnding(endings, {
        party: campaign.party,
        finalSatisfaction: outcome.finalSatisfaction,
        playerLeft: outcome.playerLeft,
      });
      useProfileStore.getState().awardEnding(ending.id, ending.legendPoints);
      set({
        campaign: {
          ...campaign,
          sessionHistory: nextHistory,
          currentSession: null,
          isEnded: true,
          endingId: ending.id,
        },
      });
      return;
    }

    set({
      campaign: {
        ...campaign,
        sessionHistory: nextHistory,
        currentSession: null,
      },
    });
  },

  advanceToNextSession: seed => {
    const campaign = get().campaign;
    if (!campaign || campaign.isEnded) return;
    const nextIndex = campaign.sessionIndex + 1;
    if (nextIndex > campaign.totalSessions) return;
    const nextSeed = seed ?? Date.now();
    set({
      campaign: {
        ...campaign,
        sessionIndex: nextIndex,
        currentSession: buildInitialSession(campaign.party, nextIndex, nextSeed),
      },
    });
  },

  useDmAction: action => {
    const campaign = get().campaign;
    if (!campaign) return false;
    const screen = campaign.dmScreen;
    if (action === 'retcon') {
      if (screen.retconUsed) return false;
      set({ campaign: { ...campaign, dmScreen: { ...screen, retconUsed: true } } });
      return true;
    }
    if (action === 'cool_ruling') {
      if (screen.coolRulingRemaining <= 0) return false;
      set({
        campaign: {
          ...campaign,
          dmScreen: { ...screen, coolRulingRemaining: screen.coolRulingRemaining - 1 },
        },
      });
      return true;
    }
    if (screen.npcCameoUsed) return false;
    set({ campaign: { ...campaign, dmScreen: { ...screen, npcCameoUsed: true } } });
    return true;
  },

  reset: () => set({ campaign: null }),
}));
