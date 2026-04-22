import type { CharacterId } from './character';

export type CardCategory =
  | 'rule_dispute'
  | 'spotlight'
  | 'improv_ruling'
  | 'player_nonsense'
  | 'backstory'
  | 'meta_break'
  | 'table_management'
  | 'external_interruption';

export type DramaLevel = 'light' | 'medium' | 'heavy';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export type SatisfactionTarget = CharacterId | 'all' | 'others';

export type SatisfactionEffect = {
  target: SatisfactionTarget;
  delta: number;
};

export type CardChoice = {
  direction: SwipeDirection;
  labelKo: string;
  labelEn: string;
  effects: SatisfactionEffect[];
  consequenceKo?: string;
  consequenceEn?: string;
};

export type DiceBucket = {
  min: number;
  max: number;
  effects: SatisfactionEffect[];
  flavorKo?: string;
  flavorEn?: string;
};

export type DiceChoice = {
  direction: SwipeDirection;
  labelKo: string;
  labelEn: string;
  dice: {
    sides: number;
    buckets: DiceBucket[];
  };
};

export type AnyChoice = CardChoice | DiceChoice;

export function isDiceChoice(choice: AnyChoice): choice is DiceChoice {
  return 'dice' in choice;
}

export type Card = {
  id: string;
  category: CardCategory;
  dramaLevel: DramaLevel;
  minSession: number;
  maxSession?: number;
  promptKo: string;
  promptEn: string;
  flavorKo?: string;
  flavorEn?: string;
  requiresCharacter?: CharacterId[];
  excludesCharacter?: CharacterId[];
  choices: AnyChoice[];
  weight: number;
  cooldown: number;
  tags: string[];
};
