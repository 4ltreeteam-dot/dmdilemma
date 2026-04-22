# Core Loop Prototype Implementation Plan (Plan 1/6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로컬 JSON 기반으로 카드를 스와이프하면 4명 캐릭터의 만족도가 변하는 한 세션을 실기기에서 플레이할 수 있는 프로토타입을 만든다. 픽셀 아트·Supabase·광고·다국어는 후속 플랜에서 다룬다.

**Architecture:** Expo Router 기반 React Native 앱. 게임 로직은 플랫폼 독립 순수 함수로 작성하고 TDD로 검증한다. 상태는 Zustand 단일 store. UI는 Reanimated 3 + Gesture Handler로 스와이프 구현. 콘텐츠(캐릭터·카드)는 `src/content/*.json`으로 하드코딩(후속 플랜에서 Supabase fetch로 교체).

**Tech Stack:** Expo SDK 52 + React Native 0.76, TypeScript strict, Zustand, React Native Reanimated 3, React Native Gesture Handler, Jest + @testing-library/react-native, Expo Router.

**Reference:** 디자인 문서 `docs/superpowers/specs/2026-04-22-dm-simulator-design.md` 섹션 3·4·5·6.

**스코프에서 제외 (후속 플랜)**:
- Supabase 통합 (Plan 3)
- 다국어 i18n (Plan 3)
- 픽셀 아트 스프라이트 (Plan 4)
- 주사위 롤 카드 UI (Plan 2 — 기본 롤러는 이 플랜에 포함)
- DM 스크린 (Plan 2)
- 캠페인 다중 세션 (Plan 2)
- 엔딩 판정 (Plan 2)
- 캐릭터 해금·성장 (Plan 2)
- 광고·분석 (Plan 5)

**이 플랜 완료 기준**:
- `npx expo start`로 Android 에뮬레이터/실기기에서 앱 부팅
- 홈 화면에서 "프로토타입 세션 시작" 버튼 탭
- 4명 캐릭터(전사·마법사·도적·클레릭) 이름·만족도가 화면에 표시
- 카드 텍스트 + 좌/우 선택지가 중앙에 표시
- 좌/우 스와이프 시 만족도 변동이 UI에 반영
- 20카드 소화 후 "세션 종료" 화면으로 이동
- 모든 순수 함수에 단위 테스트 통과 (satisfaction / dice / cardSelector)

---

## File Structure

이 플랜에서 생성·수정하는 파일 목록. 각 파일의 책임을 명시한다.

### 생성 (Create)

**프로젝트 구성**
- `package.json` — 의존성 및 스크립트
- `tsconfig.json` — TypeScript strict 설정
- `app.json` — Expo 설정 (앱 이름, 번들 ID, 화면 방향)
- `babel.config.js` — Reanimated 플러그인 설정
- `jest.config.js` — Jest 설정
- `jest.setup.js` — 테스트 환경 모킹

**앱 엔트리 & 라우팅**
- `app/_layout.tsx` — Expo Router 루트 레이아웃
- `app/index.tsx` — 홈 화면 (세션 시작 버튼)
- `app/session.tsx` — 세션 플레이 화면
- `app/session-summary.tsx` — 세션 종료 요약 화면

**타입 정의**
- `src/shared/types/character.ts` — PlayerCharacter 타입
- `src/shared/types/card.ts` — Card, CardChoice, SatisfactionEffect 타입
- `src/shared/types/session.ts` — SessionState 타입

**게임 로직 (순수 함수)**
- `src/features/session/engine/satisfaction.ts` — 만족도 변동 계산기
- `src/features/session/engine/cardSelector.ts` — 카드 선별 엔진
- `src/features/dice/roller.ts` — 시드 가능한 d20/d12/d6/d4 롤러

**상태 관리**
- `src/shared/stores/gameStore.ts` — Zustand 게임 상태 store

**UI 컴포넌트**
- `src/features/session/components/SatisfactionBar.tsx` — 만족도 바
- `src/features/session/components/CharacterFrame.tsx` — 캐릭터 이름 + 만족도 + 표정(이모지)
- `src/features/session/components/CardView.tsx` — 카드 텍스트 + 선택지 표시
- `src/features/session/components/SwipeableCard.tsx` — 스와이프 제스처 래퍼

**콘텐츠 시드**
- `src/content/characters.json` — 4명 기본 캐릭터 정의
- `src/content/cards.json` — 15장 카드 시드

**테스트**
- `tests/engine/satisfaction.test.ts`
- `tests/engine/cardSelector.test.ts`
- `tests/engine/dice.test.ts`
- `tests/stores/gameStore.test.ts`

### 수정 (Modify)

이 플랜은 신규 프로젝트이므로 수정 대상 없음.

---

## Task 1: Expo 프로젝트 초기화

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `app.json`
- Create: `app/_layout.tsx`
- Create: `app/index.tsx`

- [ ] **Step 1: Expo 프로젝트 생성**

Run (프로젝트 루트 `E:\LimProjects\mo_game`에서):
```bash
npx create-expo-app@latest . --template blank-typescript --no-install
```

Expected: `package.json`, `tsconfig.json`, `App.tsx`, `app.json` 생성. `--no-install`로 의존성은 다음 태스크에서 일괄 설치.

만약 프로젝트 루트에 기존 파일이 있어 충돌하면 (`.omc/` 등은 유지), `App.tsx`만 삭제하고 다음 스텝으로.

- [ ] **Step 2: Expo Router로 전환**

`App.tsx`를 삭제하고 `app/` 디렉토리 기반 라우팅으로 전환한다.

Delete: `App.tsx`

Create `app/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="session" />
      <Stack.Screen name="session-summary" />
    </Stack>
  );
}
```

Create `app/index.tsx`:
```tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DM Simulator (Prototype)</Text>
      <Pressable style={styles.button} onPress={() => router.push('/session')}>
        <Text style={styles.buttonText}>프로토타입 세션 시작</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  title: { color: '#fff', fontSize: 24, marginBottom: 40 },
  button: { backgroundColor: '#3a3', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 18 },
});
```

`app/session.tsx`와 `app/session-summary.tsx`는 Task 14·15에서 내용 작성. 지금은 빈 placeholder 생성:

Create `app/session.tsx`:
```tsx
import { View, Text } from 'react-native';

export default function Session() {
  return (
    <View><Text>Session (placeholder)</Text></View>
  );
}
```

Create `app/session-summary.tsx`:
```tsx
import { View, Text } from 'react-native';

export default function SessionSummary() {
  return (
    <View><Text>Session Summary (placeholder)</Text></View>
  );
}
```

- [ ] **Step 3: `app.json`에 Expo Router 플러그인 추가**

Edit `app.json` — `expo` 객체에 추가:
```json
{
  "expo": {
    "name": "DM Simulator",
    "slug": "dm-simulator",
    "version": "0.1.0",
    "orientation": "portrait",
    "scheme": "dmsimulator",
    "plugins": ["expo-router"],
    "android": {
      "package": "com.limprojects.dmsimulator"
    }
  }
}
```

- [ ] **Step 4: `tsconfig.json` strict 설정 확인**

Replace `tsconfig.json` contents:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"],
      "@content/*": ["./src/content/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: expo project init with expo-router"
```

---

## Task 2: 의존성 설치

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 런타임 의존성 설치**

Run:
```bash
npx expo install expo-router react-native-reanimated react-native-gesture-handler zustand
npx expo install react-native-safe-area-context react-native-screens
```

Expected: `package.json`의 `dependencies`에 6개 패키지 추가됨.

- [ ] **Step 2: 개발 의존성 설치**

Run:
```bash
npm install --save-dev jest @types/jest jest-expo @testing-library/react-native @testing-library/jest-native ts-jest
```

Expected: `devDependencies`에 6개 패키지 추가됨.

- [ ] **Step 3: 스크립트 추가**

Edit `package.json` — `scripts`에 추가:
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "test": "jest",
    "test:watch": "jest --watch",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 4: `main` 필드 Expo Router로 지정**

Edit `package.json` — 최상위:
```json
{
  "main": "expo-router/entry"
}
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install runtime and dev dependencies"
```

---

## Task 3: Babel · Jest 설정

**Files:**
- Create: `babel.config.js`
- Create: `jest.config.js`
- Create: `jest.setup.js`

- [ ] **Step 1: Babel 설정 (Reanimated 플러그인 필수)**

Create `babel.config.js`:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

중요: `react-native-reanimated/plugin`은 plugins 배열의 **마지막**에 있어야 한다.

- [ ] **Step 2: Jest 설정**

Create `jest.config.js`:
```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEach: ['@testing-library/jest-native/extend-expect'],
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@content/(.*)$': '<rootDir>/src/content/$1',
  },
};
```

- [ ] **Step 3: Jest setup (Reanimated 모킹)**

Create `jest.setup.js`:
```js
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));
```

- [ ] **Step 4: 샘플 테스트로 설정 검증**

Create `tests/sanity.test.ts`:
```ts
describe('jest setup', () => {
  it('runs a test', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npm test -- tests/sanity.test.ts`

Expected: `Tests: 1 passed, 1 total`

- [ ] **Step 5: Commit**

```bash
git add babel.config.js jest.config.js jest.setup.js tests/sanity.test.ts
git commit -m "chore: configure babel with reanimated plugin and jest"
```

---

## Task 4: 디렉토리 구조 생성

**Files:**
- Create: 빈 `.gitkeep` 파일들

- [ ] **Step 1: 디렉토리 생성**

Run (Windows Git Bash):
```bash
mkdir -p src/features/session/engine
mkdir -p src/features/session/components
mkdir -p src/features/dice
mkdir -p src/shared/types
mkdir -p src/shared/stores
mkdir -p src/shared/ui
mkdir -p src/content
mkdir -p tests/engine
mkdir -p tests/stores
mkdir -p assets/sprites
touch src/features/session/engine/.gitkeep
touch src/features/session/components/.gitkeep
touch src/features/dice/.gitkeep
touch src/shared/types/.gitkeep
touch src/shared/stores/.gitkeep
touch src/shared/ui/.gitkeep
touch src/content/.gitkeep
touch tests/engine/.gitkeep
touch tests/stores/.gitkeep
touch assets/sprites/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add src assets tests
git commit -m "chore: scaffold directory structure"
```

---

## Task 5: 캐릭터 타입 정의

**Files:**
- Create: `src/shared/types/character.ts`

- [ ] **Step 1: 타입 정의 작성**

Create `src/shared/types/character.ts`:
```ts
export type CharacterId = 'fighter' | 'wizard' | 'rogue' | 'cleric';

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
```

Rationale: MVP Plan 1에서는 4 기본 캐릭터만 다룬다. Bard·Druid는 Plan 2에서 `CharacterId`를 union 확장한다.

- [ ] **Step 2: 컴파일 검증**

Run: `npm run typecheck`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/shared/types/character.ts
git commit -m "feat(types): add PlayerCharacter type"
```

---

## Task 6: 카드 타입 정의

**Files:**
- Create: `src/shared/types/card.ts`

- [ ] **Step 1: 타입 정의 작성**

Create `src/shared/types/card.ts`:
```ts
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
  choices: CardChoice[];
  weight: number;
  cooldown: number;
  tags: string[];
};
```

Rationale: Plan 1에서는 `version` 필드 불필요 (로컬 JSON만 사용). Plan 3에서 Supabase 마이그레이션 시 추가.

- [ ] **Step 2: 컴파일 검증**

Run: `npm run typecheck`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/shared/types/card.ts
git commit -m "feat(types): add Card and related types"
```

---

## Task 7: 세션 상태 타입 정의

**Files:**
- Create: `src/shared/types/session.ts`

- [ ] **Step 1: 타입 정의 작성**

Create `src/shared/types/session.ts`:
```ts
import type { Card, SwipeDirection } from './card';
import type { CharacterId } from './character';

export type PartySatisfaction = Record<CharacterId, number>;

export type SessionPhase = 'opening' | 'main' | 'ending' | 'summary';

export type PlayedCardHistory = {
  cardId: string;
  direction: SwipeDirection;
  satisfactionBefore: PartySatisfaction;
  satisfactionAfter: PartySatisfaction;
};

export type SessionState = {
  sessionIndex: number;
  party: CharacterId[];
  satisfaction: PartySatisfaction;
  phase: SessionPhase;
  cardsPlayed: PlayedCardHistory[];
  cardsRemaining: number;
  currentCard: Card | null;
  isEnded: boolean;
  endReason: 'cards_exhausted' | 'player_left' | null;
};

export const TOTAL_CARDS_PER_SESSION = 20;
export const MAX_SATISFACTION = 100;
export const MIN_SATISFACTION = 0;
```

- [ ] **Step 2: 컴파일 검증**

Run: `npm run typecheck`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/shared/types/session.ts
git commit -m "feat(types): add SessionState type"
```

---

## Task 8: 캐릭터 시드 데이터

**Files:**
- Create: `src/content/characters.json`

- [ ] **Step 1: 4 기본 캐릭터 JSON 작성**

Create `src/content/characters.json`:
```json
[
  {
    "id": "fighter",
    "nameKo": "전사",
    "nameEn": "Fighter",
    "archetype": "classic",
    "defaultSatisfaction": 50,
    "modifierRules": [
      { "trigger": "card_category", "condition": "player_nonsense", "effect": 1, "description": "전투 외 헛소리에도 관대" }
    ]
  },
  {
    "id": "wizard",
    "nameKo": "마법사",
    "nameEn": "Wizard",
    "archetype": "classic",
    "defaultSatisfaction": 50,
    "modifierRules": [
      { "trigger": "card_category", "condition": "rule_dispute", "effect": 1, "description": "룰 분쟁에서 더 예민" }
    ]
  },
  {
    "id": "rogue",
    "nameKo": "도적",
    "nameEn": "Rogue",
    "archetype": "classic",
    "defaultSatisfaction": 50,
    "modifierRules": [
      { "trigger": "card_category", "condition": "backstory", "effect": 2, "description": "백스토리 파고들기 선호" }
    ]
  },
  {
    "id": "cleric",
    "nameKo": "클레릭",
    "nameEn": "Cleric",
    "archetype": "classic",
    "defaultSatisfaction": 50,
    "modifierRules": [
      { "trigger": "card_category", "condition": "meta_break", "effect": -1, "description": "메타 브레이크에 불편함" }
    ]
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add src/content/characters.json
git commit -m "feat(content): seed 4 base characters"
```

---

## Task 9: 카드 시드 데이터 (15장)

**Files:**
- Create: `src/content/cards.json`

- [ ] **Step 1: 카드 JSON 작성**

Create `src/content/cards.json`:
```json
[
  {
    "id": "rd_001_darkvision",
    "category": "rule_dispute",
    "dramaLevel": "medium",
    "minSession": 1,
    "promptKo": "전사: \"드워프는 암시야 있잖아요. 이 방에서 다 보이는 거죠?\" 마법사: \"잠깐, 암시야는 60피트까지고 흑백이에요. 이 방은 80피트인데요.\"",
    "promptEn": "Fighter: \"Dwarves have Darkvision. I can see everything in this room, right?\" Wizard: \"Wait, it's only 60 feet and monochrome. This room is 80 feet.\"",
    "choices": [
      {
        "direction": "left",
        "labelKo": "룰대로",
        "labelEn": "By the book",
        "effects": [{ "target": "fighter", "delta": -2 }, { "target": "wizard", "delta": 3 }]
      },
      {
        "direction": "right",
        "labelKo": "다 보이게",
        "labelEn": "Rule of Cool",
        "effects": [{ "target": "fighter", "delta": 2 }, { "target": "wizard", "delta": -3 }]
      }
    ],
    "weight": 5,
    "cooldown": 10,
    "tags": ["rules", "darkvision"]
  },
  {
    "id": "sp_001_edgelord_backstory",
    "category": "backstory",
    "dramaLevel": "heavy",
    "minSession": 1,
    "promptKo": "도적: \"제 캐릭터는 고아이고 마피아의 조카이고 예언의 아이입니다. 지금 공개할게요.\"",
    "promptEn": "Rogue: \"My character is an orphan, the mafia's nephew, AND the chosen one. I'll reveal it now.\"",
    "choices": [
      {
        "direction": "left",
        "labelKo": "진지하게 받아주기",
        "labelEn": "Take it seriously",
        "effects": [{ "target": "rogue", "delta": 3 }, { "target": "others", "delta": -1 }]
      },
      {
        "direction": "right",
        "labelKo": "가볍게 넘기기",
        "labelEn": "Brush it off",
        "effects": [{ "target": "rogue", "delta": -2 }, { "target": "others", "delta": 1 }]
      }
    ],
    "weight": 5,
    "cooldown": 10,
    "tags": ["backstory", "spotlight"]
  },
  {
    "id": "pn_001_talk_to_box",
    "category": "player_nonsense",
    "dramaLevel": "light",
    "minSession": 1,
    "promptKo": "전사가 상자를 여는 대신 \"상자에게 말을 건다\"고 선언한다.",
    "promptEn": "The Fighter declares they want to \"talk to the box\" instead of opening it.",
    "choices": [
      {
        "direction": "left",
        "labelKo": "룰대로 NO",
        "labelEn": "Rule it out",
        "effects": [{ "target": "fighter", "delta": -1 }]
      },
      {
        "direction": "right",
        "labelKo": "즉흥 NPC 등장",
        "labelEn": "Improvise an NPC",
        "effects": [{ "target": "fighter", "delta": 2 }, { "target": "wizard", "delta": -1 }]
      }
    ],
    "weight": 7,
    "cooldown": 8,
    "tags": ["nonsense"]
  },
  {
    "id": "tm_001_snack",
    "category": "table_management",
    "dramaLevel": "light",
    "minSession": 1,
    "promptKo": "클레릭: \"잠깐, 배가 고픈데요...\"",
    "promptEn": "Cleric: \"Wait, I'm hungry...\"",
    "choices": [
      {
        "direction": "left",
        "labelKo": "거절",
        "labelEn": "Refuse",
        "effects": [{ "target": "cleric", "delta": -1 }]
      },
      {
        "direction": "right",
        "labelKo": "휴식 선언",
        "labelEn": "Call a break",
        "effects": [{ "target": "all", "delta": 1 }]
      }
    ],
    "weight": 8,
    "cooldown": 5,
    "tags": ["break"]
  },
  {
    "id": "mb_001_plot_armor",
    "category": "meta_break",
    "dramaLevel": "medium",
    "minSession": 1,
    "promptKo": "마법사가 크리티컬 실패로 즉사할 참이다. 마법사: \"제 주인공이잖아요. 진짜 죽일 건가요?\"",
    "promptEn": "Wizard critfails and would die. Wizard: \"I'm the main character. You'd really kill me?\"",
    "choices": [
      {
        "direction": "left",
        "labelKo": "공정한 위험",
        "labelEn": "Fair danger",
        "effects": [{ "target": "wizard", "delta": -3 }, { "target": "cleric", "delta": -2 }]
      },
      {
        "direction": "right",
        "labelKo": "주인공 보정",
        "labelEn": "Plot armor",
        "effects": [{ "target": "wizard", "delta": 3 }, { "target": "rogue", "delta": -2 }]
      }
    ],
    "weight": 3,
    "cooldown": 15,
    "tags": ["death", "meta"]
  },
  {
    "id": "sp_002_spotlight_share",
    "category": "spotlight",
    "dramaLevel": "light",
    "minSession": 1,
    "promptKo": "클레릭이 조용하다. 다른 셋이 대화를 주도한다.",
    "promptEn": "The Cleric is quiet while the other three dominate.",
    "choices": [
      {
        "direction": "left",
        "labelKo": "그대로 둔다",
        "labelEn": "Leave it",
        "effects": [{ "target": "cleric", "delta": -2 }]
      },
      {
        "direction": "right",
        "labelKo": "클레릭 향 NPC 등장",
        "labelEn": "Bring NPC to Cleric",
        "effects": [{ "target": "cleric", "delta": 3 }, { "target": "rogue", "delta": -1 }]
      }
    ],
    "weight": 6,
    "cooldown": 7,
    "tags": ["spotlight"]
  },
  {
    "id": "ir_001_hidden_roll",
    "category": "improv_ruling",
    "dramaLevel": "medium",
    "minSession": 1,
    "promptKo": "도적이 함정 감지 판정. 주사위 결과를 공개할까, 숨길까?",
    "promptEn": "Rogue rolls for trap detection. Reveal the die or hide it?",
    "choices": [
      {
        "direction": "left",
        "labelKo": "공개",
        "labelEn": "Reveal",
        "effects": [{ "target": "wizard", "delta": 1 }, { "target": "rogue", "delta": -1 }]
      },
      {
        "direction": "right",
        "labelKo": "숨김",
        "labelEn": "Hide",
        "effects": [{ "target": "rogue", "delta": 2 }, { "target": "wizard", "delta": -2 }]
      }
    ],
    "weight": 5,
    "cooldown": 8,
    "tags": ["dice"]
  },
  {
    "id": "ei_001_doorbell",
    "category": "external_interruption",
    "dramaLevel": "light",
    "minSession": 1,
    "promptKo": "초인종이 울린다. 피자 배달이다.",
    "promptEn": "Doorbell rings. Pizza delivery.",
    "choices": [
      {
        "direction": "left",
        "labelKo": "끊고 먹는다",
        "labelEn": "Pause and eat",
        "effects": [{ "target": "all", "delta": 1 }]
      },
      {
        "direction": "right",
        "labelKo": "진행 강행",
        "labelEn": "Push through",
        "effects": [{ "target": "fighter", "delta": 1 }, { "target": "cleric", "delta": -2 }]
      }
    ],
    "weight": 6,
    "cooldown": 12,
    "tags": ["break"]
  },
  {
    "id": "rd_002_aoo",
    "category": "rule_dispute",
    "dramaLevel": "medium",
    "minSession": 1,
    "promptKo": "마법사: \"기회공격(AoO)은 이동 칸마다 발생 아닌가요?\"",
    "promptEn": "Wizard: \"Doesn't AoO trigger per square moved?\"",
    "choices": [
      {
        "direction": "left",
        "labelKo": "1회만",
        "labelEn": "Once only",
        "effects": [{ "target": "fighter", "delta": 2 }, { "target": "wizard", "delta": -2 }]
      },
      {
        "direction": "right",
        "labelKo": "5e 정답",
        "labelEn": "5e RAW",
        "effects": [{ "target": "wizard", "delta": 3 }]
      }
    ],
    "weight": 4,
    "cooldown": 12,
    "tags": ["rules"]
  },
  {
    "id": "pn_002_seduce_dragon",
    "category": "player_nonsense",
    "dramaLevel": "medium",
    "minSession": 1,
    "promptKo": "도적: \"드래곤을 유혹해볼게요.\"",
    "promptEn": "Rogue: \"I attempt to seduce the dragon.\"",
    "choices": [
      {
        "direction": "left",
        "labelKo": "즉결 거부",
        "labelEn": "Refuse outright",
        "effects": [{ "target": "rogue", "delta": -2 }]
      },
      {
        "direction": "right",
        "labelKo": "매력 판정 허용",
        "labelEn": "Allow Charisma check",
        "effects": [{ "target": "rogue", "delta": 3 }, { "target": "wizard", "delta": -1 }]
      }
    ],
    "weight": 7,
    "cooldown": 10,
    "tags": ["nonsense", "meme"]
  },
  {
    "id": "bs_001_orphan",
    "category": "backstory",
    "dramaLevel": "light",
    "minSession": 1,
    "promptKo": "클레릭이 NPC 사제를 보고 어머니 기억을 떠올린다.",
    "promptEn": "Cleric sees an NPC priest and recalls their mother.",
    "choices": [
      {
        "direction": "left",
        "labelKo": "짧게 넘김",
        "labelEn": "Move on briefly",
        "effects": [{ "target": "cleric", "delta": -1 }]
      },
      {
        "direction": "right",
        "labelKo": "회상 장면 삽입",
        "labelEn": "Insert flashback",
        "effects": [{ "target": "cleric", "delta": 3 }, { "target": "fighter", "delta": -1 }]
      }
    ],
    "weight": 5,
    "cooldown": 10,
    "tags": ["backstory"]
  },
  {
    "id": "mb_002_fourth_wall",
    "category": "meta_break",
    "dramaLevel": "light",
    "minSession": 1,
    "promptKo": "전사가 \"다음 세션 미리 생각해둔 농담이 있는데요\"라며 메타 개그를 꺼낸다.",
    "promptEn": "Fighter drops a meta joke about \"next session's prep\".",
    "choices": [
      {
        "direction": "left",
        "labelKo": "몰입 유지",
        "labelEn": "Stay immersed",
        "effects": [{ "target": "fighter", "delta": -1 }, { "target": "cleric", "delta": 1 }]
      },
      {
        "direction": "right",
        "labelKo": "같이 웃어줌",
        "labelEn": "Laugh along",
        "effects": [{ "target": "fighter", "delta": 2 }, { "target": "cleric", "delta": -2 }]
      }
    ],
    "weight": 5,
    "cooldown": 10,
    "tags": ["meta"]
  },
  {
    "id": "tm_002_bathroom",
    "category": "table_management",
    "dramaLevel": "light",
    "minSession": 1,
    "promptKo": "전사가 \"화장실 갔다 올게요\"라며 자리를 비운다.",
    "promptEn": "Fighter says \"Bathroom break\" and leaves.",
    "choices": [
      {
        "direction": "left",
        "labelKo": "진행 보류",
        "labelEn": "Pause",
        "effects": [{ "target": "all", "delta": 1 }]
      },
      {
        "direction": "right",
        "labelKo": "다른 셋 장면 진행",
        "labelEn": "Continue with others",
        "effects": [{ "target": "fighter", "delta": -2 }, { "target": "rogue", "delta": 1 }]
      }
    ],
    "weight": 6,
    "cooldown": 8,
    "tags": ["break"]
  },
  {
    "id": "sp_003_rogue_solo",
    "category": "spotlight",
    "dramaLevel": "medium",
    "minSession": 1,
    "promptKo": "도적이 또 \"혼자 정찰 가겠다\"고 한다.",
    "promptEn": "Rogue insists on solo scouting. Again.",
    "choices": [
      {
        "direction": "left",
        "labelKo": "허락",
        "labelEn": "Allow",
        "effects": [{ "target": "rogue", "delta": 2 }, { "target": "others", "delta": -1 }]
      },
      {
        "direction": "right",
        "labelKo": "파티 동행 요구",
        "labelEn": "Require the party",
        "effects": [{ "target": "rogue", "delta": -2 }, { "target": "cleric", "delta": 2 }]
      }
    ],
    "weight": 5,
    "cooldown": 8,
    "tags": ["spotlight"]
  },
  {
    "id": "ei_002_phone",
    "category": "external_interruption",
    "dramaLevel": "medium",
    "minSession": 1,
    "promptKo": "마법사 폰이 요란하게 울린다. 가족 전화.",
    "promptEn": "Wizard's phone blares. Family calling.",
    "choices": [
      {
        "direction": "left",
        "labelKo": "잠시 멈춤",
        "labelEn": "Pause",
        "effects": [{ "target": "wizard", "delta": 2 }, { "target": "fighter", "delta": -1 }]
      },
      {
        "direction": "right",
        "labelKo": "계속 진행",
        "labelEn": "Keep going",
        "effects": [{ "target": "wizard", "delta": -3 }]
      }
    ],
    "weight": 4,
    "cooldown": 15,
    "tags": ["interruption"]
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add src/content/cards.json
git commit -m "feat(content): seed 15 cards covering 8 categories"
```

---

## Task 10: 만족도 계산기 — 실패 테스트 작성

**Files:**
- Create: `tests/engine/satisfaction.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

Create `tests/engine/satisfaction.test.ts`:
```ts
import { applyEffects, clampSatisfaction } from '@/features/session/engine/satisfaction';
import type { PartySatisfaction } from '@/shared/types/session';
import type { SatisfactionEffect } from '@/shared/types/card';

const base: PartySatisfaction = { fighter: 50, wizard: 50, rogue: 50, cleric: 50 };

describe('satisfaction engine', () => {
  it('applies effect to a single character', () => {
    const effects: SatisfactionEffect[] = [{ target: 'fighter', delta: -2 }];
    const result = applyEffects(base, effects, ['fighter', 'wizard', 'rogue', 'cleric']);
    expect(result.fighter).toBe(48);
    expect(result.wizard).toBe(50);
  });

  it('applies "all" to every party member', () => {
    const effects: SatisfactionEffect[] = [{ target: 'all', delta: 1 }];
    const result = applyEffects(base, effects, ['fighter', 'wizard', 'rogue', 'cleric']);
    expect(result).toEqual({ fighter: 51, wizard: 51, rogue: 51, cleric: 51 });
  });

  it('applies "others" to non-specified members relative to first specified', () => {
    const effects: SatisfactionEffect[] = [
      { target: 'rogue', delta: 3 },
      { target: 'others', delta: -1 },
    ];
    const result = applyEffects(base, effects, ['fighter', 'wizard', 'rogue', 'cleric']);
    expect(result.rogue).toBe(53);
    expect(result.fighter).toBe(49);
    expect(result.wizard).toBe(49);
    expect(result.cleric).toBe(49);
  });

  it('clamps satisfaction within [0, 100]', () => {
    expect(clampSatisfaction(-5)).toBe(0);
    expect(clampSatisfaction(150)).toBe(100);
    expect(clampSatisfaction(75)).toBe(75);
  });

  it('clamps via applyEffects when delta exceeds bounds', () => {
    const edge: PartySatisfaction = { fighter: 98, wizard: 2, rogue: 50, cleric: 50 };
    const effects: SatisfactionEffect[] = [
      { target: 'fighter', delta: 5 },
      { target: 'wizard', delta: -5 },
    ];
    const result = applyEffects(edge, effects, ['fighter', 'wizard', 'rogue', 'cleric']);
    expect(result.fighter).toBe(100);
    expect(result.wizard).toBe(0);
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `npm test -- tests/engine/satisfaction.test.ts`

Expected: `Cannot find module '@/features/session/engine/satisfaction'` 오류로 FAIL.

---

## Task 11: 만족도 계산기 — 구현

**Files:**
- Create: `src/features/session/engine/satisfaction.ts`

- [ ] **Step 1: 구현 작성**

Create `src/features/session/engine/satisfaction.ts`:
```ts
import type { CharacterId } from '@/shared/types/character';
import type { SatisfactionEffect } from '@/shared/types/card';
import type { PartySatisfaction } from '@/shared/types/session';
import { MAX_SATISFACTION, MIN_SATISFACTION } from '@/shared/types/session';

export function clampSatisfaction(value: number): number {
  if (value < MIN_SATISFACTION) return MIN_SATISFACTION;
  if (value > MAX_SATISFACTION) return MAX_SATISFACTION;
  return value;
}

export function applyEffects(
  current: PartySatisfaction,
  effects: SatisfactionEffect[],
  party: CharacterId[],
): PartySatisfaction {
  const next: PartySatisfaction = { ...current };

  const explicitTargets = new Set<CharacterId>();
  for (const effect of effects) {
    if (effect.target !== 'all' && effect.target !== 'others') {
      explicitTargets.add(effect.target);
    }
  }

  for (const effect of effects) {
    if (effect.target === 'all') {
      for (const member of party) {
        next[member] = clampSatisfaction(next[member] + effect.delta);
      }
    } else if (effect.target === 'others') {
      for (const member of party) {
        if (!explicitTargets.has(member)) {
          next[member] = clampSatisfaction(next[member] + effect.delta);
        }
      }
    } else {
      if (party.includes(effect.target)) {
        next[effect.target] = clampSatisfaction(next[effect.target] + effect.delta);
      }
    }
  }

  return next;
}
```

- [ ] **Step 2: 테스트 실행하여 통과 확인**

Run: `npm test -- tests/engine/satisfaction.test.ts`

Expected: `Tests: 5 passed, 5 total`

- [ ] **Step 3: Commit**

```bash
git add src/features/session/engine/satisfaction.ts tests/engine/satisfaction.test.ts
git commit -m "feat(engine): add applyEffects satisfaction calculator (TDD)"
```

---

## Task 12: 주사위 롤러 — 실패 테스트 작성

**Files:**
- Create: `tests/engine/dice.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

Create `tests/engine/dice.test.ts`:
```ts
import { createRoller } from '@/features/dice/roller';

describe('dice roller', () => {
  it('rolls d20 within [1, 20]', () => {
    const roller = createRoller(42);
    for (let i = 0; i < 100; i++) {
      const result = roller.roll(20);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    }
  });

  it('rolls d4 within [1, 4]', () => {
    const roller = createRoller(1);
    for (let i = 0; i < 20; i++) {
      const result = roller.roll(4);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(4);
    }
  });

  it('is deterministic when seeded identically', () => {
    const rollerA = createRoller(123);
    const rollerB = createRoller(123);
    const seqA = Array.from({ length: 10 }, () => rollerA.roll(20));
    const seqB = Array.from({ length: 10 }, () => rollerB.roll(20));
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const rollerA = createRoller(1);
    const rollerB = createRoller(2);
    const seqA = Array.from({ length: 10 }, () => rollerA.roll(20));
    const seqB = Array.from({ length: 10 }, () => rollerB.roll(20));
    expect(seqA).not.toEqual(seqB);
  });

  it('rejects invalid die sides', () => {
    const roller = createRoller(0);
    expect(() => roller.roll(0)).toThrow();
    expect(() => roller.roll(-1)).toThrow();
    expect(() => roller.roll(1.5)).toThrow();
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `npm test -- tests/engine/dice.test.ts`

Expected: `Cannot find module '@/features/dice/roller'` 오류로 FAIL.

---

## Task 13: 주사위 롤러 — 구현

**Files:**
- Create: `src/features/dice/roller.ts`

- [ ] **Step 1: mulberry32 PRNG 기반 롤러 구현**

Create `src/features/dice/roller.ts`:
```ts
export type DiceRoller = {
  roll: (sides: number) => number;
};

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRoller(seed: number): DiceRoller {
  const rand = mulberry32(seed);
  return {
    roll(sides: number): number {
      if (!Number.isInteger(sides) || sides < 1) {
        throw new Error(`invalid die: ${sides}`);
      }
      return Math.floor(rand() * sides) + 1;
    },
  };
}
```

- [ ] **Step 2: 테스트 실행하여 통과 확인**

Run: `npm test -- tests/engine/dice.test.ts`

Expected: `Tests: 5 passed, 5 total`

- [ ] **Step 3: Commit**

```bash
git add src/features/dice/roller.ts tests/engine/dice.test.ts
git commit -m "feat(dice): add seedable mulberry32 dice roller (TDD)"
```

---

## Task 14: 카드 선별 엔진 — 실패 테스트 작성

**Files:**
- Create: `tests/engine/cardSelector.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

Create `tests/engine/cardSelector.test.ts`:
```ts
import { selectNextCard, CardSelectionContext } from '@/features/session/engine/cardSelector';
import { createRoller } from '@/features/dice/roller';
import type { Card } from '@/shared/types/card';

const roller = () => createRoller(42);

const baseCard = (overrides: Partial<Card>): Card => ({
  id: overrides.id ?? 'c1',
  category: overrides.category ?? 'rule_dispute',
  dramaLevel: overrides.dramaLevel ?? 'medium',
  minSession: overrides.minSession ?? 1,
  promptKo: 'ko',
  promptEn: 'en',
  choices: [
    { direction: 'left', labelKo: 'L', labelEn: 'L', effects: [] },
    { direction: 'right', labelKo: 'R', labelEn: 'R', effects: [] },
  ],
  weight: overrides.weight ?? 5,
  cooldown: overrides.cooldown ?? 10,
  tags: [],
  ...overrides,
});

describe('cardSelector', () => {
  it('returns a card from the pool', () => {
    const pool = [baseCard({ id: 'a' }), baseCard({ id: 'b' })];
    const ctx: CardSelectionContext = {
      pool,
      party: ['fighter', 'wizard', 'rogue', 'cleric'],
      cardsPlayedIds: [],
      cardIndex: 0,
      roller: roller(),
    };
    const card = selectNextCard(ctx);
    expect(card).not.toBeNull();
    expect(['a', 'b']).toContain(card!.id);
  });

  it('respects minSession filter', () => {
    const pool = [
      baseCard({ id: 'early', minSession: 1 }),
      baseCard({ id: 'late', minSession: 5 }),
    ];
    const ctx: CardSelectionContext = {
      pool,
      party: ['fighter', 'wizard', 'rogue', 'cleric'],
      cardsPlayedIds: [],
      cardIndex: 0,
      roller: roller(),
      sessionIndex: 1,
    };
    const ids = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const c = selectNextCard({ ...ctx, roller: createRoller(i) });
      if (c) ids.add(c.id);
    }
    expect(ids.has('early')).toBe(true);
    expect(ids.has('late')).toBe(false);
  });

  it('excludes cards within cooldown', () => {
    const pool = [
      baseCard({ id: 'recent', cooldown: 5 }),
      baseCard({ id: 'other', cooldown: 5 }),
    ];
    const ctx: CardSelectionContext = {
      pool,
      party: ['fighter', 'wizard', 'rogue', 'cleric'],
      cardsPlayedIds: ['recent', 'x', 'y'],
      cardIndex: 3,
      roller: roller(),
    };
    const card = selectNextCard(ctx);
    expect(card).not.toBeNull();
    expect(card!.id).toBe('other');
  });

  it('filters out cards requiring absent characters', () => {
    const pool = [
      baseCard({ id: 'needs_bard', requiresCharacter: ['fighter'] }),
      baseCard({ id: 'generic' }),
    ];
    const ctx: CardSelectionContext = {
      pool,
      party: ['wizard', 'rogue', 'cleric', 'fighter'],
      cardsPlayedIds: [],
      cardIndex: 0,
      roller: roller(),
    };
    const card = selectNextCard(ctx);
    expect(card).not.toBeNull();
  });

  it('returns null when no valid card remains', () => {
    const pool = [baseCard({ id: 'only', cooldown: 10 })];
    const ctx: CardSelectionContext = {
      pool,
      party: ['fighter', 'wizard', 'rogue', 'cleric'],
      cardsPlayedIds: ['only'],
      cardIndex: 1,
      roller: roller(),
    };
    const card = selectNextCard(ctx);
    expect(card).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `npm test -- tests/engine/cardSelector.test.ts`

Expected: `Cannot find module '@/features/session/engine/cardSelector'` 오류로 FAIL.

---

## Task 15: 카드 선별 엔진 — 구현

**Files:**
- Create: `src/features/session/engine/cardSelector.ts`

- [ ] **Step 1: 구현 작성**

Create `src/features/session/engine/cardSelector.ts`:
```ts
import type { Card } from '@/shared/types/card';
import type { CharacterId } from '@/shared/types/character';
import type { DiceRoller } from '@/features/dice/roller';

export type CardSelectionContext = {
  pool: Card[];
  party: CharacterId[];
  cardsPlayedIds: string[];
  cardIndex: number;
  roller: DiceRoller;
  sessionIndex?: number;
};

function isEligible(card: Card, ctx: CardSelectionContext): boolean {
  const sessionIndex = ctx.sessionIndex ?? 1;
  if (card.minSession > sessionIndex) return false;
  if (card.maxSession !== undefined && card.maxSession < sessionIndex) return false;

  const playsAgo = ctx.cardsPlayedIds.lastIndexOf(card.id);
  if (playsAgo !== -1) {
    const distance = ctx.cardIndex - playsAgo;
    if (distance <= card.cooldown) return false;
  }

  if (card.requiresCharacter && card.requiresCharacter.length > 0) {
    const allPresent = card.requiresCharacter.every(c => ctx.party.includes(c));
    if (!allPresent) return false;
  }

  if (card.excludesCharacter && card.excludesCharacter.length > 0) {
    const anyExcluded = card.excludesCharacter.some(c => ctx.party.includes(c));
    if (anyExcluded) return false;
  }

  return true;
}

function weightedPick(candidates: Card[], roller: DiceRoller): Card {
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  const roll = roller.roll(totalWeight);
  let acc = 0;
  for (const card of candidates) {
    acc += card.weight;
    if (roll <= acc) return card;
  }
  return candidates[candidates.length - 1]!;
}

export function selectNextCard(ctx: CardSelectionContext): Card | null {
  const eligible = ctx.pool.filter(c => isEligible(c, ctx));
  if (eligible.length === 0) return null;
  return weightedPick(eligible, ctx.roller);
}
```

- [ ] **Step 2: 테스트 실행하여 통과 확인**

Run: `npm test -- tests/engine/cardSelector.test.ts`

Expected: `Tests: 5 passed, 5 total`

- [ ] **Step 3: Commit**

```bash
git add src/features/session/engine/cardSelector.ts tests/engine/cardSelector.test.ts
git commit -m "feat(engine): add selectNextCard card selection engine (TDD)"
```

---

## Task 16: Zustand 게임 상태 store — 실패 테스트

**Files:**
- Create: `tests/stores/gameStore.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

Create `tests/stores/gameStore.test.ts`:
```ts
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
    store.forceSatisfaction({ fighter: 0, wizard: 50, rogue: 50, cleric: 50 });
    store.applyChoice('left');
    const session = useGameStore.getState().session!;
    expect(session.isEnded).toBe(true);
    expect(session.endReason).toBe('player_left');
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `npm test -- tests/stores/gameStore.test.ts`

Expected: `Cannot find module '@/shared/stores/gameStore'` 오류로 FAIL.

---

## Task 17: Zustand 게임 상태 store — 구현

**Files:**
- Create: `src/shared/stores/gameStore.ts`

- [ ] **Step 1: store 구현**

Create `src/shared/stores/gameStore.ts`:
```ts
import { create } from 'zustand';
import type { Card, SwipeDirection } from '@/shared/types/card';
import type { CharacterId, PlayerCharacter } from '@/shared/types/character';
import type { PartySatisfaction, SessionState } from '@/shared/types/session';
import { TOTAL_CARDS_PER_SESSION } from '@/shared/types/session';
import { applyEffects } from '@/features/session/engine/satisfaction';
import { selectNextCard } from '@/features/session/engine/cardSelector';
import { createRoller, type DiceRoller } from '@/features/dice/roller';
import charactersData from '@/content/characters.json';
import cardsData from '@/content/cards.json';

const characters = charactersData as unknown as PlayerCharacter[];
const cards = cardsData as unknown as Card[];

type GameStore = {
  session: SessionState | null;
  roller: DiceRoller;
  startSession: (seed?: number) => void;
  applyChoice: (direction: SwipeDirection) => void;
  forceSatisfaction: (next: PartySatisfaction) => void;
  reset: () => void;
};

function initialSatisfaction(party: CharacterId[]): PartySatisfaction {
  const map: Partial<PartySatisfaction> = {};
  for (const id of party) {
    const char = characters.find(c => c.id === id);
    map[id] = char?.defaultSatisfaction ?? 50;
  }
  return map as PartySatisfaction;
}

function anyoneLeft(satisfaction: PartySatisfaction, party: CharacterId[]): boolean {
  return party.some(id => satisfaction[id] <= 0);
}

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  roller: createRoller(Date.now()),

  startSession: (seed?: number) => {
    const roller = createRoller(seed ?? Date.now());
    const party: CharacterId[] = ['fighter', 'wizard', 'rogue', 'cleric'];
    const satisfaction = initialSatisfaction(party);

    const firstCard = selectNextCard({
      pool: cards,
      party,
      cardsPlayedIds: [],
      cardIndex: 0,
      roller,
      sessionIndex: 1,
    });

    set({
      roller,
      session: {
        sessionIndex: 1,
        party,
        satisfaction,
        phase: 'main',
        cardsPlayed: [],
        cardsRemaining: TOTAL_CARDS_PER_SESSION,
        currentCard: firstCard,
        isEnded: false,
        endReason: null,
      },
    });
  },

  applyChoice: (direction: SwipeDirection) => {
    const { session, roller } = get();
    if (!session || !session.currentCard || session.isEnded) return;

    const choice = session.currentCard.choices.find(c => c.direction === direction);
    if (!choice) return;

    const before = session.satisfaction;
    const after = applyEffects(before, choice.effects, session.party);

    const cardsPlayed = [
      ...session.cardsPlayed,
      {
        cardId: session.currentCard.id,
        direction,
        satisfactionBefore: before,
        satisfactionAfter: after,
      },
    ];
    const cardsRemaining = session.cardsRemaining - 1;
    const cardIndex = cardsPlayed.length;

    const someoneLeft = anyoneLeft(after, session.party);

    if (someoneLeft) {
      set({
        session: {
          ...session,
          satisfaction: after,
          cardsPlayed,
          cardsRemaining,
          currentCard: null,
          isEnded: true,
          endReason: 'player_left',
        },
      });
      return;
    }

    if (cardsRemaining <= 0) {
      set({
        session: {
          ...session,
          satisfaction: after,
          cardsPlayed,
          cardsRemaining: 0,
          currentCard: null,
          isEnded: true,
          endReason: 'cards_exhausted',
        },
      });
      return;
    }

    const nextCard = selectNextCard({
      pool: cards,
      party: session.party,
      cardsPlayedIds: cardsPlayed.map(p => p.cardId),
      cardIndex,
      roller,
      sessionIndex: session.sessionIndex,
    });

    set({
      session: {
        ...session,
        satisfaction: after,
        cardsPlayed,
        cardsRemaining,
        currentCard: nextCard,
        isEnded: nextCard === null,
        endReason: nextCard === null ? 'cards_exhausted' : null,
      },
    });
  },

  forceSatisfaction: (next: PartySatisfaction) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, satisfaction: next } });
  },

  reset: () => {
    set({ session: null, roller: createRoller(Date.now()) });
  },
}));
```

- [ ] **Step 2: 테스트 실행하여 통과 확인**

Run: `npm test -- tests/stores/gameStore.test.ts`

Expected: `Tests: 5 passed, 5 total`

- [ ] **Step 3: Commit**

```bash
git add src/shared/stores/gameStore.ts tests/stores/gameStore.test.ts
git commit -m "feat(store): add zustand game store with session lifecycle (TDD)"
```

---

## Task 18: 만족도 바 UI 컴포넌트

**Files:**
- Create: `src/features/session/components/SatisfactionBar.tsx`

- [ ] **Step 1: 컴포넌트 작성**

Create `src/features/session/components/SatisfactionBar.tsx`:
```tsx
import { View, StyleSheet } from 'react-native';

type Props = {
  value: number;
};

function colorFor(value: number): string {
  if (value < 20) return '#c33';
  if (value < 40) return '#e80';
  if (value < 70) return '#db0';
  if (value < 90) return '#7c3';
  return '#3c6';
}

export function SatisfactionBar({ value }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: colorFor(clamped) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%' },
});
```

- [ ] **Step 2: TypeScript 검증**

Run: `npm run typecheck`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/features/session/components/SatisfactionBar.tsx
git commit -m "feat(ui): add SatisfactionBar component"
```

---

## Task 19: 캐릭터 프레임 UI 컴포넌트

**Files:**
- Create: `src/features/session/components/CharacterFrame.tsx`

- [ ] **Step 1: 컴포넌트 작성**

Create `src/features/session/components/CharacterFrame.tsx`:
```tsx
import { View, Text, StyleSheet } from 'react-native';
import { SatisfactionBar } from './SatisfactionBar';
import type { CharacterId } from '@/shared/types/character';

type Props = {
  characterId: CharacterId;
  name: string;
  satisfaction: number;
};

function emojiFor(value: number): string {
  if (value < 20) return '😡';
  if (value < 40) return '😒';
  if (value < 70) return '😐';
  if (value < 90) return '🙂';
  return '😄';
}

export function CharacterFrame({ name, satisfaction }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emojiFor(satisfaction)}</Text>
      <Text style={styles.name}>{name}</Text>
      <SatisfactionBar value={satisfaction} />
      <Text style={styles.value}>{Math.round(satisfaction)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 120, alignItems: 'center', padding: 8 },
  emoji: { fontSize: 36 },
  name: { color: '#fff', fontSize: 14, marginVertical: 4 },
  value: { color: '#aaa', fontSize: 11, marginTop: 2 },
});
```

Rationale: Plan 1에서는 이모지로 표정 대체. Plan 4에서 픽셀 스프라이트로 교체.

- [ ] **Step 2: TypeScript 검증**

Run: `npm run typecheck`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/features/session/components/CharacterFrame.tsx
git commit -m "feat(ui): add CharacterFrame with emoji placeholder"
```

---

## Task 20: 카드 뷰 UI 컴포넌트

**Files:**
- Create: `src/features/session/components/CardView.tsx`

- [ ] **Step 1: 컴포넌트 작성**

Create `src/features/session/components/CardView.tsx`:
```tsx
import { View, Text, StyleSheet } from 'react-native';
import type { Card } from '@/shared/types/card';

type Props = {
  card: Card;
};

export function CardView({ card }: Props) {
  const leftChoice = card.choices.find(c => c.direction === 'left');
  const rightChoice = card.choices.find(c => c.direction === 'right');

  return (
    <View style={styles.card}>
      <Text style={styles.prompt}>{card.promptKo}</Text>
      <View style={styles.choicesRow}>
        <Text style={styles.choiceLeft}>◄ {leftChoice?.labelKo ?? ''}</Text>
        <Text style={styles.choiceRight}>{rightChoice?.labelKo ?? ''} ►</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 24,
    minHeight: 280,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#444',
  },
  prompt: { color: '#fff', fontSize: 16, lineHeight: 22 },
  choicesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  choiceLeft: { color: '#d77', fontSize: 13 },
  choiceRight: { color: '#7d7', fontSize: 13 },
});
```

- [ ] **Step 2: TypeScript 검증**

Run: `npm run typecheck`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/features/session/components/CardView.tsx
git commit -m "feat(ui): add CardView component (KO only in Plan 1)"
```

---

## Task 21: 스와이프 가능한 카드 래퍼

**Files:**
- Create: `src/features/session/components/SwipeableCard.tsx`

- [ ] **Step 1: 제스처 핸들러 + Reanimated 구현**

Create `src/features/session/components/SwipeableCard.tsx`:
```tsx
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withSpring, withTiming } from 'react-native-reanimated';
import type { SwipeDirection } from '@/shared/types/card';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type Props = {
  children: React.ReactNode;
  onSwipe: (direction: SwipeDirection) => void;
};

export function SwipeableCard({ children, onSwipe }: Props) {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  const commit = (direction: SwipeDirection) => {
    onSwipe(direction);
    translateX.value = 0;
    rotate.value = 0;
  };

  const pan = Gesture.Pan()
    .onUpdate(e => {
      translateX.value = e.translationX;
      rotate.value = (e.translationX / SCREEN_WIDTH) * 15;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 });
        runOnJS(commit)('right');
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        runOnJS(commit)('left');
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotateZ: `${rotate.value}deg` }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
});
```

- [ ] **Step 2: TypeScript 검증**

Run: `npm run typecheck`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/features/session/components/SwipeableCard.tsx
git commit -m "feat(ui): add SwipeableCard with Reanimated pan gesture"
```

---

## Task 22: 세션 플레이 화면 통합

**Files:**
- Modify: `app/session.tsx`

- [ ] **Step 1: 세션 화면 구현**

Replace `app/session.tsx`:
```tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/shared/stores/gameStore';
import { CharacterFrame } from '@/features/session/components/CharacterFrame';
import { CardView } from '@/features/session/components/CardView';
import { SwipeableCard } from '@/features/session/components/SwipeableCard';
import charactersData from '@/content/characters.json';
import type { PlayerCharacter, CharacterId } from '@/shared/types/character';

const characters = charactersData as unknown as PlayerCharacter[];

function nameOf(id: CharacterId): string {
  return characters.find(c => c.id === id)?.nameKo ?? id;
}

export default function SessionScreen() {
  const session = useGameStore(s => s.session);
  const startSession = useGameStore(s => s.startSession);
  const applyChoice = useGameStore(s => s.applyChoice);

  useEffect(() => {
    if (!session) startSession();
  }, [session, startSession]);

  useEffect(() => {
    if (session?.isEnded) {
      const t = setTimeout(() => router.replace('/session-summary'), 400);
      return () => clearTimeout(t);
    }
  }, [session?.isEnded]);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}><Text style={styles.info}>Loading...</Text></SafeAreaView>
    );
  }

  const [top1, top2, bot1, bot2] = session.party;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Session 1 · {session.cardsRemaining} cards left</Text>
      </View>
      <View style={styles.row}>
        <CharacterFrame characterId={top1!} name={nameOf(top1!)} satisfaction={session.satisfaction[top1!]} />
        <CharacterFrame characterId={top2!} name={nameOf(top2!)} satisfaction={session.satisfaction[top2!]} />
      </View>
      <View style={styles.cardArea}>
        {session.currentCard && !session.isEnded ? (
          <SwipeableCard onSwipe={dir => applyChoice(dir)}>
            <CardView card={session.currentCard} />
          </SwipeableCard>
        ) : (
          <Text style={styles.info}>Session ending...</Text>
        )}
      </View>
      <View style={styles.row}>
        <CharacterFrame characterId={bot1!} name={nameOf(bot1!)} satisfaction={session.satisfaction[bot1!]} />
        <CharacterFrame characterId={bot2!} name={nameOf(bot2!)} satisfaction={session.satisfaction[bot2!]} />
      </View>
      <Pressable style={styles.exit} onPress={() => router.replace('/')}>
        <Text style={styles.exitText}>중단하고 홈으로</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { padding: 12, alignItems: 'center' },
  headerText: { color: '#888', fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  cardArea: { flex: 1, justifyContent: 'center' },
  info: { color: '#fff', textAlign: 'center' },
  exit: { padding: 12, alignItems: 'center' },
  exitText: { color: '#666', fontSize: 12 },
});
```

- [ ] **Step 2: TypeScript 검증**

Run: `npm run typecheck`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add app/session.tsx
git commit -m "feat(screen): integrate SessionScreen with store and swipe gesture"
```

---

## Task 23: 세션 요약 화면

**Files:**
- Modify: `app/session-summary.tsx`

- [ ] **Step 1: 요약 화면 구현**

Replace `app/session-summary.tsx`:
```tsx
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/shared/stores/gameStore';
import charactersData from '@/content/characters.json';
import type { PlayerCharacter, CharacterId } from '@/shared/types/character';

const characters = charactersData as unknown as PlayerCharacter[];

function nameOf(id: CharacterId): string {
  return characters.find(c => c.id === id)?.nameKo ?? id;
}

export default function SessionSummary() {
  const session = useGameStore(s => s.session);
  const reset = useGameStore(s => s.reset);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>세션 없음</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>홈으로</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const reason = session.endReason === 'player_left'
    ? '플레이어가 떠났습니다 (배드 엔딩)'
    : '모든 카드 소진 (정상 종료)';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>세션 종료</Text>
        <Text style={styles.reason}>{reason}</Text>
        <Text style={styles.section}>최종 만족도</Text>
        {session.party.map(id => (
          <View key={id} style={styles.row}>
            <Text style={styles.name}>{nameOf(id)}</Text>
            <Text style={styles.value}>{session.satisfaction[id]}</Text>
          </View>
        ))}
        <Text style={styles.section}>플레이 카드: {session.cardsPlayed.length}장</Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            reset();
            router.replace('/');
          }}
        >
          <Text style={styles.buttonText}>홈으로</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  content: { padding: 24 },
  title: { color: '#fff', fontSize: 24, marginBottom: 12, textAlign: 'center' },
  reason: { color: '#aaa', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  section: { color: '#7c3', fontSize: 16, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  name: { color: '#ddd', fontSize: 14 },
  value: { color: '#ddd', fontSize: 14 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, marginTop: 32, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
```

- [ ] **Step 2: TypeScript 검증**

Run: `npm run typecheck`

Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add app/session-summary.tsx
git commit -m "feat(screen): add session summary screen"
```

---

## Task 24: 전체 테스트 스위트 실행 + 커버리지 체크

**Files:** (없음 — 검증만)

- [ ] **Step 1: 전체 테스트 실행**

Run: `npm test`

Expected: 모든 테스트 통과. 출력 예:
```
Test Suites: 4 passed, 4 total
Tests:       21 passed, 21 total
```

- [ ] **Step 2: TypeScript 전체 검증**

Run: `npm run typecheck`

Expected: 에러 없음.

---

## Task 25: Android 실기기/에뮬레이터 스모크 테스트

**Files:** (없음 — 검증만)

- [ ] **Step 1: Metro 번들러 시작**

Run: `npx expo start --android` (또는 `npm start` 후 Android 선택)

Expected: Metro 번들러 실행, 에뮬레이터 또는 USB 연결된 Android 기기에 앱 설치 및 실행.

- [ ] **Step 2: 홈 화면 체크**

확인:
- 앱이 크래시 없이 부팅
- "DM Simulator (Prototype)" 타이틀 표시
- "프로토타입 세션 시작" 버튼 렌더링

- [ ] **Step 3: 세션 화면 체크**

버튼 탭 후 확인:
- 4명 캐릭터 프레임 (이모지 + 이름 + 만족도 바 + 숫자) 렌더링
- 만족도 50에서 시작 (모두 🙂)
- 중앙에 카드(한글 프롬프트 + 좌/우 선택지 라벨) 표시
- 상단에 "Session 1 · 20 cards left" 표시

- [ ] **Step 4: 스와이프 체크**

- 좌 스와이프: 카드가 왼쪽으로 날아가며 새 카드 등장
- 우 스와이프: 반대
- 한 캐릭터 이상의 만족도 바 수치 변화 확인
- "cards left" 카운터 감소

- [ ] **Step 5: 세션 종료 체크**

20회 스와이프 또는 특정 캐릭터 만족도 0 도달 시:
- 세션 요약 화면으로 자동 이동
- 종료 사유 + 최종 만족도 리스트 표시
- "홈으로" 버튼으로 홈 복귀

- [ ] **Step 6: 스모크 테스트 결과 기록**

개발자 메모 (커밋 메시지에 반영):
- 에뮬레이터 vs 실기기 어느 쪽에서 테스트했는지
- 프레임 드랍·랙 발생 여부
- 스와이프 인식률 주관적 평가 (부드러운가)

- [ ] **Step 7: Commit (README + 검증 로그)**

Create `README.md`:
```markdown
# DM Simulator — Prototype

Reigns-like D&D Dungeon Master card swipe simulator.

## Plan 1: Core Loop Prototype

Status: ✅ Complete
- Card swipe with 4-character satisfaction feedback
- 15-card pool, local JSON
- 20-card session with ending conditions
- KO text only (i18n in Plan 3)

## Stack

- Expo SDK 52 + React Native 0.76
- TypeScript strict
- Zustand, Reanimated 3, Gesture Handler
- Jest + @testing-library/react-native

## Run

```bash
npm install
npx expo start --android
```

## Test

```bash
npm test
npm run typecheck
```

## Next

See `docs/superpowers/plans/` for Plan 2+ (full game loop, Supabase, i18n, art, ads, release).
```

```bash
git add README.md
git commit -m "docs: add README and verify plan 1 prototype on Android"
```

---

## Self-Review Checklist (플랜 작성 후 확인)

이 플랜이 다음을 만족하는지 완료 시점에 확인:

- [ ] 모든 `- [ ]` 체크박스가 체크됨
- [ ] 전체 `npm test` 통과 (4 suites, 약 21 tests)
- [ ] `npm run typecheck` 에러 없음
- [ ] Android 기기에서 20카드 세션 완주 가능
- [ ] 코드베이스에 TBD/TODO/placeholder 없음
- [ ] 모든 타입 정의 일관성 유지 (CharacterId, PartySatisfaction, SwipeDirection)
- [ ] 커밋 메시지가 Conventional Commits 포맷 (feat/chore/docs)

### 다음 플랜 예고

**Plan 2 (Full Game Loop)**에서 다룰 항목:
- 주사위 롤 UI (카드 선택지에 `triggersDiceRoll` 플래그 추가)
- DM 스크린 3종 (Retcon / Cool Ruling / NPC Cameo)
- 세션 3단계 페이스 엔진 (오프닝/본편/엔딩)
- 캠페인 구조 (10세션, 캠페인 상태 유지)
- 엔딩 판정 (배드 4종 + 굿 6-8종)
- 파티 편성 화면
- 캐릭터 해금 (Bard, Druid) + 레전드 포인트
- 캐릭터 성장 XP + 마일스톤
