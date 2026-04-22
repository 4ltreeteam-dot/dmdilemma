export type CharacterId = 'fighter' | 'wizard' | 'rogue' | 'cleric' | 'bard' | 'druid';

export type ModifierTrigger = 'card_category' | 'other_character' | 'time_in_session';

export type ModifierRule = {
  trigger: ModifierTrigger;
  condition: string;
  effect: number;
  description: string;
};

export type PlayerCharacter = {
  id: CharacterId;
  nameKo: string;
  nameEn: string;
  archetype: 'classic' | 'meme';
  defaultSatisfaction: number;
  modifierRules: ModifierRule[];
};
