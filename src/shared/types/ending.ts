import type { CharacterId } from './character';

export type EndingKind = 'bad' | 'good' | 'legendary';

export type EndingTriggerRule =
  | { type: 'player_left'; character?: CharacterId; reasonTag?: string }
  | { type: 'completion_all_high'; minAverage: number; maxGap: number }
  | { type: 'completion_character_dominant'; character: CharacterId; minValue: number; maxOthers: number }
  | { type: 'completion_default' };

export type Ending = {
  id: string;
  kind: EndingKind;
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  trigger: EndingTriggerRule;
  legendPoints: number;
  artKey?: string;
};
