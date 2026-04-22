import { create } from 'zustand';
import type { CharacterId } from '@/shared/types/character';
import type { PlayerProfile } from '@/shared/types/progress';
import { DEFAULT_UNLOCKED_CHARACTERS } from '@/shared/types/progress';
import { checkUnlocks, applySessionXpToParty } from '@/features/campaign/engine/progressionEngine';

type ProfileStore = {
  profile: PlayerProfile;
  awardSessionXp: (party: CharacterId[], xp: number) => void;
  awardEnding: (endingId: string, legendPoints: number) => void;
  reset: () => void;
};

const initial: PlayerProfile = {
  legendPoints: 0,
  unlockedCharacters: [...DEFAULT_UNLOCKED_CHARACTERS],
  collectedEndings: [],
  characterProgress: {} as PlayerProfile['characterProgress'],
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: initial,

  awardSessionXp: (party, xp) => {
    set({ profile: applySessionXpToParty(get().profile, party, xp) });
  },

  awardEnding: (endingId, legendPoints) => {
    const profile = get().profile;
    const collected = profile.collectedEndings.includes(endingId)
      ? profile.collectedEndings
      : [...profile.collectedEndings, endingId];
    const newlyUnlocked = checkUnlocks({ collectedEndings: collected });
    const unlockedCharacters = Array.from(
      new Set([...profile.unlockedCharacters, ...newlyUnlocked]),
    );
    set({
      profile: {
        ...profile,
        collectedEndings: collected,
        unlockedCharacters,
        legendPoints: profile.legendPoints + legendPoints,
      },
    });
  },

  reset: () => set({ profile: { ...initial, unlockedCharacters: [...DEFAULT_UNLOCKED_CHARACTERS] } }),
}));
