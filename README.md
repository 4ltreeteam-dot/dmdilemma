# DM Dilemma

> 던전 마스터의 고충 — Reigns-like D&D Dungeon Master card swipe simulator.

당신은 4명의 괴짜 플레이어가 앉은 테이블의 던전 마스터다.
카드를 좌우로 스와이프하여 세션을 운영하라.
룰 변호사는 엄정한 판정을, 뒷좌석 DM은 주도권을, 에지로드는 스포트라이트를 요구한다.
모두를 동시에 만족시킬 수는 없다.

## Status

**Plan 2 (Full Game Loop) — 코드 완성, Android 스모크 테스트 대기**

- ✅ Plan 1: Core Loop Prototype
- ✅ 캠페인 구조 (10세션) + 세션 3단계 페이스 (opening/main/ending)
- ✅ 주사위 롤 선택지 (d20 bucket, 크리/펌블 연출)
- ✅ DM Screen 3슬롯 (Retcon / Cool Ruling / NPC Cameo)
- ✅ 엔딩 판정 (배드 4 + 굿 4) + 우선순위 매칭
- ✅ 캐릭터 XP·마일스톤·해금 (바드 3엔딩, 드루이드 5엔딩)
- ✅ 파티 편성 / 캠페인 인트로 / 엔딩 / 컬렉션 화면
- ✅ 12장 신규 카드 (주사위·바드·드루이드·heavy)
- ⏳ Android 실기기/에뮬레이터 스모크 테스트 (수동 검증 필요)

**Tests**: 10 suites / 52 tests · TypeScript strict pass.

## Stack

- **Runtime**: Expo SDK 52, React Native 0.76, Expo Router
- **Language**: TypeScript (strict, noUncheckedIndexedAccess)
- **State**: Zustand (gameStore + campaignStore + profileStore)
- **Animation**: React Native Reanimated 3 + Gesture Handler
- **Test**: Jest (`jest-expo` preset) + `@testing-library/react-native`

## Package

- **Display name**: DM Dilemma
- **Slug**: `dm-dilemma`
- **Android package**: `com.dmdilemma.app`

## Getting Started

```bash
# 1. Install deps (use --legacy-peer-deps due to @testing-library vs react 18)
npm install --legacy-peer-deps

# 2. Start Metro bundler
npm run android         # open in Android emulator / attached device
# or
npm start               # print QR code; scan with Expo Go app

# 3. Run tests
npm test                # 52 tests across 10 suites
npm run typecheck       # tsc --noEmit
```

## Project Layout

```
app/                              Expo Router screens
  index.tsx                       Home (start campaign / collection / ledger)
  session.tsx                     Active session (table + card + DM screen + dice)
  session-summary.tsx             End-of-session result + next session
  campaign/
    new.tsx                       Party formation (4-pick from unlocked)
    intro.tsx                     Campaign intro before each session
    ending.tsx                    Campaign ending reveal + rewards
  collection/
    characters.tsx                Character roster + XP / milestones
    endings.tsx                   Ending dex (8 endings)
src/
  features/
    session/
      engine/                     Pure game logic
        satisfaction.ts           applyEffects + clampSatisfaction
        cardSelector.ts           phase-aware weighted random
        phaseEngine.ts            opening/main/ending pacing
        diceResolver.ts           dice choice resolution
      components/                 SatisfactionBar, CharacterFrame, CardView,
                                  SwipeableCard, DmScreenPanel, DiceRollOverlay
    campaign/
      engine/
        endingResolver.ts         priority-based ending matching
        progressionEngine.ts      XP, milestones, unlocks
    dice/
      roller.ts                   Seedable mulberry32 PRNG
  shared/
    types/                        Card, PlayerCharacter, SessionState,
                                  CampaignState, Ending, CharacterProgress
    stores/                       gameStore, campaignStore, profileStore
  content/                        characters.json, cards.json, endings.json
                                  (replaced by Supabase in Plan 3)
tests/
  engine/                         5 engine test suites
  stores/                         2 store test suites
docs/superpowers/
  specs/                          Design docs
  plans/                          Implementation plans
```

## What's Next

- **Plan 3**: Supabase + i18n (cloud save, KO/EN runtime switch)
- **Plan 4**: Content production (365 cards + pixel art)
- **Plan 5**: Monetization + analytics + OTA
- **Plan 6**: QA + release to Google Play

See `docs/superpowers/specs/2026-04-22-dm-simulator-design.md` for full game design.
