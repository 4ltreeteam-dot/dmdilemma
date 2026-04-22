# DM Dilemma

> 던전 마스터의 고충 — Reigns-like D&D Dungeon Master card swipe simulator.

당신은 4명의 괴짜 플레이어가 앉은 테이블의 던전 마스터다.
카드를 좌우로 스와이프하여 세션을 운영하라.
룰 변호사는 엄정한 판정을, 뒷좌석 DM은 주도권을, 에지로드는 스포트라이트를 요구한다.
모두를 동시에 만족시킬 수는 없다.

## Status

**Plan 1 (Core Loop Prototype) — 코드 완성, Android 스모크 테스트 대기**

- ✅ Expo SDK 52 + React Native 0.76 스캐폴드
- ✅ 게임 로직 (만족도·주사위·카드 선별·세션 상태) TDD 구현
- ✅ 카드 스와이프 UI + 4명 캐릭터 만족도 프레임
- ✅ 세션 플레이 + 요약 화면
- ⏳ Android 실기기/에뮬레이터 스모크 테스트 (수동 검증 필요)

## Stack

- **Runtime**: Expo SDK 52, React Native 0.76, Expo Router
- **Language**: TypeScript (strict, noUncheckedIndexedAccess)
- **State**: Zustand
- **Animation / Gesture**: React Native Reanimated 3 + Gesture Handler
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
npm test                # 21 tests across 5 suites
npm run typecheck       # tsc --noEmit
```

## Project Layout

```
app/                         Expo Router screens
  _layout.tsx                Stack navigator
  index.tsx                  Home
  session.tsx                Main play screen (table-top view)
  session-summary.tsx        End-of-session result
src/
  features/
    session/
      engine/                Pure game logic (satisfaction, cardSelector)
      components/            SatisfactionBar, CharacterFrame, CardView, SwipeableCard
    dice/                    Seedable d-sided roller
  shared/
    types/                   Card, PlayerCharacter, SessionState
    stores/                  Zustand game store
  content/                   Seed JSON (characters, cards) — replaced by Supabase in Plan 3
tests/
  engine/                    Pure function tests
  stores/                    Store behavior tests
docs/superpowers/
  specs/                     Design docs
  plans/                     Implementation plans per phase
```

## What's Next

See `docs/superpowers/plans/` for subsequent plans:
- **Plan 2**: Full game loop (campaigns, endings, dice UI, DM screen)
- **Plan 3**: Supabase + i18n (cloud save, KO/EN runtime switch)
- **Plan 4**: Content production (365 cards + 42 pixel sprites)
- **Plan 5**: Monetization + analytics + OTA
- **Plan 6**: QA + release to Google Play

See `docs/superpowers/specs/2026-04-22-dm-simulator-design.md` for full game design.
