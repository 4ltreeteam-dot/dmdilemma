import { useGameStore } from '@/shared/stores/gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('starts with no active session', () => {
    const state = useGameStore.getState();
    expect(state.session).toBeNull();
  });

  it('startSession initializes with 4 party members and default satisfaction', () => {
    useGameStore.getState().startSession();
    const session = useGameStore.getState().session!;
    expect(session.party).toHaveLength(4);
    expect(session.satisfaction.fighter).toBe(50);
    expect(session.cardsRemaining).toBe(20);
    expect(session.isEnded).toBe(false);
    expect(session.currentCard).not.toBeNull();
  });

  it('applyChoice updates satisfaction and advances card', () => {
    useGameStore.getState().startSession(42);
    const before = useGameStore.getState().session!;
    const beforeCardId = before.currentCard!.id;
    useGameStore.getState().applyChoice('left');
    const after = useGameStore.getState().session!;
    expect(after.cardsPlayed).toHaveLength(1);
    expect(after.cardsPlayed[0]!.cardId).toBe(beforeCardId);
    expect(after.cardsRemaining).toBe(19);
  });

  it('session ends after 20 cards', () => {
    useGameStore.getState().startSession(7);
    for (let i = 0; i < 20; i++) {
      const session = useGameStore.getState().session;
      if (!session || session.isEnded) break;
      useGameStore.getState().applyChoice('left');
    }
    const session = useGameStore.getState().session!;
    expect(session.isEnded).toBe(true);
    expect(session.endReason).toBe('cards_exhausted');
  });

  it('session ends early if a character satisfaction drops to 0', () => {
    useGameStore.getState().startSession(1);
    const store = useGameStore.getState();
    store.forceSatisfaction({ fighter: 0, wizard: 50, rogue: 50, cleric: 50, bard: 0, druid: 0 });
    store.applyChoice('left');
    const session = useGameStore.getState().session!;
    expect(session.isEnded).toBe(true);
    expect(session.endReason).toBe('player_left');
  });
});
