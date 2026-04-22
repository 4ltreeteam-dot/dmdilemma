export type SessionTheme = {
  sessionIndex: number;
  themeKo: string;
  themeEn: string;
  narrativeKo: string;
  narrativeEn: string;
  cardTags: string[];
};

export type Scenario = {
  id: string;
  nameKo: string;
  nameEn: string;
  summaryKo: string;
  summaryEn: string;
  sessionThemes: SessionTheme[];
};
