export type SituationFlow = {
  id: string;
  sceneKo: string;
  sceneEn: string;
  narrativeKo: string;
  narrativeEn: string;
  entryCardId: string;
};

export type SessionTheme = {
  sessionIndex: number;
  themeKo: string;
  themeEn: string;
  narrativeKo: string;
  narrativeEn: string;
  cardTags: string[];
  situations?: SituationFlow[];
};

export type Scenario = {
  id: string;
  nameKo: string;
  nameEn: string;
  summaryKo: string;
  summaryEn: string;
  sessionThemes: SessionTheme[];
};
