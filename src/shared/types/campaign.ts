import type { CharacterId } from './character';
import type { SessionState } from './session';

export type DmScreenState = {
  retconUsed: boolean;
  coolRulingRemaining: number;
  npcCameoUsed: boolean;
};

export type DmAction = 'retcon' | 'cool_ruling' | 'npc_cameo';

export type SessionResult = {
  sessionIndex: number;
  finalSatisfaction: Record<CharacterId, number>;
  cardsPlayed: number;
  diceRolls: number;
  sessionXp: number;
};

export type CampaignState = {
  id: string;
  party: CharacterId[];
  startedAt: number;
  sessionIndex: number;
  totalSessions: number;
  sessionHistory: SessionResult[];
  currentSession: SessionState | null;
  dmScreen: DmScreenState;
  isEnded: boolean;
  endingId: string | null;
};

export const CAMPAIGN_TOTAL_SESSIONS = 10;

export const DEFAULT_DM_SCREEN: DmScreenState = {
  retconUsed: false,
  coolRulingRemaining: 2,
  npcCameoUsed: false,
};
