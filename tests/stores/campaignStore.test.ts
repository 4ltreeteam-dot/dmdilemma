import { useCampaignStore } from '@/shared/stores/campaignStore';
import { useProfileStore } from '@/shared/stores/profileStore';

describe('campaignStore', () => {
  beforeEach(() => {
    useCampaignStore.getState().reset();
    useProfileStore.getState().reset();
  });

  it('starts with no active campaign', () => {
    expect(useCampaignStore.getState().campaign).toBeNull();
  });

  it('startCampaign creates campaign with chosen party', () => {
    useCampaignStore.getState().startCampaign('dragon_return', ['fighter', 'wizard', 'rogue', 'cleric']);
    const campaign = useCampaignStore.getState().campaign!;
    expect(campaign.party).toHaveLength(4);
    expect(campaign.sessionIndex).toBe(1);
    expect(campaign.totalSessions).toBe(10);
    expect(campaign.dmScreen.retconUsed).toBe(false);
    expect(campaign.dmScreen.coolRulingRemaining).toBe(2);
    expect(campaign.currentSession).not.toBeNull();
  });

  it('useDmAction marks retcon as used', () => {
    useCampaignStore.getState().startCampaign('dragon_return', ['fighter', 'wizard', 'rogue', 'cleric']);
    useCampaignStore.getState().useDmAction('retcon');
    expect(useCampaignStore.getState().campaign!.dmScreen.retconUsed).toBe(true);
  });

  it('useDmAction decrements coolRulingRemaining', () => {
    useCampaignStore.getState().startCampaign('dragon_return', ['fighter', 'wizard', 'rogue', 'cleric']);
    useCampaignStore.getState().useDmAction('cool_ruling');
    expect(useCampaignStore.getState().campaign!.dmScreen.coolRulingRemaining).toBe(1);
  });

  it('rejects dm action when slot exhausted', () => {
    useCampaignStore.getState().startCampaign('dragon_return', ['fighter', 'wizard', 'rogue', 'cleric']);
    useCampaignStore.getState().useDmAction('retcon');
    const ok = useCampaignStore.getState().useDmAction('retcon');
    expect(ok).toBe(false);
  });

  it('advanceToNextSession increments sessionIndex', () => {
    useCampaignStore.getState().startCampaign('dragon_return', ['fighter', 'wizard', 'rogue', 'cleric']);
    useCampaignStore.getState().finishCurrentSession({
      finalSatisfaction: { fighter: 70, wizard: 70, rogue: 70, cleric: 70, bard: 0, druid: 0 },
      cardsPlayed: 20,
      diceRolls: 0,
      sessionXp: 150,
      playerLeft: null,
    });
    useCampaignStore.getState().advanceToNextSession();
    expect(useCampaignStore.getState().campaign!.sessionIndex).toBe(2);
  });

  it('ends campaign when a player leaves', () => {
    useCampaignStore.getState().startCampaign('dragon_return', ['fighter', 'wizard', 'rogue', 'cleric']);
    useCampaignStore.getState().finishCurrentSession({
      finalSatisfaction: { fighter: 0, wizard: 70, rogue: 70, cleric: 70, bard: 0, druid: 0 },
      cardsPlayed: 15,
      diceRolls: 0,
      sessionXp: 120,
      playerLeft: 'fighter',
    });
    expect(useCampaignStore.getState().campaign!.isEnded).toBe(true);
    expect(useCampaignStore.getState().campaign!.endingId).not.toBeNull();
  });

  it('ends campaign after 10th session completes', () => {
    useCampaignStore.getState().startCampaign('dragon_return', ['fighter', 'wizard', 'rogue', 'cleric']);
    for (let i = 1; i <= 10; i++) {
      useCampaignStore.getState().finishCurrentSession({
        finalSatisfaction: { fighter: 60, wizard: 60, rogue: 60, cleric: 60, bard: 0, druid: 0 },
        cardsPlayed: 20,
        diceRolls: 0,
        sessionXp: 120,
        playerLeft: null,
      });
      if (i < 10) useCampaignStore.getState().advanceToNextSession();
    }
    expect(useCampaignStore.getState().campaign!.isEnded).toBe(true);
    expect(useCampaignStore.getState().campaign!.endingId).not.toBeNull();
  });
});
