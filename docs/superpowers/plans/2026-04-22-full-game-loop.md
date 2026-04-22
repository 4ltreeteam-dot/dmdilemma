# Full Game Loop Implementation Plan (Plan 2/6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Plan 1의 단일 세션 프로토타입을 **재플레이 가능한 캠페인 게임**으로 확장한다. 10세션 캠페인, 세션 3단계 페이스, 주사위 롤 선택지, DM 스크린 3종, 엔딩 판정(배드 4 + 굿 6), 캐릭터 해금(바드·드루이드), 성장 XP·마일스톤·레전드 포인트까지 구현하여 로그라이크 메타 진행 루프를 완성한다.

**Architecture:** 기존 `gameStore`를 `campaign` 레이어로 확장하여 여러 세션을 가로지르는 상태(파티, 완료 세션, 누적 XP)를 관리한다. 신규 엔진 3종(`phaseEngine`, `diceResolver`, `endingResolver`)을 순수 함수로 추가하고 TDD로 검증. UI는 파티 편성·캠페인 인트로·엔딩·컬렉션 화면을 신규 추가하며, 기존 세션 화면은 주사위 오버레이·DM 스크린 패널을 오버레이한다.

**Tech Stack:** Plan 1과 동일. 추가 의존성 없음.

**Reference:** 디자인 문서 섹션 3.1-3.6, 4.5, 5.6; Plan 1 산출물 기반.

**스코프에서 제외 (후속 플랜)**:
- Supabase 통합 — Plan 3
- 한국어/영어 런타임 스위치 — Plan 3
- 365장 카드 콘텐츠 대량 작성 — Plan 4 (Plan 2에선 25장 추가로 메커닉 검증)
- 픽셀 아트 스프라이트 — Plan 4 (Plan 2 계속 이모지 placeholder)
- 광고 통합 — Plan 5
- 데일리 테이블·오늘의 밈 — Plan 3 이후

**Plan 2 완료 기준**:
- 홈 화면에서 "새 캠페인" → 파티 편성 → 10세션 진행 가능
- 각 세션이 3단계(opening/main/ending) 페이스로 카드 전개
- 카드 선택지 중 일부가 주사위 롤이며, 결과에 따라 효과 분기
- DM 스크린 3종(Retcon/Cool Ruling/NPC Cameo) 동작
- 10세션 완주 또는 플레이어 1명 만족도 0 → 스탯 조합별 엔딩 화면
- 엔딩 달성으로 레전드 포인트 획득, 컬렉션 도감 갱신
- 엔딩 3회 달성 시 바드 해금, 5회 달성 시 드루이드 해금
- 캐릭터별 세션 참여 XP 축적, 마일스톤 4단계 알림
- 컬렉션 화면에서 해금 현황·엔딩 도감·캐릭터 성장 확인 가능
- Jest 전체 통과, `tsc --noEmit` 에러 0, Android 스모크 테스트 통과

---

## File Structure

### 생성 (Create)

**타입 확장**
- `src/shared/types/campaign.ts` — Campaign, CampaignState, DmScreenState
- `src/shared/types/ending.ts` — Ending, EndingKind, EndingRule
- `src/shared/types/progress.ts` — CharacterProgress, Milestone

**게임 로직 엔진 (순수 함수, TDD)**
- `src/features/session/engine/phaseEngine.ts` — 세션 3단계 페이스
- `src/features/session/engine/diceResolver.ts` — 주사위 선택지 resolve
- `src/features/campaign/engine/endingResolver.ts` — 엔딩 판정
- `src/features/campaign/engine/progressionEngine.ts` — XP/마일스톤/해금

**스토어 확장**
- `src/shared/stores/campaignStore.ts` — 캠페인 라이프사이클
- 기존 `gameStore.ts` 리팩토: 세션은 campaign의 자식 상태

**신규 UI 컴포넌트**
- `src/features/session/components/DiceRollOverlay.tsx` — 주사위 롤 애니메이션
- `src/features/session/components/DmScreenPanel.tsx` — DM 스크린 3슬롯 UI
- `src/features/campaign/components/PartySlot.tsx` — 파티 편성 슬롯
- `src/features/collection/components/CharacterCard.tsx` — 도감 카드

**신규 화면**
- `app/campaign/new.tsx` — 파티 편성
- `app/campaign/intro.tsx` — 캠페인 시작 인트로
- `app/campaign/ending.tsx` — 엔딩 결과
- `app/collection/characters.tsx` — 캐릭터 도감
- `app/collection/endings.tsx` — 엔딩 도감

**콘텐츠 확장**
- `src/content/endings.json` — 엔딩 정의 8종
- `src/content/cards.json` 수정 — 25장 추가 (dice variant 포함)
- `src/content/characters.json` 수정 — 바드·드루이드 추가

**테스트**
- `tests/engine/phaseEngine.test.ts`
- `tests/engine/diceResolver.test.ts`
- `tests/engine/endingResolver.test.ts`
- `tests/engine/progressionEngine.test.ts`
- `tests/stores/campaignStore.test.ts`

### 수정 (Modify)

- `src/shared/types/card.ts` — DiceChoice 변형 추가
- `src/shared/types/session.ts` — phase 관련 필드 실제 사용
- `src/shared/types/character.ts` — CharacterId에 'bard'·'druid' 추가
- `src/shared/stores/gameStore.ts` — campaignStore로 일부 책임 이관
- `app/index.tsx` — 홈 버튼 "새 캠페인" + "도감"
- `app/session.tsx` — dice / DM screen 오버레이 통합
- `app/session-summary.tsx` — "다음 세션" 흐름
- `app/_layout.tsx` — 신규 screens 등록

---

## Task 1: CharacterId 확장 (bard·druid 추가)

**Files:**
- Modify: `src/shared/types/character.ts`

- [ ] **Step 1: union 타입 확장**

Edit `src/shared/types/character.ts`:
```ts
export type CharacterId = 'fighter' | 'wizard' | 'rogue' | 'cleric' | 'bard' | 'druid';
```

- [ ] **Step 2: typecheck**

Run: `npm run typecheck`

기존 union exhaustive check가 여러 곳에서 새 케이스를 요구할 수 있으나, 현재 코드는 `CharacterId`를 iterate만 하므로 에러 없음 예상.

- [ ] **Step 3: Commit**

```bash
git add src/shared/types/character.ts
git commit -m "feat(types): extend CharacterId with bard and druid"
```

---

## Task 2: 바드·드루이드 캐릭터 시드 추가

**Files:**
- Modify: `src/content/characters.json`

- [ ] **Step 1: 두 캐릭터 추가**

Edit `src/content/characters.json` — 기존 배열 끝에 추가:
```json
  {
    "id": "bard",
    "nameKo": "바드",
    "nameEn": "Bard",
    "archetype": "classic",
    "defaultSatisfaction": 55,
    "modifierRules": [
      { "trigger": "card_category", "condition": "spotlight", "effect": 2, "description": "NPC 등장 카드 선호" },
      { "trigger": "card_category", "condition": "backstory", "effect": 1, "description": "롤플레이 선호" }
    ]
  },
  {
    "id": "druid",
    "nameKo": "드루이드",
    "nameEn": "Druid",
    "archetype": "classic",
    "defaultSatisfaction": 50,
    "modifierRules": [
      { "trigger": "card_category", "condition": "meta_break", "effect": -2, "description": "메타 브레이크 기피" }
    ]
  }
```

- [ ] **Step 2: Commit**

```bash
git add src/content/characters.json
git commit -m "feat(content): add bard and druid character seeds"
```

---

## Task 3: 카드 타입에 주사위 선택지 변형 추가

**Files:**
- Modify: `src/shared/types/card.ts`

- [ ] **Step 1: DiceChoice 타입 추가**

Edit `src/shared/types/card.ts` — `CardChoice` 밑에 추가:
```ts
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
```

Change `Card`'s `choices` to accept either:
```ts
  choices: AnyChoice[];
```

- [ ] **Step 2: typecheck**

Run: `npm run typecheck`

기존 카드들이 `CardChoice[]`로 호환되므로 에러 없음 예상. 혹시 엄격 체크에서 문제 있으면 해당 위치에서 `isDiceChoice` 가드 사용하도록 수정.

- [ ] **Step 3: Commit**

```bash
git add src/shared/types/card.ts
git commit -m "feat(types): add DiceChoice variant for probabilistic card choices"
```

---

## Task 4: Campaign 타입 정의

**Files:**
- Create: `src/shared/types/campaign.ts`

- [ ] **Step 1: 타입 정의**

Create `src/shared/types/campaign.ts`:
```ts
import type { CharacterId } from './character';
import type { SessionState } from './session';

export type DmScreenState = {
  retconUsed: boolean;
  coolRulingRemaining: number;
  npcCameoUsed: boolean;
};

export type DmAction = 'retcon' | 'cool_ruling' | 'npc_cameo';

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

export type SessionResult = {
  sessionIndex: number;
  finalSatisfaction: Record<CharacterId, number>;
  cardsPlayed: number;
  diceRolls: number;
  sessionXp: number;
};

export const CAMPAIGN_TOTAL_SESSIONS = 10;

export const DEFAULT_DM_SCREEN: DmScreenState = {
  retconUsed: false,
  coolRulingRemaining: 2,
  npcCameoUsed: false,
};
```

- [ ] **Step 2: typecheck**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add src/shared/types/campaign.ts
git commit -m "feat(types): add CampaignState and DmScreenState"
```

---

## Task 5: Ending 타입 정의

**Files:**
- Create: `src/shared/types/ending.ts`

- [ ] **Step 1: 타입 정의**

Create `src/shared/types/ending.ts`:
```ts
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
```

- [ ] **Step 2: typecheck**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add src/shared/types/ending.ts
git commit -m "feat(types): add Ending and EndingTriggerRule"
```

---

## Task 6: CharacterProgress 타입 정의

**Files:**
- Create: `src/shared/types/progress.ts`

- [ ] **Step 1: 타입 정의**

Create `src/shared/types/progress.ts`:
```ts
import type { CharacterId } from './character';

export type MilestoneId = 'xp_500' | 'xp_1500' | 'xp_3500' | 'xp_10000';

export const MILESTONE_THRESHOLDS: Record<MilestoneId, number> = {
  xp_500: 500,
  xp_1500: 1500,
  xp_3500: 3500,
  xp_10000: 10000,
};

export type CharacterProgress = {
  characterId: CharacterId;
  xp: number;
  sessionCount: number;
  unlockedMilestones: MilestoneId[];
};

export type PlayerProfile = {
  legendPoints: number;
  unlockedCharacters: CharacterId[];
  collectedEndings: string[];
  characterProgress: Record<CharacterId, CharacterProgress>;
};

export const DEFAULT_UNLOCKED_CHARACTERS: CharacterId[] = [
  'fighter',
  'wizard',
  'rogue',
  'cleric',
];

export const LEGEND_POINTS_PER_UNLOCK = 50;
```

- [ ] **Step 2: typecheck**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add src/shared/types/progress.ts
git commit -m "feat(types): add CharacterProgress, Milestones, PlayerProfile"
```

---

## Task 7: Phase Engine — 실패 테스트 작성

**Files:**
- Create: `tests/engine/phaseEngine.test.ts`

- [ ] **Step 1: 테스트 작성**

Create `tests/engine/phaseEngine.test.ts`:
```ts
import { getPhase, getDramaWeights } from '@/features/session/engine/phaseEngine';

describe('phaseEngine', () => {
  it('returns opening for cards 1-4 of 20', () => {
    expect(getPhase(0, 20)).toBe('opening');
    expect(getPhase(3, 20)).toBe('opening');
  });

  it('returns main for cards 5-17 of 20', () => {
    expect(getPhase(4, 20)).toBe('main');
    expect(getPhase(12, 20)).toBe('main');
    expect(getPhase(16, 20)).toBe('main');
  });

  it('returns ending for cards 18-20 of 20', () => {
    expect(getPhase(17, 20)).toBe('ending');
    expect(getPhase(19, 20)).toBe('ending');
  });

  it('drama weights skew light for opening', () => {
    const w = getDramaWeights('opening');
    expect(w.light).toBeGreaterThan(w.medium);
    expect(w.heavy).toBe(0);
  });

  it('drama weights skew heavy for ending phase', () => {
    const w = getDramaWeights('ending');
    expect(w.heavy).toBeGreaterThan(0);
    expect(w.light + w.medium + w.heavy).toBeCloseTo(1, 2);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- tests/engine/phaseEngine.test.ts`

Expected: `Cannot find module '@/features/session/engine/phaseEngine'` — FAIL.

---

## Task 8: Phase Engine — 구현

**Files:**
- Create: `src/features/session/engine/phaseEngine.ts`

- [ ] **Step 1: 구현**

Create `src/features/session/engine/phaseEngine.ts`:
```ts
import type { DramaLevel } from '@/shared/types/card';
import type { SessionPhase } from '@/shared/types/session';

export type DramaWeights = {
  light: number;
  medium: number;
  heavy: number;
};

export function getPhase(cardIndex: number, totalCards: number): SessionPhase {
  const openingEnd = Math.max(1, Math.floor(totalCards * 0.2));
  const endingStart = Math.max(openingEnd + 1, Math.floor(totalCards * 0.85));
  if (cardIndex < openingEnd) return 'opening';
  if (cardIndex < endingStart) return 'main';
  return 'ending';
}

export function getDramaWeights(phase: SessionPhase): DramaWeights {
  switch (phase) {
    case 'opening':
      return { light: 0.7, medium: 0.3, heavy: 0 };
    case 'main':
      return { light: 0.3, medium: 0.6, heavy: 0.1 };
    case 'ending':
      return { light: 0.1, medium: 0.4, heavy: 0.5 };
    case 'summary':
      return { light: 1, medium: 0, heavy: 0 };
  }
}

export function dramaWeightFor(level: DramaLevel, phase: SessionPhase): number {
  return getDramaWeights(phase)[level];
}
```

- [ ] **Step 2: 통과 확인**

Run: `npm test -- tests/engine/phaseEngine.test.ts`

Expected: `Tests: 5 passed`

- [ ] **Step 3: Commit**

```bash
git add src/features/session/engine/phaseEngine.ts tests/engine/phaseEngine.test.ts
git commit -m "feat(engine): add session phase pacing engine (TDD)"
```

---

## Task 9: Card Selector에 phase-aware weighting 추가

**Files:**
- Modify: `src/features/session/engine/cardSelector.ts`

- [ ] **Step 1: 기존 cardSelector에 phase 입력 추가**

Edit `src/features/session/engine/cardSelector.ts`:
```ts
import type { Card } from '@/shared/types/card';
import type { CharacterId } from '@/shared/types/character';
import type { SessionPhase } from '@/shared/types/session';
import type { DiceRoller } from '@/features/dice/roller';
import { dramaWeightFor } from './phaseEngine';

export type CardSelectionContext = {
  pool: Card[];
  party: CharacterId[];
  cardsPlayedIds: string[];
  cardIndex: number;
  roller: DiceRoller;
  sessionIndex?: number;
  phase?: SessionPhase;
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

function effectiveWeight(card: Card, ctx: CardSelectionContext): number {
  const phase = ctx.phase ?? 'main';
  const phaseMultiplier = dramaWeightFor(card.dramaLevel, phase);
  if (phaseMultiplier === 0) return 0.01; // near-zero but not excluded entirely
  return card.weight * (phaseMultiplier * 3);
}

function weightedPick(candidates: Card[], ctx: CardSelectionContext): Card {
  const weights = candidates.map(c => effectiveWeight(c, ctx));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const scaled = Math.max(1, Math.round(totalWeight * 100));
  const roll = ctx.roller.roll(scaled);
  let acc = 0;
  for (let i = 0; i < candidates.length; i++) {
    acc += Math.round(weights[i]! * 100);
    if (roll <= acc) return candidates[i]!;
  }
  return candidates[candidates.length - 1]!;
}

export function selectNextCard(ctx: CardSelectionContext): Card | null {
  const eligible = ctx.pool.filter(c => isEligible(c, ctx));
  if (eligible.length === 0) return null;
  return weightedPick(eligible, ctx);
}
```

- [ ] **Step 2: 기존 테스트 여전히 통과 확인**

Run: `npm test -- tests/engine/cardSelector.test.ts`

Expected: 5/5 통과 (phase 미지정 시 `main` 기본 동작).

- [ ] **Step 3: Commit**

```bash
git add src/features/session/engine/cardSelector.ts
git commit -m "feat(engine): make cardSelector phase-aware for drama level weighting"
```

---

## Task 10: Dice Resolver — 실패 테스트 작성

**Files:**
- Create: `tests/engine/diceResolver.test.ts`

- [ ] **Step 1: 테스트 작성**

Create `tests/engine/diceResolver.test.ts`:
```ts
import { resolveDiceChoice } from '@/features/session/engine/diceResolver';
import { createRoller } from '@/features/dice/roller';
import type { DiceChoice } from '@/shared/types/card';

const choice: DiceChoice = {
  direction: 'left',
  labelKo: '굴리기',
  labelEn: 'Roll',
  dice: {
    sides: 20,
    buckets: [
      { min: 1, max: 5, effects: [{ target: 'fighter', delta: -3 }] },
      { min: 6, max: 14, effects: [{ target: 'fighter', delta: -1 }] },
      { min: 15, max: 19, effects: [{ target: 'fighter', delta: 1 }] },
      { min: 20, max: 20, effects: [{ target: 'fighter', delta: 3 }] },
    ],
  },
};

describe('diceResolver', () => {
  it('returns bucket effects and raw roll', () => {
    const roller = createRoller(42);
    const result = resolveDiceChoice(choice, roller);
    expect(result.roll).toBeGreaterThanOrEqual(1);
    expect(result.roll).toBeLessThanOrEqual(20);
    expect(result.effects.length).toBeGreaterThan(0);
  });

  it('selects correct bucket when roll falls in range', () => {
    const rigged = { roll: () => 10 };
    const result = resolveDiceChoice(choice, rigged);
    expect(result.roll).toBe(10);
    expect(result.effects).toEqual([{ target: 'fighter', delta: -1 }]);
  });

  it('handles critical success (natural max)', () => {
    const rigged = { roll: () => 20 };
    const result = resolveDiceChoice(choice, rigged);
    expect(result.effects).toEqual([{ target: 'fighter', delta: 3 }]);
    expect(result.isCritical).toBe(true);
  });

  it('handles critical fail (natural 1)', () => {
    const rigged = { roll: () => 1 };
    const result = resolveDiceChoice(choice, rigged);
    expect(result.effects).toEqual([{ target: 'fighter', delta: -3 }]);
    expect(result.isCritFail).toBe(true);
  });

  it('falls through to last bucket when no match', () => {
    const gap: DiceChoice = {
      ...choice,
      dice: { sides: 20, buckets: [{ min: 1, max: 5, effects: [] }] },
    };
    const rigged = { roll: () => 15 };
    const result = resolveDiceChoice(gap, rigged);
    expect(result.effects).toEqual([]);
    expect(result.usedFallback).toBe(true);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- tests/engine/diceResolver.test.ts`

Expected: module not found — FAIL.

---

## Task 11: Dice Resolver — 구현

**Files:**
- Create: `src/features/session/engine/diceResolver.ts`

- [ ] **Step 1: 구현**

Create `src/features/session/engine/diceResolver.ts`:
```ts
import type { DiceChoice, SatisfactionEffect } from '@/shared/types/card';
import type { DiceRoller } from '@/features/dice/roller';

export type DiceResolution = {
  roll: number;
  effects: SatisfactionEffect[];
  isCritical: boolean;
  isCritFail: boolean;
  usedFallback: boolean;
  flavorKo?: string;
  flavorEn?: string;
};

export function resolveDiceChoice(choice: DiceChoice, roller: DiceRoller): DiceResolution {
  const roll = roller.roll(choice.dice.sides);
  const bucket = choice.dice.buckets.find(b => roll >= b.min && roll <= b.max);

  if (!bucket) {
    return {
      roll,
      effects: [],
      isCritical: false,
      isCritFail: false,
      usedFallback: true,
    };
  }

  return {
    roll,
    effects: bucket.effects,
    isCritical: roll === choice.dice.sides,
    isCritFail: roll === 1,
    usedFallback: false,
    flavorKo: bucket.flavorKo,
    flavorEn: bucket.flavorEn,
  };
}
```

- [ ] **Step 2: 통과 확인**

Run: `npm test -- tests/engine/diceResolver.test.ts`

Expected: `Tests: 5 passed`

- [ ] **Step 3: Commit**

```bash
git add src/features/session/engine/diceResolver.ts tests/engine/diceResolver.test.ts
git commit -m "feat(engine): add dice choice resolver (TDD)"
```

---

## Task 12: 엔딩 정의 시드

**Files:**
- Create: `src/content/endings.json`

- [ ] **Step 1: 엔딩 8종 정의**

Create `src/content/endings.json`:
```json
[
  {
    "id": "bad_phone_call",
    "kind": "bad",
    "nameKo": "전화 한 통",
    "nameEn": "Phone Call",
    "descriptionKo": "플레이어가 \"전화 한 통만\" 한다며 나가서 돌아오지 않았다.",
    "descriptionEn": "A player stepped out for \"just one call\" and never came back.",
    "trigger": { "type": "player_left" },
    "legendPoints": 10
  },
  {
    "id": "bad_snack_run",
    "kind": "bad",
    "nameKo": "과자 사러",
    "nameEn": "Snack Run",
    "descriptionKo": "플레이어가 간식을 사러 나간 뒤 귀가 핑계를 댔다.",
    "descriptionEn": "A player left for snacks and never quite made it back.",
    "trigger": { "type": "player_left" },
    "legendPoints": 10
  },
  {
    "id": "bad_rules_walkout",
    "kind": "bad",
    "nameKo": "룰 항의 이탈",
    "nameEn": "Rules Walkout",
    "descriptionKo": "룰 해석 논쟁 끝에 플레이어가 자리를 박차고 떠났다.",
    "descriptionEn": "A rules dispute escalated until the player walked out.",
    "trigger": { "type": "player_left" },
    "legendPoints": 10
  },
  {
    "id": "bad_spotlight_drain",
    "kind": "bad",
    "nameKo": "존재감 증발",
    "nameEn": "Spotlight Drain",
    "descriptionKo": "한 플레이어가 \"제가 왜 여기 있지\" 자책하며 떠났다.",
    "descriptionEn": "A player left muttering \"Why am I even here?\"",
    "trigger": { "type": "player_left" },
    "legendPoints": 10
  },
  {
    "id": "good_legendary",
    "kind": "legendary",
    "nameKo": "전설의 캠페인",
    "nameEn": "The Legendary Campaign",
    "descriptionKo": "네 명 모두가 오래도록 회자할 전설의 세션들을 만들었다.",
    "descriptionEn": "All four players left with stories they'll tell for years.",
    "trigger": { "type": "completion_all_high", "minAverage": 75, "maxGap": 15 },
    "legendPoints": 80
  },
  {
    "id": "good_fighter_glory",
    "kind": "good",
    "nameKo": "전사의 영광",
    "nameEn": "Fighter's Glory",
    "descriptionKo": "전사가 활약했고, 다른 셋은 그 결말에 만족했다.",
    "descriptionEn": "The Fighter shined. The others were content to witness.",
    "trigger": { "type": "completion_character_dominant", "character": "fighter", "minValue": 85, "maxOthers": 70 },
    "legendPoints": 30
  },
  {
    "id": "good_peaceful_table",
    "kind": "good",
    "nameKo": "평화로운 식탁",
    "nameEn": "Peaceful Table",
    "descriptionKo": "클레릭의 중재로 갈등 없는 조화로운 세션이었다.",
    "descriptionEn": "The Cleric's mediation kept conflicts at bay.",
    "trigger": { "type": "completion_character_dominant", "character": "cleric", "minValue": 85, "maxOthers": 70 },
    "legendPoints": 30
  },
  {
    "id": "good_decent",
    "kind": "good",
    "nameKo": "무난한 세션",
    "nameEn": "A Decent Session",
    "descriptionKo": "기억에 남진 않지만 나쁠 것도 없었다.",
    "descriptionEn": "Not memorable, but not bad either.",
    "trigger": { "type": "completion_default" },
    "legendPoints": 20
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add src/content/endings.json
git commit -m "feat(content): seed 8 endings (4 bad + 4 good including legendary)"
```

---

## Task 13: Ending Resolver — 실패 테스트

**Files:**
- Create: `tests/engine/endingResolver.test.ts`

- [ ] **Step 1: 테스트 작성**

Create `tests/engine/endingResolver.test.ts`:
```ts
import { resolveEnding } from '@/features/campaign/engine/endingResolver';
import type { Ending } from '@/shared/types/ending';
import type { CharacterId } from '@/shared/types/character';

const endings: Ending[] = [
  {
    id: 'bad_walkout',
    kind: 'bad',
    nameKo: '',
    nameEn: '',
    descriptionKo: '',
    descriptionEn: '',
    trigger: { type: 'player_left' },
    legendPoints: 10,
  },
  {
    id: 'legendary',
    kind: 'legendary',
    nameKo: '',
    nameEn: '',
    descriptionKo: '',
    descriptionEn: '',
    trigger: { type: 'completion_all_high', minAverage: 75, maxGap: 15 },
    legendPoints: 80,
  },
  {
    id: 'fighter_dom',
    kind: 'good',
    nameKo: '',
    nameEn: '',
    descriptionKo: '',
    descriptionEn: '',
    trigger: { type: 'completion_character_dominant', character: 'fighter', minValue: 85, maxOthers: 70 },
    legendPoints: 30,
  },
  {
    id: 'default',
    kind: 'good',
    nameKo: '',
    nameEn: '',
    descriptionKo: '',
    descriptionEn: '',
    trigger: { type: 'completion_default' },
    legendPoints: 20,
  },
];

const party: CharacterId[] = ['fighter', 'wizard', 'rogue', 'cleric'];

describe('endingResolver', () => {
  it('returns bad ending when a player left', () => {
    const result = resolveEnding(endings, {
      party,
      finalSatisfaction: { fighter: 0, wizard: 70, rogue: 60, cleric: 50 },
      playerLeft: 'fighter',
    });
    expect(result.id).toBe('bad_walkout');
  });

  it('returns legendary when all high and narrow gap', () => {
    const result = resolveEnding(endings, {
      party,
      finalSatisfaction: { fighter: 85, wizard: 80, rogue: 82, cleric: 78 },
      playerLeft: null,
    });
    expect(result.id).toBe('legendary');
  });

  it('returns character-dominant when one shines and others moderate', () => {
    const result = resolveEnding(endings, {
      party,
      finalSatisfaction: { fighter: 90, wizard: 60, rogue: 55, cleric: 65 },
      playerLeft: null,
    });
    expect(result.id).toBe('fighter_dom');
  });

  it('falls back to default when no specific rule matches', () => {
    const result = resolveEnding(endings, {
      party,
      finalSatisfaction: { fighter: 60, wizard: 55, rogue: 58, cleric: 52 },
      playerLeft: null,
    });
    expect(result.id).toBe('default');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- tests/engine/endingResolver.test.ts`

Expected: module not found — FAIL.

---

## Task 14: Ending Resolver — 구현

**Files:**
- Create: `src/features/campaign/engine/endingResolver.ts`

- [ ] **Step 1: 구현**

Create `src/features/campaign/engine/endingResolver.ts`:
```ts
import type { CharacterId } from '@/shared/types/character';
import type { Ending, EndingTriggerRule } from '@/shared/types/ending';

export type ResolveContext = {
  party: CharacterId[];
  finalSatisfaction: Record<CharacterId, number>;
  playerLeft: CharacterId | null;
};

function matchesRule(rule: EndingTriggerRule, ctx: ResolveContext): boolean {
  switch (rule.type) {
    case 'player_left':
      return ctx.playerLeft !== null;
    case 'completion_all_high': {
      if (ctx.playerLeft !== null) return false;
      const values = ctx.party.map(id => ctx.finalSatisfaction[id]);
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      const gap = Math.max(...values) - Math.min(...values);
      return avg >= rule.minAverage && gap <= rule.maxGap;
    }
    case 'completion_character_dominant': {
      if (ctx.playerLeft !== null) return false;
      if (!ctx.party.includes(rule.character)) return false;
      const own = ctx.finalSatisfaction[rule.character];
      const others = ctx.party.filter(id => id !== rule.character);
      const othersMax = Math.max(...others.map(id => ctx.finalSatisfaction[id]));
      return own >= rule.minValue && othersMax <= rule.maxOthers;
    }
    case 'completion_default':
      return ctx.playerLeft === null;
  }
}

const PRIORITY: Record<EndingTriggerRule['type'], number> = {
  player_left: 3,
  completion_all_high: 2,
  completion_character_dominant: 1,
  completion_default: 0,
};

export function resolveEnding(endings: Ending[], ctx: ResolveContext): Ending {
  const matched = endings.filter(e => matchesRule(e.trigger, ctx));
  if (matched.length === 0) {
    throw new Error('no matching ending — default should always match');
  }
  matched.sort((a, b) => PRIORITY[b.trigger.type] - PRIORITY[a.trigger.type]);
  return matched[0]!;
}
```

- [ ] **Step 2: 통과 확인**

Run: `npm test -- tests/engine/endingResolver.test.ts`

Expected: `Tests: 4 passed`

- [ ] **Step 3: Commit**

```bash
git add src/features/campaign/engine/endingResolver.ts tests/engine/endingResolver.test.ts
git commit -m "feat(engine): add ending resolver with priority-based rule matching (TDD)"
```

---

## Task 15: Progression Engine — 실패 테스트

**Files:**
- Create: `tests/engine/progressionEngine.test.ts`

- [ ] **Step 1: 테스트 작성**

Create `tests/engine/progressionEngine.test.ts`:
```ts
import {
  addXp,
  checkUnlocks,
  computeSessionXp,
} from '@/features/campaign/engine/progressionEngine';
import type { CharacterProgress } from '@/shared/types/progress';

const emptyProgress = (id: string): CharacterProgress => ({
  characterId: id as any,
  xp: 0,
  sessionCount: 0,
  unlockedMilestones: [],
});

describe('progressionEngine', () => {
  describe('computeSessionXp', () => {
    it('returns base + satisfaction bonus', () => {
      const xp = computeSessionXp({
        averageSatisfaction: 70,
        criticalCount: 0,
        rewardedAdWatched: false,
      });
      expect(xp).toBeGreaterThan(100);
    });

    it('doubles xp when rewarded ad watched', () => {
      const base = computeSessionXp({
        averageSatisfaction: 50,
        criticalCount: 0,
        rewardedAdWatched: false,
      });
      const boosted = computeSessionXp({
        averageSatisfaction: 50,
        criticalCount: 0,
        rewardedAdWatched: true,
      });
      expect(boosted).toBe(base * 2);
    });
  });

  describe('addXp', () => {
    it('increments xp and sessionCount', () => {
      const next = addXp(emptyProgress('fighter'), 100);
      expect(next.xp).toBe(100);
      expect(next.sessionCount).toBe(1);
    });

    it('unlocks milestone 500 at threshold', () => {
      const next = addXp(emptyProgress('fighter'), 500);
      expect(next.unlockedMilestones).toContain('xp_500');
    });

    it('does not duplicate already unlocked milestones', () => {
      const p: CharacterProgress = {
        ...emptyProgress('fighter'),
        xp: 500,
        unlockedMilestones: ['xp_500'],
      };
      const next = addXp(p, 100);
      const occurrences = next.unlockedMilestones.filter(m => m === 'xp_500').length;
      expect(occurrences).toBe(1);
    });

    it('unlocks multiple milestones when crossing several thresholds', () => {
      const next = addXp(emptyProgress('fighter'), 3500);
      expect(next.unlockedMilestones).toEqual(
        expect.arrayContaining(['xp_500', 'xp_1500', 'xp_3500']),
      );
    });
  });

  describe('checkUnlocks', () => {
    it('unlocks bard at 3 endings', () => {
      const unlocked = checkUnlocks({ collectedEndings: ['a', 'b', 'c'] });
      expect(unlocked).toContain('bard');
    });

    it('unlocks druid at 5 endings', () => {
      const unlocked = checkUnlocks({ collectedEndings: ['a', 'b', 'c', 'd', 'e'] });
      expect(unlocked).toContain('druid');
    });

    it('does not unlock druid before 5 endings', () => {
      const unlocked = checkUnlocks({ collectedEndings: ['a', 'b', 'c', 'd'] });
      expect(unlocked).not.toContain('druid');
    });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- tests/engine/progressionEngine.test.ts`

Expected: module not found — FAIL.

---

## Task 16: Progression Engine — 구현

**Files:**
- Create: `src/features/campaign/engine/progressionEngine.ts`

- [ ] **Step 1: 구현**

Create `src/features/campaign/engine/progressionEngine.ts`:
```ts
import type { CharacterId } from '@/shared/types/character';
import type {
  CharacterProgress,
  MilestoneId,
  PlayerProfile,
} from '@/shared/types/progress';
import { MILESTONE_THRESHOLDS } from '@/shared/types/progress';

export type SessionXpInput = {
  averageSatisfaction: number;
  criticalCount: number;
  rewardedAdWatched: boolean;
};

export function computeSessionXp(input: SessionXpInput): number {
  const base = 100;
  const satisfactionBonus = Math.max(0, Math.floor(input.averageSatisfaction / 2));
  const criticalBonus = input.criticalCount * 10;
  const raw = base + satisfactionBonus + criticalBonus;
  return input.rewardedAdWatched ? raw * 2 : raw;
}

export function addXp(current: CharacterProgress, delta: number): CharacterProgress {
  const newXp = current.xp + delta;
  const unlocked = new Set(current.unlockedMilestones);
  const milestoneIds = Object.keys(MILESTONE_THRESHOLDS) as MilestoneId[];
  for (const id of milestoneIds) {
    if (newXp >= MILESTONE_THRESHOLDS[id]) {
      unlocked.add(id);
    }
  }
  return {
    ...current,
    xp: newXp,
    sessionCount: current.sessionCount + 1,
    unlockedMilestones: Array.from(unlocked),
  };
}

export type UnlockContext = {
  collectedEndings: string[];
};

export function checkUnlocks(ctx: UnlockContext): CharacterId[] {
  const unlocked: CharacterId[] = [];
  if (ctx.collectedEndings.length >= 3) unlocked.push('bard');
  if (ctx.collectedEndings.length >= 5) unlocked.push('druid');
  return unlocked;
}

export function applySessionXpToParty(
  profile: PlayerProfile,
  party: CharacterId[],
  totalXp: number,
): PlayerProfile {
  const perPlayer = Math.floor(totalXp / party.length);
  const nextProgress = { ...profile.characterProgress };
  for (const id of party) {
    const current = nextProgress[id] ?? {
      characterId: id,
      xp: 0,
      sessionCount: 0,
      unlockedMilestones: [],
    };
    nextProgress[id] = addXp(current, perPlayer);
  }
  return { ...profile, characterProgress: nextProgress };
}
```

- [ ] **Step 2: 통과 확인**

Run: `npm test -- tests/engine/progressionEngine.test.ts`

Expected: `Tests: 8 passed`

- [ ] **Step 3: Commit**

```bash
git add src/features/campaign/engine/progressionEngine.ts tests/engine/progressionEngine.test.ts
git commit -m "feat(engine): add XP progression, milestones, and unlock logic (TDD)"
```

---

## Task 17: Campaign Store — 실패 테스트

**Files:**
- Create: `tests/stores/campaignStore.test.ts`

- [ ] **Step 1: 테스트 작성**

Create `tests/stores/campaignStore.test.ts`:
```ts
import { useCampaignStore } from '@/shared/stores/campaignStore';

describe('campaignStore', () => {
  beforeEach(() => {
    useCampaignStore.getState().reset();
  });

  it('starts with no active campaign', () => {
    expect(useCampaignStore.getState().campaign).toBeNull();
  });

  it('startCampaign creates campaign with chosen party', () => {
    useCampaignStore.getState().startCampaign(['fighter', 'wizard', 'rogue', 'cleric']);
    const campaign = useCampaignStore.getState().campaign!;
    expect(campaign.party).toHaveLength(4);
    expect(campaign.sessionIndex).toBe(1);
    expect(campaign.totalSessions).toBe(10);
    expect(campaign.dmScreen.retconUsed).toBe(false);
    expect(campaign.dmScreen.coolRulingRemaining).toBe(2);
    expect(campaign.currentSession).not.toBeNull();
  });

  it('useDmAction marks retcon as used', () => {
    useCampaignStore.getState().startCampaign(['fighter', 'wizard', 'rogue', 'cleric']);
    useCampaignStore.getState().useDmAction('retcon');
    expect(useCampaignStore.getState().campaign!.dmScreen.retconUsed).toBe(true);
  });

  it('useDmAction decrements coolRulingRemaining', () => {
    useCampaignStore.getState().startCampaign(['fighter', 'wizard', 'rogue', 'cleric']);
    useCampaignStore.getState().useDmAction('cool_ruling');
    expect(useCampaignStore.getState().campaign!.dmScreen.coolRulingRemaining).toBe(1);
  });

  it('rejects dm action when slot exhausted', () => {
    useCampaignStore.getState().startCampaign(['fighter', 'wizard', 'rogue', 'cleric']);
    useCampaignStore.getState().useDmAction('retcon');
    const ok = useCampaignStore.getState().useDmAction('retcon');
    expect(ok).toBe(false);
  });

  it('advanceToNextSession increments sessionIndex', () => {
    useCampaignStore.getState().startCampaign(['fighter', 'wizard', 'rogue', 'cleric']);
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
    useCampaignStore.getState().startCampaign(['fighter', 'wizard', 'rogue', 'cleric']);
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
    useCampaignStore.getState().startCampaign(['fighter', 'wizard', 'rogue', 'cleric']);
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
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- tests/stores/campaignStore.test.ts`

Expected: module not found — FAIL.

---

## Task 18: Campaign Store — 구현

**Files:**
- Create: `src/shared/stores/campaignStore.ts`
- Create: `src/shared/stores/profileStore.ts`

- [ ] **Step 1: Profile Store 선행 생성**

Create `src/shared/stores/profileStore.ts`:
```ts
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

  reset: () => set({ profile: initial }),
}));
```

- [ ] **Step 2: Campaign Store 구현**

Create `src/shared/stores/campaignStore.ts`:
```ts
import { create } from 'zustand';
import type { CharacterId } from '@/shared/types/character';
import type { Card } from '@/shared/types/card';
import type { SessionState } from '@/shared/types/session';
import type {
  CampaignState,
  DmAction,
  SessionResult,
} from '@/shared/types/campaign';
import type { Ending } from '@/shared/types/ending';
import { CAMPAIGN_TOTAL_SESSIONS, DEFAULT_DM_SCREEN } from '@/shared/types/campaign';
import { TOTAL_CARDS_PER_SESSION } from '@/shared/types/session';
import { selectNextCard } from '@/features/session/engine/cardSelector';
import { getPhase } from '@/features/session/engine/phaseEngine';
import { createRoller } from '@/features/dice/roller';
import { resolveEnding } from '@/features/campaign/engine/endingResolver';
import { useProfileStore } from './profileStore';
import charactersData from '@/content/characters.json';
import cardsData from '@/content/cards.json';
import endingsData from '@/content/endings.json';

const cards = cardsData as unknown as Card[];
const endings = endingsData as unknown as Ending[];

type SessionOutcome = {
  finalSatisfaction: Record<CharacterId, number>;
  cardsPlayed: number;
  diceRolls: number;
  sessionXp: number;
  playerLeft: CharacterId | null;
};

type CampaignStore = {
  campaign: CampaignState | null;
  startCampaign: (party: CharacterId[], seed?: number) => void;
  finishCurrentSession: (outcome: SessionOutcome) => void;
  advanceToNextSession: (seed?: number) => void;
  useDmAction: (action: DmAction) => boolean;
  reset: () => void;
};

function defaultSatisfactionFor(party: CharacterId[]): Record<CharacterId, number> {
  const map: Partial<Record<CharacterId, number>> = {};
  for (const id of party) {
    const entry = (charactersData as any[]).find(c => c.id === id);
    map[id] = entry?.defaultSatisfaction ?? 50;
  }
  return map as Record<CharacterId, number>;
}

function buildInitialSession(
  party: CharacterId[],
  sessionIndex: number,
  seed: number,
): SessionState {
  const roller = createRoller(seed);
  const satisfaction = defaultSatisfactionFor(party);
  const firstCard = selectNextCard({
    pool: cards,
    party,
    cardsPlayedIds: [],
    cardIndex: 0,
    roller,
    sessionIndex,
    phase: getPhase(0, TOTAL_CARDS_PER_SESSION),
  });
  return {
    sessionIndex,
    party,
    satisfaction,
    phase: 'opening',
    cardsPlayed: [],
    cardsRemaining: TOTAL_CARDS_PER_SESSION,
    currentCard: firstCard,
    isEnded: false,
    endReason: null,
  };
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaign: null,

  startCampaign: (party, seed) => {
    if (party.length !== 4) throw new Error('party must be exactly 4 members');
    if (new Set(party).size !== 4) throw new Error('party members must be unique');
    const id = `cp_${Date.now()}`;
    const finalSeed = seed ?? Date.now();
    set({
      campaign: {
        id,
        party,
        startedAt: Date.now(),
        sessionIndex: 1,
        totalSessions: CAMPAIGN_TOTAL_SESSIONS,
        sessionHistory: [],
        currentSession: buildInitialSession(party, 1, finalSeed),
        dmScreen: { ...DEFAULT_DM_SCREEN },
        isEnded: false,
        endingId: null,
      },
    });
  },

  finishCurrentSession: outcome => {
    const campaign = get().campaign;
    if (!campaign) return;
    const result: SessionResult = {
      sessionIndex: campaign.sessionIndex,
      finalSatisfaction: outcome.finalSatisfaction,
      cardsPlayed: outcome.cardsPlayed,
      diceRolls: outcome.diceRolls,
      sessionXp: outcome.sessionXp,
    };
    const nextHistory = [...campaign.sessionHistory, result];

    useProfileStore.getState().awardSessionXp(campaign.party, outcome.sessionXp);

    const isLastSession = campaign.sessionIndex >= campaign.totalSessions;
    const campaignEnds = outcome.playerLeft !== null || isLastSession;

    if (campaignEnds) {
      const latestSatisfaction = outcome.finalSatisfaction;
      const ending = resolveEnding(endings, {
        party: campaign.party,
        finalSatisfaction: latestSatisfaction,
        playerLeft: outcome.playerLeft,
      });
      useProfileStore.getState().awardEnding(ending.id, ending.legendPoints);
      set({
        campaign: {
          ...campaign,
          sessionHistory: nextHistory,
          currentSession: null,
          isEnded: true,
          endingId: ending.id,
        },
      });
      return;
    }

    set({
      campaign: {
        ...campaign,
        sessionHistory: nextHistory,
        currentSession: null,
      },
    });
  },

  advanceToNextSession: seed => {
    const campaign = get().campaign;
    if (!campaign || campaign.isEnded) return;
    const nextIndex = campaign.sessionIndex + 1;
    if (nextIndex > campaign.totalSessions) return;
    const nextSeed = seed ?? Date.now();
    set({
      campaign: {
        ...campaign,
        sessionIndex: nextIndex,
        currentSession: buildInitialSession(campaign.party, nextIndex, nextSeed),
      },
    });
  },

  useDmAction: action => {
    const campaign = get().campaign;
    if (!campaign) return false;
    const screen = campaign.dmScreen;
    if (action === 'retcon') {
      if (screen.retconUsed) return false;
      set({ campaign: { ...campaign, dmScreen: { ...screen, retconUsed: true } } });
      return true;
    }
    if (action === 'cool_ruling') {
      if (screen.coolRulingRemaining <= 0) return false;
      set({
        campaign: {
          ...campaign,
          dmScreen: { ...screen, coolRulingRemaining: screen.coolRulingRemaining - 1 },
        },
      });
      return true;
    }
    if (screen.npcCameoUsed) return false;
    set({ campaign: { ...campaign, dmScreen: { ...screen, npcCameoUsed: true } } });
    return true;
  },

  reset: () => set({ campaign: null }),
}));
```

- [ ] **Step 3: 통과 확인**

Run: `npm test -- tests/stores/campaignStore.test.ts`

Expected: `Tests: 8 passed`

- [ ] **Step 4: Commit**

```bash
git add src/shared/stores/campaignStore.ts src/shared/stores/profileStore.ts tests/stores/campaignStore.test.ts
git commit -m "feat(store): add campaign and profile stores with session lifecycle (TDD)"
```

---

## Task 19: GameStore를 CampaignStore 하위로 리팩토

**Files:**
- Modify: `src/shared/stores/gameStore.ts`
- Modify: `tests/stores/gameStore.test.ts`

- [ ] **Step 1: gameStore가 campaign의 currentSession을 읽도록 변경**

Edit `src/shared/stores/gameStore.ts` — `startSession`은 campaign이 없으면 혼자 캠페인 기본값으로 동작, campaign 있으면 그 세션 사용:

```ts
import { create } from 'zustand';
import type { Card, SwipeDirection } from '@/shared/types/card';
import { isDiceChoice } from '@/shared/types/card';
import type { CharacterId, PlayerCharacter } from '@/shared/types/character';
import type { PartySatisfaction, SessionState } from '@/shared/types/session';
import { TOTAL_CARDS_PER_SESSION } from '@/shared/types/session';
import { applyEffects } from '@/features/session/engine/satisfaction';
import { selectNextCard } from '@/features/session/engine/cardSelector';
import { getPhase } from '@/features/session/engine/phaseEngine';
import { resolveDiceChoice } from '@/features/session/engine/diceResolver';
import { computeSessionXp } from '@/features/campaign/engine/progressionEngine';
import { createRoller, type DiceRoller } from '@/features/dice/roller';
import { useCampaignStore } from './campaignStore';
import charactersData from '@/content/characters.json';
import cardsData from '@/content/cards.json';

const characters = charactersData as unknown as PlayerCharacter[];
const cards = cardsData as unknown as Card[];

type GameStore = {
  session: SessionState | null;
  roller: DiceRoller;
  diceRollCount: number;
  criticalCount: number;
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

function anyoneLeft(satisfaction: PartySatisfaction, party: CharacterId[]): CharacterId | null {
  for (const id of party) {
    if (satisfaction[id] <= 0) return id;
  }
  return null;
}

function finalizeSession(
  session: SessionState,
  diceRollCount: number,
  criticalCount: number,
  playerLeft: CharacterId | null,
): void {
  const values = session.party.map(id => session.satisfaction[id]);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const xp = computeSessionXp({
    averageSatisfaction: avg,
    criticalCount,
    rewardedAdWatched: false,
  });
  useCampaignStore.getState().finishCurrentSession({
    finalSatisfaction: session.satisfaction as Record<CharacterId, number>,
    cardsPlayed: session.cardsPlayed.length,
    diceRolls: diceRollCount,
    sessionXp: xp,
    playerLeft,
  });
}

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  roller: createRoller(Date.now()),
  diceRollCount: 0,
  criticalCount: 0,

  startSession: (seed?: number) => {
    const campaign = useCampaignStore.getState().campaign;
    const roller = createRoller(seed ?? Date.now());
    if (campaign && campaign.currentSession) {
      set({ roller, session: campaign.currentSession, diceRollCount: 0, criticalCount: 0 });
      return;
    }
    const party: CharacterId[] = ['fighter', 'wizard', 'rogue', 'cleric'];
    const satisfaction = initialSatisfaction(party);
    const firstCard = selectNextCard({
      pool: cards,
      party,
      cardsPlayedIds: [],
      cardIndex: 0,
      roller,
      sessionIndex: 1,
      phase: getPhase(0, TOTAL_CARDS_PER_SESSION),
    });
    set({
      roller,
      diceRollCount: 0,
      criticalCount: 0,
      session: {
        sessionIndex: 1,
        party,
        satisfaction,
        phase: 'opening',
        cardsPlayed: [],
        cardsRemaining: TOTAL_CARDS_PER_SESSION,
        currentCard: firstCard,
        isEnded: false,
        endReason: null,
      },
    });
  },

  applyChoice: (direction: SwipeDirection) => {
    const { session, roller, diceRollCount, criticalCount } = get();
    if (!session || !session.currentCard || session.isEnded) return;

    const choice = session.currentCard.choices.find(c => c.direction === direction);
    if (!choice) return;

    const before = session.satisfaction;
    let after: PartySatisfaction;
    let dRolls = diceRollCount;
    let cCount = criticalCount;

    if (isDiceChoice(choice)) {
      const resolution = resolveDiceChoice(choice, roller);
      dRolls += 1;
      if (resolution.isCritical) cCount += 1;
      after = applyEffects(before, resolution.effects, session.party);
    } else {
      after = applyEffects(before, choice.effects, session.party);
    }

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
    const playerLeft = anyoneLeft(after, session.party);

    if (playerLeft) {
      const endedSession: SessionState = {
        ...session,
        satisfaction: after,
        cardsPlayed,
        cardsRemaining,
        currentCard: null,
        isEnded: true,
        endReason: 'player_left',
      };
      set({ session: endedSession, diceRollCount: dRolls, criticalCount: cCount });
      finalizeSession(endedSession, dRolls, cCount, playerLeft);
      return;
    }

    if (cardsRemaining <= 0) {
      const endedSession: SessionState = {
        ...session,
        satisfaction: after,
        cardsPlayed,
        cardsRemaining: 0,
        currentCard: null,
        isEnded: true,
        endReason: 'cards_exhausted',
      };
      set({ session: endedSession, diceRollCount: dRolls, criticalCount: cCount });
      finalizeSession(endedSession, dRolls, cCount, null);
      return;
    }

    const nextCard = selectNextCard({
      pool: cards,
      party: session.party,
      cardsPlayedIds: cardsPlayed.map(p => p.cardId),
      cardIndex,
      roller,
      sessionIndex: session.sessionIndex,
      phase: getPhase(cardIndex, TOTAL_CARDS_PER_SESSION),
    });

    set({
      diceRollCount: dRolls,
      criticalCount: cCount,
      session: {
        ...session,
        phase: getPhase(cardIndex, TOTAL_CARDS_PER_SESSION),
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
    set({
      session: null,
      roller: createRoller(Date.now()),
      diceRollCount: 0,
      criticalCount: 0,
    });
  },
}));
```

- [ ] **Step 2: 기존 gameStore 테스트 갱신**

기존 5개 테스트는 campaignStore 없이 gameStore 단독으로 돌아가므로, `finishCurrentSession` 호출 시 campaign이 없으면 no-op이 되어 통과해야 함. 만약 실패하면 finalizeSession 내부에서 campaign null 체크 추가.

Edit `finalizeSession` 헬퍼 상단에 추가:
```ts
function finalizeSession(...) {
  if (!useCampaignStore.getState().campaign) return;
  // ... existing logic
}
```

Run: `npm test -- tests/stores/gameStore.test.ts`

Expected: 5/5 통과.

- [ ] **Step 3: Commit**

```bash
git add src/shared/stores/gameStore.ts
git commit -m "refactor(store): integrate gameStore with campaignStore and dice/phase engines"
```

---

## Task 20: 새 카드 25장 추가 (dice variant 포함)

**Files:**
- Modify: `src/content/cards.json`

- [ ] **Step 1: 카드 25장 append**

Edit `src/content/cards.json` — 기존 15장 뒤에 25장 추가. 다음을 포함:
- 주사위 롤 카드 5장 (다양한 bucket 구조)
- 바드 requires 카드 3장
- 드루이드 requires 카드 3장
- 이중 드라마레벨(heavy) 카드 4장
- 밈 카드(player_nonsense heavy 포함) 10장

**구체 카드 예시** (5장, 나머지 동일 패턴으로 연장):

```json
,
{
  "id": "ir_002_perception_dice",
  "category": "improv_ruling",
  "dramaLevel": "medium",
  "minSession": 1,
  "promptKo": "마법사가 은밀 판정을 굴렸다. 결과에 따라 적이 알아채거나 기습이 성공한다.",
  "promptEn": "The Wizard rolls Stealth. Outcome depends on the die.",
  "choices": [
    {
      "direction": "left",
      "labelKo": "🎲 판정하기",
      "labelEn": "🎲 Roll",
      "dice": {
        "sides": 20,
        "buckets": [
          { "min": 1, "max": 1,  "effects": [{ "target": "wizard", "delta": -4 }, { "target": "others", "delta": -1 }], "flavorKo": "자연의 1!" },
          { "min": 2, "max": 9,  "effects": [{ "target": "wizard", "delta": -2 }] },
          { "min": 10, "max": 19, "effects": [{ "target": "wizard", "delta": 1 }] },
          { "min": 20, "max": 20, "effects": [{ "target": "wizard", "delta": 4 }, { "target": "all", "delta": 1 }], "flavorKo": "자연의 20!" }
        ]
      }
    },
    {
      "direction": "right",
      "labelKo": "그냥 진행",
      "labelEn": "Auto-pass",
      "effects": [{ "target": "wizard", "delta": -1 }]
    }
  ],
  "weight": 5, "cooldown": 12, "tags": ["dice", "skill"]
},
{
  "id": "bd_001_bard_solo",
  "category": "spotlight",
  "dramaLevel": "medium",
  "minSession": 1,
  "promptKo": "바드: \"제가 NPC 앞에서 발라드를 한 곡 부르겠습니다.\"",
  "promptEn": "Bard: \"I'll serenade the NPC with a ballad.\"",
  "requiresCharacter": ["bard"],
  "choices": [
    { "direction": "left",  "labelKo": "공연 허용",   "labelEn": "Let them perform", "effects": [{ "target": "bard", "delta": 3 }, { "target": "cleric", "delta": 1 }] },
    { "direction": "right", "labelKo": "NPC 무시",    "labelEn": "NPC walks away",    "effects": [{ "target": "bard", "delta": -2 }] }
  ],
  "weight": 6, "cooldown": 8, "tags": ["bard", "roleplay"]
},
{
  "id": "dr_001_druid_pacifist",
  "category": "meta_break",
  "dramaLevel": "medium",
  "minSession": 1,
  "promptKo": "드루이드: \"잠시만요, 저 고블린은 가족이 있지 않을까요?\"",
  "promptEn": "Druid: \"Wait, doesn't that goblin have a family?\"",
  "requiresCharacter": ["druid"],
  "choices": [
    { "direction": "left",  "labelKo": "협상 시도",   "labelEn": "Negotiate",    "effects": [{ "target": "druid", "delta": 3 }, { "target": "cleric", "delta": 2 }, { "target": "fighter", "delta": -2 }] },
    { "direction": "right", "labelKo": "전투 강행",   "labelEn": "Fight anyway", "effects": [{ "target": "druid", "delta": -3 }, { "target": "fighter", "delta": 1 }] }
  ],
  "weight": 6, "cooldown": 8, "tags": ["druid", "pacifist"]
}
```

**구체 카드 수량**: light 8장, medium 12장, heavy 5장. 주사위 5장, 요구-캐릭터 6장, 일반 14장.

(전체 작성은 구현자의 판단에 맡기되, 최소 25장, 위 패턴 준수)

- [ ] **Step 2: Schema validity 체크**

Run: `npm test` — 기존 테스트가 cards 데이터로 스모크 체크하므로 JSON이 valid하면 통과.

Expected: 전체 suite 통과.

- [ ] **Step 3: Commit**

```bash
git add src/content/cards.json
git commit -m "feat(content): add 25 cards including dice rolls and character-gated scenes"
```

---

## Task 21: DiceRollOverlay 컴포넌트

**Files:**
- Create: `src/features/session/components/DiceRollOverlay.tsx`

- [ ] **Step 1: 구현**

Create `src/features/session/components/DiceRollOverlay.tsx`:
```tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import type { DiceResolution } from '@/features/session/engine/diceResolver';

type Props = {
  visible: boolean;
  resolution: DiceResolution | null;
  sides: number;
  onDone: () => void;
};

export function DiceRollOverlay({ visible, resolution, sides, onDone }: Props) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    scale.value = 0;
    rotate.value = 0;
    scale.value = withSequence(
      withTiming(1.2, { duration: 300 }),
      withTiming(1, { duration: 150 }),
    );
    rotate.value = withTiming(720, { duration: 450 });
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  if (!resolution) return null;

  const color = resolution.isCritical ? '#7c3' : resolution.isCritFail ? '#c33' : '#fff';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <Animated.View style={[styles.die, style, { borderColor: color }]}>
          <Text style={[styles.result, { color }]}>{resolution.roll}</Text>
        </Animated.View>
        <Text style={styles.label}>
          {resolution.isCritical ? '자연의 20!' : resolution.isCritFail ? '자연의 1!' : `d${sides}`}
        </Text>
        {resolution.flavorKo && <Text style={styles.flavor}>{resolution.flavorKo}</Text>}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  die: { width: 120, height: 120, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  result: { fontSize: 52, fontWeight: '700' },
  label: { color: '#aaa', fontSize: 14, marginTop: 16 },
  flavor: { color: '#ddd', fontSize: 12, marginTop: 8 },
});
```

- [ ] **Step 2: typecheck**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add src/features/session/components/DiceRollOverlay.tsx
git commit -m "feat(ui): add DiceRollOverlay with animated d20 presentation"
```

---

## Task 22: DmScreenPanel 컴포넌트

**Files:**
- Create: `src/features/session/components/DmScreenPanel.tsx`

- [ ] **Step 1: 구현**

Create `src/features/session/components/DmScreenPanel.tsx`:
```tsx
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import type { DmAction, DmScreenState } from '@/shared/types/campaign';

type Props = {
  state: DmScreenState;
  onAction: (action: DmAction) => void;
};

type SlotDef = {
  action: DmAction;
  labelKo: string;
  icon: string;
  description: string;
};

const SLOTS: SlotDef[] = [
  { action: 'retcon',      labelKo: '리트콘',       icon: '🌀', description: '방금 카드 취소하고 다시' },
  { action: 'cool_ruling', labelKo: 'Cool Ruling', icon: '🎭', description: '다음 카드 +2 보정' },
  { action: 'npc_cameo',   labelKo: 'NPC 카메오',  icon: '🧙', description: '특별 NPC 카드 삽입' },
];

function remaining(action: DmAction, state: DmScreenState): number {
  switch (action) {
    case 'retcon':      return state.retconUsed ? 0 : 1;
    case 'cool_ruling': return state.coolRulingRemaining;
    case 'npc_cameo':   return state.npcCameoUsed ? 0 : 1;
  }
}

export function DmScreenPanel({ state, onAction }: Props) {
  return (
    <View style={styles.row}>
      {SLOTS.map(slot => {
        const left = remaining(slot.action, state);
        const disabled = left <= 0;
        return (
          <Pressable
            key={slot.action}
            disabled={disabled}
            onPress={() => {
              Alert.alert(slot.labelKo, slot.description, [
                { text: '취소' },
                { text: '사용', onPress: () => onAction(slot.action) },
              ]);
            }}
            style={[styles.slot, disabled && styles.disabled]}
          >
            <Text style={styles.icon}>{slot.icon}</Text>
            <Text style={styles.label}>{slot.labelKo}</Text>
            <Text style={styles.count}>×{left}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  slot: { alignItems: 'center', padding: 8, minWidth: 80, backgroundColor: '#1a1a1a', borderRadius: 8 },
  disabled: { opacity: 0.35 },
  icon: { fontSize: 22 },
  label: { color: '#ddd', fontSize: 11, marginTop: 4 },
  count: { color: '#7c3', fontSize: 10, marginTop: 2 },
});
```

- [ ] **Step 2: typecheck**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add src/features/session/components/DmScreenPanel.tsx
git commit -m "feat(ui): add DmScreenPanel with 3 action slots"
```

---

## Task 23: 파티 편성 화면

**Files:**
- Create: `app/campaign/new.tsx`

- [ ] **Step 1: 구현**

Create `app/campaign/new.tsx`:
```tsx
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '@/shared/stores/profileStore';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import charactersData from '@/content/characters.json';
import type { CharacterId, PlayerCharacter } from '@/shared/types/character';

const all = charactersData as unknown as PlayerCharacter[];

export default function PartyFormation() {
  const unlocked = useProfileStore(s => s.profile.unlockedCharacters);
  const startCampaign = useCampaignStore(s => s.startCampaign);
  const [selected, setSelected] = useState<CharacterId[]>([]);

  const toggle = (id: CharacterId) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev,
    );
  };

  const ready = selected.length === 4;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>파티 편성</Text>
      <Text style={styles.subtitle}>4명 선택 ({selected.length}/4)</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {all.filter(c => unlocked.includes(c.id)).map(c => {
          const picked = selected.includes(c.id);
          return (
            <Pressable key={c.id} style={[styles.slot, picked && styles.picked]} onPress={() => toggle(c.id)}>
              <Text style={styles.name}>{c.nameKo}</Text>
              <Text style={styles.type}>{c.archetype}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable
        style={[styles.start, !ready && styles.disabled]}
        disabled={!ready}
        onPress={() => {
          startCampaign(selected);
          router.replace('/campaign/intro');
        }}
      >
        <Text style={styles.startText}>캠페인 시작</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 16 },
  title: { color: '#fff', fontSize: 22, marginBottom: 4, textAlign: 'center' },
  subtitle: { color: '#888', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  slot: { width: 140, height: 100, margin: 8, backgroundColor: '#1a1a1a', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2a2a2a' },
  picked: { borderColor: '#3c6', backgroundColor: '#222' },
  name: { color: '#fff', fontSize: 16 },
  type: { color: '#888', fontSize: 11, marginTop: 4 },
  start: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  disabled: { opacity: 0.4 },
  startText: { color: '#fff', fontSize: 16 },
});
```

- [ ] **Step 2: typecheck**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add app/campaign/new.tsx
git commit -m "feat(screen): add party formation screen"
```

---

## Task 24: 캠페인 인트로 화면

**Files:**
- Create: `app/campaign/intro.tsx`

- [ ] **Step 1: 구현**

Create `app/campaign/intro.tsx`:
```tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCampaignStore } from '@/shared/stores/campaignStore';

export default function CampaignIntro() {
  const campaign = useCampaignStore(s => s.campaign);
  if (!campaign) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.body}>캠페인이 시작되지 않았습니다.</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>홈으로</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>캠페인 #{campaign.id.slice(-4)}</Text>
      <Text style={styles.session}>세션 {campaign.sessionIndex} / {campaign.totalSessions}</Text>
      <Text style={styles.body}>
        테이블에 네 명의 플레이어가 앉았습니다.{'\n'}
        오늘의 세션을 시작합시다.
      </Text>
      <Pressable style={styles.button} onPress={() => router.replace('/session')}>
        <Text style={styles.buttonText}>세션 시작</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 22, marginBottom: 4 },
  session: { color: '#7c3', fontSize: 14, marginBottom: 24 },
  body: { color: '#ddd', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  button: { backgroundColor: '#3a3', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16 },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/campaign/intro.tsx
git commit -m "feat(screen): add campaign intro screen"
```

---

## Task 25: 세션 화면에 dice + DM screen 통합

**Files:**
- Modify: `app/session.tsx`

- [ ] **Step 1: DmScreenPanel + DiceRollOverlay 통합**

Edit `app/session.tsx` (완전 교체):

```tsx
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/shared/stores/gameStore';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import { CharacterFrame } from '@/features/session/components/CharacterFrame';
import { CardView } from '@/features/session/components/CardView';
import { SwipeableCard } from '@/features/session/components/SwipeableCard';
import { DmScreenPanel } from '@/features/session/components/DmScreenPanel';
import { DiceRollOverlay } from '@/features/session/components/DiceRollOverlay';
import { isDiceChoice } from '@/shared/types/card';
import { resolveDiceChoice, type DiceResolution } from '@/features/session/engine/diceResolver';
import charactersData from '@/content/characters.json';
import type { PlayerCharacter, CharacterId } from '@/shared/types/character';
import type { SwipeDirection } from '@/shared/types/card';

const characters = charactersData as unknown as PlayerCharacter[];

function nameOf(id: CharacterId): string {
  return characters.find(c => c.id === id)?.nameKo ?? id;
}

export default function SessionScreen() {
  const session = useGameStore(s => s.session);
  const roller = useGameStore(s => s.roller);
  const startSession = useGameStore(s => s.startSession);
  const applyChoice = useGameStore(s => s.applyChoice);
  const campaign = useCampaignStore(s => s.campaign);
  const useDmAction = useCampaignStore(s => s.useDmAction);

  const [diceVisible, setDiceVisible] = useState(false);
  const [resolution, setResolution] = useState<DiceResolution | null>(null);
  const pendingChoice = useRef<SwipeDirection | null>(null);

  useEffect(() => {
    if (!session) startSession();
  }, [session, startSession]);

  useEffect(() => {
    if (session?.isEnded) {
      const target = campaign?.isEnded ? '/campaign/ending' : '/session-summary';
      const t = setTimeout(() => router.replace(target as any), 400);
      return () => clearTimeout(t);
    }
  }, [session?.isEnded, campaign?.isEnded]);

  const handleSwipe = (direction: SwipeDirection) => {
    if (!session?.currentCard) return;
    const choice = session.currentCard.choices.find(c => c.direction === direction);
    if (!choice) return;
    if (isDiceChoice(choice)) {
      const res = resolveDiceChoice(choice, roller);
      setResolution(res);
      setDiceVisible(true);
      pendingChoice.current = direction;
    } else {
      applyChoice(direction);
    }
  };

  const handleDiceDone = () => {
    setDiceVisible(false);
    setResolution(null);
    if (pendingChoice.current) {
      applyChoice(pendingChoice.current);
      pendingChoice.current = null;
    }
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.info}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const [p1, p2, p3, p4] = session.party;
  const sessionLabel = campaign
    ? `Session ${campaign.sessionIndex}/${campaign.totalSessions} · ${session.phase}`
    : `Session 1 · ${session.phase}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{sessionLabel} · {session.cardsRemaining}장 남음</Text>
      </View>
      <View style={styles.partyGrid}>
        <View style={styles.partyRow}>
          <CharacterFrame characterId={p1!} name={nameOf(p1!)} satisfaction={session.satisfaction[p1!]} />
          <CharacterFrame characterId={p2!} name={nameOf(p2!)} satisfaction={session.satisfaction[p2!]} />
        </View>
        <View style={styles.partyRow}>
          <CharacterFrame characterId={p3!} name={nameOf(p3!)} satisfaction={session.satisfaction[p3!]} />
          <CharacterFrame characterId={p4!} name={nameOf(p4!)} satisfaction={session.satisfaction[p4!]} />
        </View>
      </View>
      {campaign && (
        <DmScreenPanel state={campaign.dmScreen} onAction={useDmAction} />
      )}
      <View style={styles.cardArea}>
        {session.currentCard && !session.isEnded ? (
          <SwipeableCard onSwipe={handleSwipe}>
            <CardView card={session.currentCard} />
          </SwipeableCard>
        ) : (
          <Text style={styles.info}>Session ending...</Text>
        )}
      </View>
      <Pressable style={styles.exit} onPress={() => router.replace('/')}>
        <Text style={styles.exitText}>중단하고 홈으로</Text>
      </Pressable>
      <DiceRollOverlay
        visible={diceVisible}
        resolution={resolution}
        sides={20}
        onDone={handleDiceDone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { paddingVertical: 8, alignItems: 'center' },
  headerText: { color: '#888', fontSize: 12 },
  partyGrid: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  partyRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 },
  cardArea: { flex: 1, justifyContent: 'center' },
  info: { color: '#fff', textAlign: 'center' },
  exit: { padding: 12, alignItems: 'center' },
  exitText: { color: '#666', fontSize: 12 },
});
```

- [ ] **Step 2: typecheck**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add app/session.tsx
git commit -m "feat(screen): integrate DmScreenPanel and DiceRollOverlay into session"
```

---

## Task 26: 세션 요약 → 다음 세션 흐름

**Files:**
- Modify: `app/session-summary.tsx`

- [ ] **Step 1: 구현 (campaign 기반 분기)**

Replace `app/session-summary.tsx`:
```tsx
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/shared/stores/gameStore';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import charactersData from '@/content/characters.json';
import type { PlayerCharacter, CharacterId } from '@/shared/types/character';

const characters = charactersData as unknown as PlayerCharacter[];
const nameOf = (id: CharacterId) => characters.find(c => c.id === id)?.nameKo ?? id;

export default function SessionSummary() {
  const session = useGameStore(s => s.session);
  const reset = useGameStore(s => s.reset);
  const campaign = useCampaignStore(s => s.campaign);
  const advanceToNextSession = useCampaignStore(s => s.advanceToNextSession);

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
    ? '플레이어가 떠났습니다'
    : '모든 카드 소진';

  const lastResult = campaign?.sessionHistory[campaign.sessionHistory.length - 1];
  const hasNextSession = campaign && !campaign.isEnded;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>세션 종료</Text>
        <Text style={styles.reason}>{reason}</Text>
        {lastResult && (
          <Text style={styles.xp}>+{lastResult.sessionXp} XP · 카드 {lastResult.cardsPlayed}장 · 주사위 {lastResult.diceRolls}회</Text>
        )}
        <Text style={styles.section}>최종 만족도</Text>
        {session.party.map(id => (
          <View key={id} style={styles.row}>
            <Text style={styles.name}>{nameOf(id)}</Text>
            <Text style={styles.value}>{session.satisfaction[id]}</Text>
          </View>
        ))}
        {hasNextSession ? (
          <Pressable
            style={styles.button}
            onPress={() => {
              advanceToNextSession();
              reset();
              router.replace('/campaign/intro');
            }}
          >
            <Text style={styles.buttonText}>다음 세션 ({campaign!.sessionIndex + 1}/{campaign!.totalSessions})</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.button}
            onPress={() => {
              reset();
              router.replace(campaign?.isEnded ? '/campaign/ending' : '/' as any);
            }}
          >
            <Text style={styles.buttonText}>{campaign?.isEnded ? '엔딩 보기' : '홈으로'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  content: { padding: 24 },
  title: { color: '#fff', fontSize: 24, marginBottom: 8, textAlign: 'center' },
  reason: { color: '#aaa', fontSize: 14, marginBottom: 8, textAlign: 'center' },
  xp: { color: '#7c3', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  section: { color: '#7c3', fontSize: 16, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  name: { color: '#ddd', fontSize: 14 },
  value: { color: '#ddd', fontSize: 14 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, marginTop: 32, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
```

- [ ] **Step 2: typecheck**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add app/session-summary.tsx
git commit -m "feat(screen): session summary with campaign-aware next-session flow"
```

---

## Task 27: 엔딩 화면

**Files:**
- Create: `app/campaign/ending.tsx`

- [ ] **Step 1: 구현**

Create `app/campaign/ending.tsx`:
```tsx
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import { useProfileStore } from '@/shared/stores/profileStore';
import endingsData from '@/content/endings.json';
import type { Ending } from '@/shared/types/ending';

const endings = endingsData as unknown as Ending[];

export default function EndingScreen() {
  const campaign = useCampaignStore(s => s.campaign);
  const resetCampaign = useCampaignStore(s => s.reset);
  const profile = useProfileStore(s => s.profile);

  const ending = campaign?.endingId ? endings.find(e => e.id === campaign.endingId) : null;

  if (!campaign || !ending) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>엔딩 데이터 없음</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>홈으로</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const kindColor = ending.kind === 'legendary' ? '#ffca28' : ending.kind === 'good' ? '#7c3' : '#c33';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.kind, { color: kindColor }]}>{ending.kind.toUpperCase()}</Text>
        <Text style={styles.name}>{ending.nameKo}</Text>
        <Text style={styles.description}>{ending.descriptionKo}</Text>
        <Text style={styles.reward}>+{ending.legendPoints} 레전드 포인트</Text>
        <Text style={styles.stats}>총 레전드: {profile.legendPoints}</Text>
        <Text style={styles.stats}>엔딩 수집: {profile.collectedEndings.length}</Text>
        <Text style={styles.stats}>해금 캐릭터: {profile.unlockedCharacters.join(', ')}</Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            resetCampaign();
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
  kind: { fontSize: 12, letterSpacing: 2, textAlign: 'center', marginTop: 24 },
  name: { color: '#fff', fontSize: 28, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  description: { color: '#ddd', fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 32 },
  reward: { color: '#ffca28', fontSize: 18, textAlign: 'center', marginBottom: 24 },
  stats: { color: '#888', fontSize: 13, textAlign: 'center', marginVertical: 2 },
  title: { color: '#fff', fontSize: 20, textAlign: 'center', marginTop: 64 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, marginTop: 32, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/campaign/ending.tsx
git commit -m "feat(screen): add campaign ending screen with ending reveal and stats"
```

---

## Task 28: 컬렉션 화면

**Files:**
- Create: `app/collection/characters.tsx`
- Create: `app/collection/endings.tsx`
- Create: `app/collection/_layout.tsx`

- [ ] **Step 1: 레이아웃**

Create `app/collection/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';

export default function CollectionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111' } }}>
      <Stack.Screen name="characters" />
      <Stack.Screen name="endings" />
    </Stack>
  );
}
```

- [ ] **Step 2: 캐릭터 도감**

Create `app/collection/characters.tsx`:
```tsx
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '@/shared/stores/profileStore';
import charactersData from '@/content/characters.json';
import type { PlayerCharacter } from '@/shared/types/character';
import { MILESTONE_THRESHOLDS } from '@/shared/types/progress';

const characters = charactersData as unknown as PlayerCharacter[];

export default function Characters() {
  const profile = useProfileStore(s => s.profile);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>캐릭터 도감</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {characters.map(c => {
          const unlocked = profile.unlockedCharacters.includes(c.id);
          const progress = profile.characterProgress[c.id];
          const xp = progress?.xp ?? 0;
          const nextMilestone = Object.entries(MILESTONE_THRESHOLDS).find(([, v]) => xp < v);
          return (
            <View key={c.id} style={[styles.row, !unlocked && styles.locked]}>
              <Text style={styles.name}>{unlocked ? c.nameKo : '???'}</Text>
              <Text style={styles.info}>
                {unlocked ? `XP ${xp}${nextMilestone ? ` / ${nextMilestone[1]}` : ' · 최대'}` : '미해금'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <Pressable style={styles.button} onPress={() => router.replace('/')}>
        <Text style={styles.buttonText}>홈으로</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 16 },
  title: { color: '#fff', fontSize: 22, textAlign: 'center', marginBottom: 16 },
  list: { paddingVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  locked: { opacity: 0.35 },
  name: { color: '#fff', fontSize: 16 },
  info: { color: '#888', fontSize: 13 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
```

- [ ] **Step 3: 엔딩 도감**

Create `app/collection/endings.tsx`:
```tsx
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '@/shared/stores/profileStore';
import endingsData from '@/content/endings.json';
import type { Ending } from '@/shared/types/ending';

const endings = endingsData as unknown as Ending[];

export default function Endings() {
  const profile = useProfileStore(s => s.profile);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>엔딩 도감 ({profile.collectedEndings.length}/{endings.length})</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {endings.map(e => {
          const got = profile.collectedEndings.includes(e.id);
          return (
            <View key={e.id} style={[styles.row, !got && styles.locked]}>
              <Text style={[styles.kind, { color: e.kind === 'legendary' ? '#ffca28' : e.kind === 'good' ? '#7c3' : '#c33' }]}>
                {e.kind}
              </Text>
              <Text style={styles.name}>{got ? e.nameKo : '???'}</Text>
              {got && <Text style={styles.desc}>{e.descriptionKo}</Text>}
            </View>
          );
        })}
      </ScrollView>
      <Pressable style={styles.button} onPress={() => router.replace('/')}>
        <Text style={styles.buttonText}>홈으로</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 16 },
  title: { color: '#fff', fontSize: 20, textAlign: 'center', marginBottom: 16 },
  list: { paddingVertical: 8 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  locked: { opacity: 0.35 },
  kind: { fontSize: 10, letterSpacing: 1 },
  name: { color: '#fff', fontSize: 16, marginTop: 2 },
  desc: { color: '#aaa', fontSize: 12, marginTop: 4 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
```

- [ ] **Step 4: Commit**

```bash
git add app/collection
git commit -m "feat(screen): add character and ending collection screens"
```

---

## Task 29: 홈 화면에 신규 메뉴 추가 + 라우터 업데이트

**Files:**
- Modify: `app/index.tsx`
- Modify: `app/_layout.tsx`
- Create: `app/campaign/_layout.tsx`

- [ ] **Step 1: 캠페인 하위 레이아웃**

Create `app/campaign/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';

export default function CampaignLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111' } }}>
      <Stack.Screen name="new" />
      <Stack.Screen name="intro" />
      <Stack.Screen name="ending" />
    </Stack>
  );
}
```

- [ ] **Step 2: 루트 레이아웃에 screen 등록**

Edit `app/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="session" />
      <Stack.Screen name="session-summary" />
      <Stack.Screen name="campaign" />
      <Stack.Screen name="collection" />
    </Stack>
  );
}
```

- [ ] **Step 3: 홈 화면 업데이트**

Edit `app/index.tsx`:
```tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import { useProfileStore } from '@/shared/stores/profileStore';

export default function Home() {
  const campaign = useCampaignStore(s => s.campaign);
  const profile = useProfileStore(s => s.profile);
  const hasActive = campaign && !campaign.isEnded;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>DM Dilemma</Text>
        <Text style={styles.subtitle}>Prototype · Plan 2</Text>
        {hasActive && (
          <Pressable style={styles.button} onPress={() => router.push('/session')}>
            <Text style={styles.buttonText}>이어하기 (세션 {campaign!.sessionIndex})</Text>
          </Pressable>
        )}
        <Pressable style={styles.button} onPress={() => router.push('/campaign/new')}>
          <Text style={styles.buttonText}>새 캠페인</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => router.push('/collection/characters')}>
          <Text style={styles.secondaryText}>캐릭터 도감</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => router.push('/collection/endings')}>
          <Text style={styles.secondaryText}>엔딩 도감</Text>
        </Pressable>
        <Text style={styles.stats}>레전드: {profile.legendPoints} · 엔딩: {profile.collectedEndings.length}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 32 },
  button: { backgroundColor: '#3a3', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, marginVertical: 6, width: 240, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
  secondary: { paddingVertical: 12, marginVertical: 4 },
  secondaryText: { color: '#aaa', fontSize: 14 },
  stats: { color: '#666', fontSize: 12, marginTop: 24 },
});
```

- [ ] **Step 4: typecheck + test**

Run: `npm run typecheck && npm test`

Expected: 타입 에러 0, 테스트 전체 통과.

- [ ] **Step 5: Commit**

```bash
git add app/index.tsx app/_layout.tsx app/campaign/_layout.tsx
git commit -m "feat(screen): update home with campaign + collection menu, wire routes"
```

---

## Task 30: 전체 스위트 최종 검증

**Files:** (검증만)

- [ ] **Step 1: 전체 테스트**

Run: `npm test`

Expected: 9 test suites 통과 (sanity, satisfaction, dice, cardSelector, gameStore, phaseEngine, diceResolver, endingResolver, progressionEngine, campaignStore) — 약 42개 tests.

- [ ] **Step 2: TypeScript 전체 검증**

Run: `npm run typecheck`

Expected: 에러 0.

- [ ] **Step 3: 커밋 없이 검증만, 이상 시 해당 Task로 돌아가 수정**

---

## Task 31: Android 실기기 스모크 테스트

**Files:** (사용자 검증)

- [ ] **Step 1: Metro 실행**

Run: `npx expo start --android`

- [ ] **Step 2: 풀 플로우 체크**

1. 홈 → "새 캠페인" 탭
2. 파티 편성: 4명 선택(중복 불가 확인)
3. "캠페인 시작" 탭 → 캠페인 인트로 화면
4. "세션 시작" 탭 → 세션 화면 (헤더에 "Session 1/10 · opening · 20장 남음" 표시)
5. 상단 DM 스크린 3개 아이콘 렌더링 확인
6. 카드 스와이프 테스트 (일반 선택지)
7. 주사위 카드 도달 → 스와이프 → DiceRollOverlay 표시 → 결과 반영 확인
8. DM 스크린 하나 탭 → 모달 확인 → 사용 시 슬롯 비활성화
9. 세션 완주 → Session Summary 화면 → XP 획득 표시
10. "다음 세션" 탭 → 세션 2 진입 (페이즈 재시작, 만족도 초기화)
11. 10세션 완주 (또는 만족도 0 만들기로 단축) → 엔딩 화면
12. 엔딩 종류·보상 확인
13. 홈 → 엔딩 도감에서 획득 엔딩 확인
14. 엔딩 3종 달성 시 바드 해금 확인 (파티 편성 재진입)

- [ ] **Step 3: 문제점 기록 후 필요 시 수정 Task 추가**

---

## Self-Review Checklist (플랜 실행 전 확인)

- [ ] 모든 스텝 체크박스 완료
- [ ] `npm test` 전체 통과 (약 42 tests)
- [ ] `npm run typecheck` 에러 0
- [ ] Android 실기기에서 캠페인 1회 완주 가능
- [ ] 주사위 롤 애니메이션·효과 정상 작동
- [ ] DM 스크린 3 슬롯 사용·소진 로직 정상
- [ ] 엔딩 판정이 스탯 조합에 따라 다름
- [ ] 해금 로직(3엔딩 = 바드, 5엔딩 = 드루이드) 동작
- [ ] 컬렉션 화면에 XP·엔딩 기록 반영

### 다음 플랜 예고

**Plan 3 (Supabase + i18n)**에서 다룰 항목:
- Supabase 프로젝트 세팅 및 스키마 마이그레이션
- 익명 인증 + 구글 계정 연결
- 카드·캐릭터·엔딩 로컬 번들 → 원격 fetch + 캐시
- 클라우드 세이브 (`campaigns`, `profiles`, `character_progress`)
- i18next 통합으로 한/영 런타임 스위치
- 카드·엔딩 i18n 리소스 분리
- 오프라인 fallback 전략
