# DM Simulator — 디자인 문서 (MVP)

- **가제**: Roll for Initiative (EN) / 이니셔티브 굴려! (KO)
- **작성일**: 2026-04-22
- **상태**: 브레인스토밍 완료, 구현 계획 수립 단계 직전
- **플랫폼**: Android (Google Play) 단독 런칭, iOS는 포스트 MVP
- **언어**: 한국어 + 영어 동시 런칭

---

## 1. 엘리베이터 피치

> 당신은 4명의 괴짜 플레이어가 앉은 테이블의 던전 마스터다.
> 카드를 좌우로 스와이프하여 세션을 운영하라.
> 룰 변호사는 엄정한 판정을, 뒷좌석 DM은 주도권을, 에지로드는 스포트라이트를 요구한다.
> 모두를 동시에 만족시킬 수는 없다.

TRPG 문화의 "DM의 고충"을 게임화한 카드 스와이프 시뮬레이션. 메타 코미디 톤, 16-bit 픽셀 아트, 광고 기반 수익.

---

## 2. 전체 결정사항 요약

| 영역 | 결정 |
|---|---|
| 장르 | Reigns-like 카드 스와이프 시뮬레이션 |
| 세계관 | D&D 판타지 |
| 플레이어 역할 | 던전 마스터 (DM) |
| 시간 스케일 | 하이브리드 (세션 + 캠페인 메타) |
| 스탯 시스템 | 플레이어 4명 개별 만족도 (테이블의 친구들) |
| 톤 | 메타 코미디 (TRPG 밈 중심) |
| 종료 구조 | 하이브리드 (즉사 배드 엔딩 + 완주 굿 엔딩) |
| 메타 진행 | 캐릭터 로스터 해금 + 캐릭터별 경량 성장 |
| 엔진 | React Native + Expo |
| 서버 | Supabase (인증 + 원격 콘텐츠 + 통계 + A/B) |
| 광고 | 테마 래핑 리워드 중심 + 캠페인 종료 전면광고 1회 |
| 아트 | 16-bit 픽셀 아트 |
| MVP 범위 | 6 캐릭터, 365 카드, 10-12 엔딩 |
| 런칭 언어 | 한국어 + 영어 (i18n 1일차부터) |
| 인증 | Supabase 익명 기본 + 구글 계정 연결 옵션 |
| 플랫폼 | Android 우선, iOS 6개월+ 후 |
| 파티 구성 | 4명 고정, 중복 불가 (MVP) |
| 성장 시스템 | 도감 + 경량 성장 (능력치·장비 없음) |

---

## 3. 게임 디자인

### 3.1 코어 루프 (3계층)

```
[ 1. 카드 루프 (10-30초) ]
 ├─ 카드 제시 (상황/NPC/플레이어 발언)
 ├─ 좌/우 스와이프 (2택) — 일부 카드는 상/하 포함 (4택)
 ├─ 각 선택지는 4명 만족도에 ±1~±3 영향
 └─ 즉각 피드백: 캐릭터 표정 변화 + 짧은 반응 텍스트

[ 2. 세션 루프 (10-15분) ]
 ├─ 세션 테마 선택 (던전/도시/황야/보스전/롤플레이)
 ├─ 20-30 카드 소화 (오프닝/본편/엔딩 3단계)
 ├─ 세션 종료 조건: 카드 소진 OR 누군가 만족도 0
 ├─ 세션 결과 정산: 세션 XP + 캠페인 스탯 갱신
 └─ 세션 사이 광고 브레이크 — 리워드 광고 옵션 제시

[ 3. 캠페인 루프 (2-4시간, 5-10세션) ]
 ├─ 파티 구성 (해금된 캐릭터 중 4명 선택, 중복 불가)
 ├─ 캠페인 시나리오 선택 (MVP: 1종, 기본 판타지)
 ├─ 5-10 세션 진행
 ├─ 종료 조건:
 │    ├─ 즉사: 세션 중 한 플레이어 만족도 0 → 배드 엔딩
 │    └─ 완주: 10세션 완료 → 스탯 조합별 엔딩
 └─ 엔딩 정산: 도감 수록 + 레전드 포인트 → 캐릭터 해금
```

### 3.2 세션 3단계 구조

```
[오프닝 페이즈] (4-6 카드, 가벼움 위주)
   "오늘의 세션이 시작됩니다. 플레이어들이 자리에 앉는다."
   ↓
[본편 페이즈] (10-15 카드, medium/heavy)
   주사위 롤 · 주요 갈등 · 스포트라이트 분배
   ↓
[엔딩 페이즈] (3-5 카드, 정산)
   "모두 수고하셨습니다. 다음 주에 이어서..."
   ↓
세션 정산 화면 → 광고 슬롯 → 다음 세션 or 캠페인 엔딩
```

### 3.3 Reigns 대비 차별화 요소

의도적으로 카피 인상을 회피하기 위한 4축 차별화:

| 축 | Reigns | 이 게임 |
|---|---|---|
| UI 레이아웃 | 카드 중앙 + 스탯 상단 | 4명 둘러앉은 탑다운 테이블 |
| 선택 메커닉 | 좌/우 2택 (결정적) | 2-4택 + 주사위 롤 (확률적) |
| 특수 액션 | 없음 | DM 스크린 3종 슬롯 |
| 시간 구조 | 무한 연속 | 세션 3단계 + 캠페인 10세션 |
| 아트 | 플랫 벡터 (2-3색) | 16-bit 픽셀 |
| 스탯 | 4개 추상 수치 | 4명 개인 감정 |
| 테마 | 중세 왕정 | TRPG 메타 코미디 |

### 3.4 주사위 시스템

일부 카드는 "판정(Roll)" 선택지 포함:

```
[선택지 A] 룰대로 판정 (결정적) — 전사 −2
[선택지 B] 🎲 주사위 굴리기 (d20) — 결과에 따라
           1-5:   전사 −3, 나머지 −1  (대실패)
           6-14:  전사 −1             (평범)
           15-19: 전사 +1, 마법사 +1   (잘 풀림)
           20:    전사 +3, 모두 +1    (대성공, 특수 카드 트리거)
```

- 터치 & 홀드 후 던지기 제스처로 주사위 롤
- d20, d12, d6, d4 등 다양한 주사위 지원
- 크리티컬(1/20) 시 화면 쉐이크 + 특수 연출
- RNG는 seedable (디버그/QA용)

### 3.5 DM 스크린 (캠페인당 제한 특수 액션)

캠페인 시작 시 DM 스크린에 3개 슬롯:
- **Retcon (리트콘)**: 방금 카드를 취소, 다시 뽑기 (1캠페인 1회)
- **Cool Ruling**: 다음 카드의 만족도 변동을 +2 보정 (한 방향) (1캠페인 2회)
- **NPC Cameo**: 다음 카드 대신 특별 NPC 카드 삽입 (1캠페인 1회)

리워드 광고로 추가 사용 획득 가능 → 전략적 깊이 + 광고 삽입 지점.

### 3.6 카드 예시 (톤 확인용)

**카드 #1 — 룰 해석 딜레마**
> 전사: "제 캐릭터는 드워프라 암시야(Darkvision)가 있잖아요. 그럼 이 방에서 다 보이는 거죠?"
> 마법사: "잠깐만요. 암시야는 60피트까지고, 흑백으로만 보여요. 이 방은 80피트인데요."

- ⬅️ **룰대로 (RAW)**: 전사 −2, 마법사 +3 *"드디어 제 지식이!"*
- ➡️ **모두 다 보이게 (Rule of Cool)**: 전사 +2, 마법사 −3 *"그럼 룰북이 왜 있어요?"*

**카드 #2 — 에지로드의 고백**
> 도적 플레이어: "제 캐릭터는 사실 고아였고, 마피아의 조카이고, 예언의 아이입니다. 지금 공개해도 될까요?"

- ⬅️ **진지하게 받아주기**: 도적 +3, 나머지 3명 각 −1 (스포트라이트 독점)
- ➡️ **가볍게 넘기기**: 도적 −2, 나머지 3명 각 +1

**카드 #3 — 광고 카드 (테마 래핑)**
> 클레릭: "잠깐, 배가 고픈데요..."
> *DM의 메모: 스폰서가 간식을 후원했다.*

- 📺 **광고 시청 (리워드)**: 모든 플레이어 +1, "간식 타임" 뱃지 세션 1회 한정
- ⬅️ **거절**: 클레릭 −1

### 3.7 메타 코미디 카드 카테고리 (8종)

1. `rule_dispute` — 룰 해석 분쟁 (RAW vs Rule of Cool)
2. `spotlight` — 스포트라이트 분배 (한 명 부각 vs 균형)
3. `improv_ruling` — 즉흥 판정 (주사위 공개 vs 비공개)
4. `player_nonsense` — 플레이어 헛소리 (상자에 말 걸기, 고양이 매수 등)
5. `backstory` — 백스토리 폭로 (에지로드 vs 평범 캐릭터)
6. `meta_break` — 메타 브레이크 (주인공 보정 vs 공정한 위험)
7. `table_management` — 식탁 관리 (간식·음료·휴식, 광고 삽입 지점)
8. `external_interruption` — 외부 방해 (전화벨, 배달, 반려견)

---

## 4. 캐릭터 시스템

### 4.1 공통 데이터 모델

```typescript
type PlayerCharacter = {
  id: string;                      // 'fighter', 'bard', 'druid'
  nameI18n: { ko: string; en: string };
  archetype: 'classic' | 'meme';   // 정통 직업 or 밈 캐릭터
  portraitSprite: string;          // 16×16 or 32×32 초상화
  expressionSprites: Expression[]; // 6단계: bliss, happy, neutral, bored, angry, leaving
  satisfactionModifiers: ModifierRule[]; // 고유 반응 규칙
  defaultSatisfaction: number;     // 시작 만족도 (보통 50/100)
  unlockCondition?: UnlockRule;    // 해금 조건 (기본 4명은 undefined)
};

type ModifierRule = {
  trigger: 'card_category' | 'other_character' | 'time_in_session';
  condition: string;
  effect: number;
  description: string;
};
```

### 4.2 MVP 기본 4명

**1. 전사 (Fighter) — "단순한 남자"**
- 원형: 매 세션 직진 전투만 원하는 고전파
- 좋아함: 전투 카드 (+1), 보상 카드 (+1)
- 싫어함: 복잡한 롤플레이 (−1), 수수께끼 (−1)
- 시그니처 대사: *"그냥 때려도 되지 않나요?"*

**2. 마법사 (Wizard) — "룰 변호사 지망생"**
- 원형: 룰북을 외우고 있는 진지파
- 좋아함: 룰 해석 분쟁에서 RAW 선택 (+2), 수수께끼/퍼즐 (+1)
- 싫어함: Rule of Cool 판정 (−2), 즉흥 마법 허용 (−1)
- 시그니처 대사: *"실제론 그렇지 않아요. 플레이어 핸드북 143페이지에..."*

**3. 도적 (Rogue) — "주인공 신드롬"**
- 원형: 스포트라이트에 목마른 에지로드 기질
- 좋아함: 백스토리 파고들기 (+3), 단독 활약 카드 (+2)
- 싫어함: 다른 플레이어가 주목받는 카드 (−2)
- 시그니처 대사: *"제 캐릭터 사연을 아직 말씀 안 드렸는데요..."*

**4. 클레릭 (Cleric) — "평화주의자"**
- 원형: 파티 분위기를 살피는 사회적 중재자
- 좋아함: 모든 플레이어가 +만족도 받는 카드 (+2 보너스), 롤플레이 (+1)
- 싫어함: 파티 내 갈등 (−2), PvP 상황 (−3)
- 시그니처 대사: *"우리 모두 친구잖아요?"*

### 4.3 MVP 해금 2명

**5. 바드 (Bard) — "영원한 즉흥 연주자"** (해금: 엔딩 3종 달성)
- 원형: NPC와 매번 노래 부르고 싶어함
- 좋아함: NPC 등장 카드 (+3), 즉흥 롤플레이 (+2)
- 싫어함: 전투 카드 연속 3장 이상 (−1 누적)
- 특수 규칙: 등장만 해도 클레릭 만족도 +1 (호감 관계)
- 시그니처 대사: *"제가 음유시인으로 서사시를 읊어드릴게요..."*

**6. 드루이드 (Druid) — "파시피스트 캐릭터 빌더"** (해금: 엔딩 5종 달성)
- 원형: 전투보다 자연·생태·협상을 선호, 동물 변신 남발
- 좋아함: 전투 회피 선택 (+3), NPC/동물과의 교섭 (+2), 자연 배경 카드 (+2)
- 싫어함: 불필요한 살생 (−3), 2세션 연속 전투 중심 (누적 −2)
- 특수 규칙: 드루이드 포함 파티는 전투 카테고리 가중치 −20%, 롤플레이/교섭 카드 +20%
- 특수 규칙: 클레릭과 시너지 — 둘 다 포함 시 "평화 해결" 선택지 효과 +1
- 시그니처 대사: *"잠시만요, 저 고블린도 가족이 있지 않을까요?"* / *"곰으로 변신해서 대화해볼게요."*

### 4.4 파티 조합 규칙

- **파티 인원**: 4명 고정 (MVP)
- **중복 캐릭터**: 불가 (MVP). 포스트 런칭 "카오스 모드"로 확장 예정.
- **조합 수**: 6C4 = **15가지**
- **시너지 예시**: 바드 + 클레릭 = 분위기 메이커, 전체 만족도 회복 +10%
- **컨플릭트 예시**: (포스트 런칭 룰 변호사) + 마법사 = 룰 경쟁, 첫 5카드 상호 −1/카드

### 4.5 캐릭터 성장 (도감 + 경량 성장)

**철학**: 이 게임은 RPG가 아니라 DM 게임. 능력치·장비·HP 없음. 대신 "오래 플레이한 플레이어와의 관계 누적" 감각.

**성장 축**:
- 세션 참여 시 획득한 XP를 참여한 4명 캐릭터에 균등 분배
- 캐릭터별 누적 XP 마일스톤:
  - **500 XP**: 새 반응 대사 해금 (다양성 증가)
  - **1500 XP**: 시작 만족도 +5 (초기 여유)
  - **3500 XP**: 고유 특수 액션 카드 해금 (1캠페인 1회)
  - **10000 XP**: 베테랑 뱃지, 초상화에 왕관 아이콘
- 특수 액션 예시: 도적의 "내 캐릭터 백스토리 풀기" 카드 (도적 +5 즉시 부여)

**도감 축**:
- 세션 중 5-10% 확률로 "전리품/사연 획득" 특수 카드 발동
- 예: *"전사가 갑옷 안에서 '할머니 편지'를 발견한다."* → 도적 +1, 도감 기록
- 캠페인 엔딩 화면에 "이 캠페인의 추억" 갤러리

### 4.6 표정 스프라이트 에셋 목록 (MVP)

- 초상화 본체: 6명 × 1장 = **6장**
- 표정 overlay: 6명 × 6단계 = **36장**
  - Bliss (90+) / Happy (70-89) / Neutral (40-69) / Bored (20-39) / Angry (1-19) / Leaving (0)
- 총 픽셀 에셋 (캐릭터): **42장**

### 4.7 포스트 MVP 해금 로드맵

- M+2: **드루이드 외 1명 추가** (후보: 팔라딘)
- M+3: **팔라딘** (선악 판정 예민)
- M+4: **뒷좌석 DM** (밈, 모든 판정에 훈수)
- M+4~5: **룰 변호사** (밈, RAW 극단 선호)
- M+5: **카오틱 이블 에지로드** (밈, 파티 내분 유발)
- M+6: **침묵의 플레이어** (밈, 긴장-만족 구조 역전)

---

## 5. 카드 시스템

### 5.1 카드 데이터 모델

```typescript
type Card = {
  id: string;                          // 'rd_001_darkvision_rule'
  category: CardCategory;              // 8 카테고리 중
  dramaLevel: 'light' | 'medium' | 'heavy';
  minSession: number;                  // 등장 가능 세션차 하한
  maxSession?: number;                 // 등장 가능 세션차 상한

  contentI18n: {
    ko: CardContent;
    en: CardContent;
  };

  requiresCharacter?: string[];        // 특정 캐릭터 있어야 등장
  excludesCharacter?: string[];        // 있으면 등장 안함

  choices: CardChoice[];               // 2-4개

  weight: number;                      // 1-10 출현 가중치
  cooldown: number;                    // 재등장 쿨다운 (카드 수 단위)

  version: number;                     // Supabase 업데이트 추적
  tags: string[];                      // 분석용 (meme, tutorial, seasonal 등)
};

type CardContent = {
  prompt: string;
  flavorText?: string;
};

type CardChoice = {
  direction: 'left' | 'right' | 'up' | 'down';
  labelI18n: { ko: string; en: string };
  effects: SatisfactionEffect[];
  consequenceI18n?: { ko: string; en: string };
  triggersAdOffer?: 'rewarded' | null;
};

type SatisfactionEffect = {
  target: 'fighter' | 'wizard' | 'rogue' | 'cleric' | 'bard' | 'druid'
        | 'all' | 'others' | 'self_archetype';
  delta: number;                       // -5 ~ +5
  condition?: string;
};
```

### 5.2 드라마 레벨

- `light` (−1~+1): 세션 도입부·쉬어가기용
- `medium` (−2~+2): 세션 주력
- `heavy` (−3~+3): 세션 클라이맥스·결정적 순간

### 5.3 카드 출현 알고리즘

```
페이스 곡선 (세션당 20카드 기준):
  카드 1-4:   light 70%, medium 30%                    [워밍업]
  카드 5-12:  light 30%, medium 60%, heavy 10%         [상승]
  카드 13-17: medium 40%, heavy 60%                    [클라이맥스]
  카드 18-20: medium 50%, light 30%, heavy 20%         [수습]

선별 규칙:
  1. 현재 파티에 맞는 카드만 (requiresCharacter / excludesCharacter 필터)
  2. 쿨다운 중 카드 제외
  3. 드라마 레벨 비율에 맞춰 가중치 적용 후 가중 랜덤
  4. 카테고리 다양성 보너스: 직전 3카드와 다른 카테고리 +30% 가중
  5. 캐릭터 개별 조명 보너스: 최근 카드에서 언급 적은 캐릭터 +20% 가중
```

### 5.4 MVP 카드 수량 목표

| 카테고리 | light | medium | heavy | 합계 |
|---|---|---|---|---|
| rule_dispute | 15 | 25 | 10 | 50 |
| spotlight | 10 | 20 | 10 | 40 |
| improv_ruling | 10 | 20 | 10 | 40 |
| player_nonsense | 20 | 25 | 5 | 50 |
| backstory | 10 | 20 | 15 | 45 |
| meta_break | 5 | 20 | 10 | 35 |
| table_management | 20 | 10 | 5 | 35 |
| external_interruption | 10 | 10 | 5 | 25 |
| **소계** | **100** | **150** | **70** | **320장** |

+ 캐릭터 고유 카드 (requiresCharacter): 6명 × 5장 = 30장
+ 엔딩 트리거 카드: 10-15장
**MVP 총 ≈ 365장** (한/영 각각, 총 730 문자열)

### 5.5 캐릭터 반응 대사 풀

각 캐릭터 × 반응 카테고리 3 (상승/하락/극단) × 평균 7개 = **약 126개 반응 대사** (한/영 = 252개 문자열)

### 5.6 엔딩 시스템 (10-12종)

**배드 엔딩** (즉사, 플레이어 1명 만족도 0 도달):
- **"Phone Call"** — 플레이어가 "전화 한 통만" 하고 안 돌아옴
- **"Snack Run"** — "과자 사러 간다" 핑계로 귀가
- **"Rules Walkout"** — 룰 해석 분노 이탈
- **"Spotlight Drain"** — "이럴 거면 왜 했지" 자책 이탈

**굿 엔딩** (10세션 완주, 스탯 조합별):
- **"The Legendary Campaign"** — 모든 플레이어 만족도 80+
- **"Fighter's Glory"** — 전사 압도적 1위
- **"Wizard's Masterwork"** — 마법사 압도적 1위 (RAW 위주)
- **"Rogue's Solo Show"** — 도적 압도적 1위 (스포트라이트 독점)
- **"Peaceful Table"** — 클레릭 압도적 1위 (평화 해결 다수)
- **"Bard's Song"** — 바드 포함 파티 + 바드 만족도 최상
- **"Druid's Grove"** — 드루이드 포함 파티 + 평화 해결 다수
- **"A Decent Session"** — 무난 엔딩 (3-4종 랜덤)

**엔딩 추출 로직**:
```
1. 즉사 발생 시 → 해당 캐릭터 이탈 사유에 따라 배드 엔딩 결정
2. 완주 시 → 최종 만족도 분포 확인:
   - 최대값 − 최소값 ≤ 15, 평균 ≥ 75: "Legendary"
   - 특정 캐릭터 만족도 90+ & 나머지 < 70: 해당 캐릭터 엔딩
   - 조건 미달: "A Decent Session" 계열
3. 파티 조합별 특수 엔딩 우선순위: 조건 만족 시 다른 엔딩 대체
```

### 5.7 콘텐츠 작성 워크플로

1. 한국어 원본 작성 (개발자 직접, 톤 컨트롤)
2. 영어 번역 (ChatGPT/Claude 보조 → 선택적 원어민 감수)
3. Supabase `cards` 테이블 업서트
4. 내부 QA 플레이 (한/영 각각)
5. 버전 태그 후 운영 반영

---

## 6. 기술 아키텍처

### 6.1 스택 개요

```
┌─────────────────────────────────────────────────────┐
│                React Native (Expo)                  │
│  UI Layer                                           │
│   - React Navigation (stack + modal)                │
│   - Reanimated 3 + Gesture Handler (스와이프)        │
│   - Skia / Lottie (픽셀 에셋, 파티클)                 │
│   - i18next + react-i18next (ko/en)                 │
│  State Layer                                        │
│   - Zustand (게임 상태)                              │
│   - TanStack Query (Supabase fetch·캐시)             │
│   - MMKV (로컬 영속 저장)                            │
│  Game Logic Layer (플랫폼 독립)                      │
│   - Card selection engine                           │
│   - Satisfaction calculator                         │
│   - Ending resolver                                 │
│   - Dice roller (seedable RNG)                      │
│  Integration Layer                                  │
│   - supabase-js (auth, db, realtime)                │
│   - react-native-google-mobile-ads (AdMob)          │
│   - expo-updates (OTA)                              │
│   - sentry-expo (에러 추적)                          │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                     Supabase                        │
│   Auth (anon + google) · Postgres (RLS on)          │
│   Storage (일러스트 CDN) · Edge Functions (Deno)      │
└─────────────────────────────────────────────────────┘
```

### 6.2 프로젝트 구조

```
mo_game/
├── app/                          # Expo Router
│   ├── _layout.tsx
│   ├── index.tsx                 # 홈
│   ├── campaign/
│   │   ├── new.tsx               # 파티 편성
│   │   ├── play.tsx              # 세션 플레이 (메인)
│   │   └── ending.tsx            # 엔딩·정산
│   ├── collection/
│   │   ├── characters.tsx        # 캐릭터 도감
│   │   └── endings.tsx           # 엔딩 도감
│   └── settings/
│       └── index.tsx
├── src/
│   ├── features/
│   │   ├── session/              # 세션 엔진
│   │   │   ├── engine/           # 카드 선별·만족도 계산
│   │   │   ├── components/       # TableView, CardStage, CharacterFrame
│   │   │   └── hooks/
│   │   ├── campaign/
│   │   ├── characters/
│   │   ├── cards/
│   │   ├── endings/
│   │   ├── ads/                  # AdMob 래퍼
│   │   ├── dice/
│   │   └── dm_screen/
│   ├── shared/
│   │   ├── i18n/
│   │   ├── supabase/             # client, zod schemas, queries
│   │   ├── stores/               # zustand stores
│   │   ├── storage/              # MMKV 래퍼
│   │   └── ui/                   # 공용 디자인 시스템
│   └── content/                  # 오프라인 fallback JSON
├── assets/
│   ├── sprites/                  # 픽셀 아트
│   └── fonts/                    # 픽셀 폰트 (ko/en)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                      # Detox or Maestro
└── supabase/
    ├── migrations/
    ├── seed/
    └── functions/
```

### 6.3 Supabase 데이터 모델

```sql
-- 1. 캐릭터 정의 (운영자 관리, 유저는 읽기만)
create table characters (
  id text primary key,
  archetype text not null,
  name_ko text not null,
  name_en text not null,
  portrait_url text not null,
  default_satisfaction int not null default 50,
  modifier_rules jsonb not null,
  unlock_condition jsonb,
  version int not null default 1
);

-- 2. 카드
create table cards (
  id text primary key,
  category text not null,
  drama_level text not null,
  min_session int not null default 1,
  max_session int,
  content_ko jsonb not null,
  content_en jsonb not null,
  requires_character text[],
  excludes_character text[],
  choices jsonb not null,
  weight int not null default 5,
  cooldown int not null default 10,
  version int not null default 1,
  tags text[]
);
create index cards_category_idx on cards (category);
create index cards_version_idx on cards (version);

-- 3. 엔딩
create table endings (
  id text primary key,
  kind text not null,
  name_ko text not null,
  name_en text not null,
  description_ko text,
  description_en text,
  trigger_rule jsonb not null,
  art_url text,
  version int not null default 1
);

-- 4. 유저 프로필
create table profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text,
  locale text not null default 'en',
  legend_points int not null default 0,
  session_xp int not null default 0,
  unlocked_characters text[] not null default array['fighter','wizard','rogue','cleric'],
  collected_endings text[] not null default array[]::text[],
  settings jsonb not null default '{}'
);
alter table profiles enable row level security;
create policy "own profile read"  on profiles for select using (auth.uid() = user_id);
create policy "own profile write" on profiles for update using (auth.uid() = user_id);

-- 5. 활성 캠페인 (클라우드 세이브)
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (user_id) on delete cascade,
  started_at timestamptz not null default now(),
  state jsonb not null,
  is_completed boolean not null default false,
  ending_id text references endings (id),
  updated_at timestamptz not null default now()
);
alter table campaigns enable row level security;
create policy "own campaigns" on campaigns for all using (auth.uid() = user_id);

-- 6. 세션 결과 (익명 집계용)
create table session_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (user_id) on delete set null,
  campaign_id uuid references campaigns (id) on delete set null,
  session_index int not null,
  party_composition text[] not null,
  final_satisfactions jsonb not null,
  cards_played int not null,
  dice_rolls int not null,
  rewarded_ads_watched int not null default 0,
  ended_at timestamptz not null default now()
);
alter table session_results enable row level security;
create policy "own session read"  on session_results for select using (auth.uid() = user_id);
create policy "own session write" on session_results for insert with check (auth.uid() = user_id);

-- 7. 캐릭터별 진행 (도감 + 경량 성장)
create table character_progress (
  user_id uuid references profiles (user_id) on delete cascade,
  character_id text references characters (id),
  xp int not null default 0,
  session_count int not null default 0,
  first_played_at timestamptz not null default now(),
  last_played_at timestamptz not null default now(),
  unlocked_milestones text[] not null default array[]::text[],
  memories jsonb not null default '[]',
  primary key (user_id, character_id)
);
alter table character_progress enable row level security;
create policy "own progress" on character_progress for all using (auth.uid() = user_id);

-- 8. A/B 실험 할당
create table experiment_assignments (
  user_id uuid references profiles (user_id) on delete cascade,
  experiment_key text not null,
  variant text not null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, experiment_key)
);
alter table experiment_assignments enable row level security;
create policy "own assignments" on experiment_assignments for select using (auth.uid() = user_id);
```

### 6.4 데이터 흐름 (세션 1판 수명주기)

```
1. [앱 실행]
   - MMKV에서 마지막 profile_id 로드
   - Supabase anon sign-in (없으면) or resume session
   - profiles, unlocked_characters, collected_endings fetch (stale 24h)
   - cards 최신 버전 fetch (로컬 캐시 대조, 변경분만 다운로드)

2. [홈 → 새 캠페인]
   - 파티 편성 화면 (4명 선택, 중복 불가)
   - Supabase campaigns insert
   - 로컬 zustand 동기화

3. [세션 시작]
   - 세션 페이즈(오프닝/본편/엔딩) 진입
   - CardEngine.selectNext(currentState) — 로컬 필터·가중 랜덤
   - UI 렌더 (카드 + 캐릭터 표정)

4. [카드 선택]
   - 결정적: 즉시 effect 적용
   - 주사위: RNG (seedable) → 결과별 effect
   - 캐릭터 만족도 업데이트 → 표정 스프라이트 교체 (300ms 트윈)
   - 로컬 zustand → debounce 3초 후 Supabase campaigns.state upsert

5. [세션 종료]
   - session_results insert
   - 광고: 캠페인 중이면 배너만, 캠페인 종료 시 전면광고 1회
   - 다음 세션 or 엔딩 화면

6. [캠페인 엔딩]
   - EndingResolver.resolve(finalState) → endingId
   - profiles.collected_endings 갱신, legend_points 증가
   - 해금 조건 체크 → unlocked_characters 갱신
   - character_progress.xp 업데이트, 마일스톤 달성 체크
   - 엔딩 화면 (일러스트 + 공유 버튼)
```

### 6.5 오프라인 / 온라인 전략

- 카드·캐릭터·엔딩 정의를 앱 번들에 초기 JSON 내장 (첫 실행 오프라인 가능)
- 런 중 오프라인: 로컬 zustand로 완전 동작, 복귀 시 업데이트 플러시
- 익명 계정 기반 — 계정 연결 안 해도 동일 기기에서 세이브 지속
- 기기 변경: 구글 계정 연결 → linkIdentity → 다른 기기 resume
- Supabase 장애 시: fetch 실패 시 번들 JSON fallback, 집계는 로컬 큐에 저장

### 6.6 빌드·배포

- **Expo EAS Build** — 클라우드 빌드, `.aab` 산출물
- **EAS Update** — JS/에셋 OTA (네이티브 변경 없을 때 심사 없이 즉시 배포)
- **버전 관리**:
  - 네이티브 앱 버전: Play Store 심사 필요 시 (SDK 업데이트·권한 변경)
  - OTA 버전: 카드 추가·텍스트 수정·밸런싱
- **빌드 환경**: development / preview / production (각 Supabase 프로젝트 분리)

---

## 7. UI/UX

### 7.1 화면 맵

```
[스플래시]
    ↓
[홈]
  ├─ "이어하기" (활성 캠페인 있을 때만)
  ├─ "새 캠페인"   → [파티 편성]
  ├─ "도감"        → [컬렉션]
  └─ "설정"        → [설정]

[파티 편성]
  └─ 해금 캐릭터 중 4명 선택 (중복 불가)
      ↓
[캠페인 인트로]
  └─ 시나리오 텍스트 + "세션 1 시작"
      ↓
[세션 플레이]  ← 메인 (테이블 탑다운 뷰)
  ├─ 카드 스와이프 / 주사위 / DM 스크린
  └─ 세션 종료 → [세션 정산]

[세션 정산]
  ├─ 세션 XP
  ├─ 플레이어별 만족도 변동 요약
  ├─ 리워드 광고 "XP 2배"
  └─ 다음 세션 or [엔딩]

[캠페인 엔딩]
  ├─ 엔딩 일러스트 + 이름 + 서술
  ├─ 전면광고 1회 (직전)
  ├─ 레전드 포인트 + 새 해금 알림
  ├─ 캠페인 하이라이트 (도감 추가 항목)
  └─ "공유" / "홈으로"

[컬렉션]
  ├─ 캐릭터 도감 (해금/미해금, 누적 XP, 마일스톤)
  ├─ 엔딩 도감 (N/12)
  └─ 추억/전리품 목록 (캐릭터별)

[설정]
  ├─ 언어 (한국어 / English)
  ├─ 구글 계정 연결
  ├─ 광고 동의 (UMP)
  ├─ BGM / SFX 볼륨
  ├─ 데이터 초기화
  └─ 버전 / 개인정보 / 오픈소스
```

### 7.2 메인 플레이 화면 레이아웃

```
┌──────────────────────────────────────────┐
│ [≡]  Session 3/10    DM Screen: 🎲🌀🎭   │  ← 상단 바
├──────────────────────────────────────────┤
│                                          │
│      😊 Fighter         Wizard 😐        │  ← 상단 2명
│      ████████░░         █████░░░░░        │
│                                          │
│         ┌──────────────────┐             │
│         │   [카드 일러스트]  │             │
│         │   카드 텍스트     │             │
│         │   ◄ 선택A  선택B ►│             │
│         └──────────────────┘             │
│                                          │
│         🎲 (주사위 옵션 있을 때만)         │
│                                          │
│      😎 Rogue           Cleric 😊        │  ← 하단 2명
│      ██████████         ████████░░        │
└──────────────────────────────────────────┘
```

### 7.3 카드 인터랙션

- 기본 2택: 좌/우 스와이프
- 4택: 상/하 스와이프 추가 (드물게)
- 카드 더블탭: 뒷면 확인 (DM 메모, 플레이버)
- 주사위 롤: 홀드 + 플릭 제스처, 1-2초 애니메이션
- DM 스크린: 상단 아이콘 탭, 확인 모달 후 발동

### 7.4 만족도 UI

각 초상화 + 하단 바 5단계 색상:
- 0-19 Angry (빨강, 찡그림, 깜빡임)
- 20-39 Bored (주황, 폰 만지작)
- 40-69 Neutral (노랑, 무표정)
- 70-89 Happy (연두, 미소)
- 90+ Bliss (초록, 환희, 반짝임)

변동 피드백: "+2" / "-3" 픽셀 폰트 800ms 표시, 바 트윈, 극적 변동 시 초상화 흔들림 + SFX.

### 7.5 메타 코미디 UI 디테일

- TRPG 테이블 분위기: 피자·콜라캔·주사위·룰북 배경
- 세션 페이즈별 조명 변화 (오후 → 저녁 → 밤)
- 세션 번호 자동 부제: *"Session 3: In Which Our Heroes Argue About Darkvision"*
- 로딩 화면: "주사위 굴리는 중..." + TRPG 밈 인용
- 광고 모달도 세계관 안의 메시지로 ("DM의 메모")

### 7.6 픽셀 아트 원칙

- 해상도: 16×16 표정 / 32×32 배경 타일 / 64×64 엔딩 일러스트
- 팔레트: 32색 고정 (PICO-8 확장 느낌)
- 폰트: 한글 12×12 권장, 영문 8×8
- UI 테두리: 룰북 느낌 이중 보더
- 애니메이션 프레임 극소: 표정 300ms 크로스페이드, 카드 회전+투명도, 주사위 6-8프레임

### 7.7 접근성

- 폰트 크기 3단계 (1.0 / 1.25 / 1.5)
- 색각 대응: 만족도 바 + 아이콘/숫자 병기
- 스와이프 대안: 명시적 선택 버튼
- 스크린리더 라벨
- 진동 피드백 (설정 토글)

### 7.8 온보딩 (첫 3분)

```
[첫 실행]
  → 자동 anon 로그인
  → 튜토리얼 캠페인 (파티 고정: 기본 4명)
[튜토리얼 카드 8장]
  1: 좌/우 스와이프 소개
  2: 만족도 바 의미
  3-5: 기본 카드 체험
  6: 주사위 롤 소개
  7: DM 스크린 소개
  8: 세션 종료 + 도감 소개
  → [홈] (자유 플레이)
```

건너뛰기 버튼 제공, 기본은 진행.

---

## 8. 수익 모델

### 8.1 수익원

**1차: 광고 (런칭 시 100%)**
- AdMob 우선, 3-4개월 후 AppLovin MAX 미디에이션 평가
- 리워드 / 전면 / 배너

**2차: IAP (M+3+ 도입, MVP 제외)**
- 광고 제거 $2.99
- DM 스크린 확장 $4.99
- 코스메틱 팩
- 원칙: Pay-to-Shortcut OK, Pay-to-Win 불가

### 8.2 광고 삽입 지점

| 지점 | 타입 | 유저 선택 | 기대 시청률 |
|---|---|---|---|
| 세션 중 "간식 타임" 카드 | Rewarded | 옵트인 | 40-60% |
| 세션 중 "주사위 리롤" | Rewarded | 옵트인 (대실패 시) | 50-70% |
| 세션 정산 "XP 2배" | Rewarded | 옵트인 | 50-70% |
| 즉사 시 "플레이어 달래기" | Rewarded | 옵트인 | 60-80% |
| DM 스크린 슬롯 충전 | Rewarded | 옵트인 | 30-50% |
| 캠페인 엔딩 직전 | Interstitial | 강제 (5s skip) | 100% |
| 홈 화면 하단 | Banner | 노출 | — |

### 8.3 세션 XP 공식

```
세션 XP = 기본값(100)
        + 만족도 평균 보너스 (0~50, 최종 평균 만족도 기반)
        + 주사위 크리티컬 보너스 (0~20, 자연 20 발생 수 기반)
        ↓
× 2 (리워드 광고 시청 시)
        ↓
참여한 4명 캐릭터 각자 균등 분배 (각 캐릭터 XP +N)
        ↓
캐릭터별 누적 XP 마일스톤 체크
```

레전드 포인트는 별도 — 캠페인 엔딩 시 엔딩 종류별 고정 획득 (배드 10 / 굿 30 / 레전더리 80).

### 8.4 기대 수익 (추정)

| 지표 | 추정값 |
|---|---|
| 세션/DAU | 2.5 |
| 세션당 Rewarded 시청 | 0.6회 |
| Rewarded eCPM | $12 (영어권 Android) |
| Interstitial eCPM | $5 |
| 캠페인/DAU | 0.4 |
| **ARPDAU** | **$0.04 ~ $0.06** |
| **MAU 10K 월매출** | **$1,000 ~ $1,800** |
| **MAU 100K 월매출** | **$10K ~ $18K** |

한국 유저는 eCPM 1/3 수준.

---

## 9. 분석 · 리텐션

### 9.1 코어 이벤트

- `app_open`, `session_start`, `session_end`, `campaign_start`, `campaign_end`
- `card_shown`, `card_choice`, `dice_rolled`, `dm_screen_used`
- `character_milestone_unlocked`, `ending_reached`
- `ad_impression`, `ad_rewarded_completed`
- `experiment_assigned`, `experiment_goal`

프라이버시: PII 미저장, 익명 UUID 기반, UMP 동의 플로우.

### 9.2 리텐션 전략

- **Day 1**: 튜토리얼 + 첫 엔딩 30분 내 체험, 첫 엔딩 보상 즉시 제공
- **Day 2-7**: "오늘의 테이블" 일일 특수 카드 (시의적 밈, Supabase remote push), 해금 근접 알림
- **Day 7-30**: 해금 캐릭터 페이스 (10세션당 1명), 엔딩 도감 진척, 캐릭터 마일스톤
- **Day 30+**: 업데이트 콘텐츠 (M+2부터 해금 추가, M+4 시나리오 팩, M+6 소셜)

### 9.3 A/B 실험 (MVP 런칭 후 활성화)

1. `exp_ad_frequency_v1` — 광고 빈도 (D1·D7 리텐션, ARPDAU)
2. `exp_tutorial_length_v1` — 튜토리얼 길이 (완주율)
3. `exp_first_session_difficulty_v1` — 첫 캠페인 난이도 (완주율, D3 리텐션)

### 9.4 KPI 목표 (첫 3개월)

| 지표 | 내부 목표 |
|---|---|
| D1 리텐션 | 35%+ |
| D7 리텐션 | 15%+ |
| D30 리텐션 | 7%+ |
| 세션/DAU | 2.0+ |
| 튜토리얼 완주율 | 70%+ |
| 첫 캠페인 완주율 | 50%+ |
| Rewarded 시청률 | 50%+ |
| ARPDAU | $0.04+ |

미달 시 대응 순서: D1 문제→튜토리얼 재설계, D7 문제→해금 밸런스, ARPDAU→광고 빈도 A/B.

---

## 10. MVP 스코프

### 10.1 포함 (Must-Have)

**게임플레이**
- 4 기본 + 2 해금 캐릭터
- 파티 편성 (4명 선택, 중복 불가)
- 세션 3단계 구조
- 카드 스와이프 2택/4택 + 주사위 롤
- DM 스크린 3종
- 만족도 시스템 (6단계 × 6명 = 42 스프라이트)
- 하이브리드 종료 (배드 4종 + 굿 6-8종)

**콘텐츠**
- 카드 ≈ 365장
- 엔딩 10-12종 (한/영)
- 튜토리얼 캠페인 (8카드)

**진행·보상**
- 캐릭터 XP + 마일스톤 4종
- 레전드 포인트 → 로스터 해금
- 도감 (캐릭터·엔딩·추억)

**시스템**
- 한/영 i18n (동시 런칭)
- Supabase 익명 + 구글 연결
- 원격 콘텐츠 + 로컬 번들 fallback
- 클라우드 세이브, 오프라인 완전 동작

**수익화**
- AdMob (Rewarded·Interstitial·Banner)
- 테마 래핑 광고 카드

**분석**
- 코어 이벤트 + A/B 프레임워크 세팅
- Sentry

**플랫폼**
- Android only

### 10.2 제외 (포스트 런칭)

- iOS (M+6)
- 룰 변호사·팔라딘·뒷좌석 DM·카오틱 에지로드·침묵의 플레이어 (M+4~)
- 시나리오 팩 (M+4)
- 소셜 기능 (M+6)
- 카오스 모드 (M+12)
- 장비 시스템 (M+6 실험)
- IAP (M+3)
- DM 프로필 레벨·코스메틱 (M+2~3)
- Small Table / Full Table 모드

---

## 11. 개발 로드맵 (14-16주)

**Phase 0: 준비 (1주)**
- Expo 프로젝트 + EAS CI/CD
- Supabase 3환경 (dev/preview/prod)
- 린트·포맷·테스트 프레임워크
- 픽셀 아티스트 섭외·스타일 가이드

**Phase 1: 코어 루프 프로토타입 (2주)**
- 카드 스와이프 UI + Reanimated
- 만족도 시스템 + 표정 교체
- 로컬 JSON 카드 엔진
- 한 세션 플레이 가능

**Phase 2: 풀 게임 루프 (3주)**
- 캠페인 구조 + 엔딩 판정
- 주사위 + DM 스크린
- 세션 3단계 페이스 엔진
- 파티 편성·홈·네비게이션

**Phase 3: Supabase + i18n (2주)**
- 익명 인증 + 구글 연결
- 원격 카드 fetch + 로컬 캐시
- 클라우드 세이브
- i18next + 한/영 UI

**Phase 4: 콘텐츠 + 에셋 (3주, 병행)**
- 카드 365장 한/영 작성
- 픽셀 42장 + 배경 + UI
- 엔딩 일러스트 10-12장
- 튜토리얼 8카드

**Phase 5: 광고·분석·OTA (1.5주)**
- AdMob + UMP
- 테마 래핑 광고 카드
- 분석 이벤트 + Edge Functions
- Sentry
- EAS Update OTA

**Phase 6: QA·폴리싱·릴리스 (2-2.5주)**
- 내부 QA 한/영 10시간+
- 밸런싱 조정
- 접근성 패스
- Play Console 준비 (리스팅, 개보, 연령)
- Closed → Open → Production

---

## 12. 리스크 & 완화책

| 리스크 | 영향 | 완화책 |
|---|---|---|
| 픽셀 아트 일정 지연 | 중 | Phase 1부터 병행, Placeholder로 로직 선행 |
| 카드 작문 양 부담 | 고 | AI 초안 + 수정 + 원어민 감수. 장당 15분 목표 |
| 영어 번역 뉘앙스 | 중 | 원어민 감수 20시간 예산 확보 |
| Google Play 심사 거절 | 중 | 광고·개보·연령 사전 체크, 테스트 트랙 활용 |
| Supabase 무료 tier 초과 | 저 | MAU 5만 내 무료, 초과 시 Pro $25/월 |
| 실기기 성능 | 저 | Reanimated worklet 최적화, 저가 Android QA |

---

## 13. 오픈 이슈

**콘텐츠**
1. 영어 번역 파트너 — 원어민 감수 아웃소싱 여부·예산 결정
2. 한글 픽셀 폰트 가독성 — 8×8 vs 12×12 vs 일반 폰트 믹스, 프로토타입 A/B
3. 튜토리얼 8카드 구체 시나리오 — 개발 중 작성, 플레이테스트 조정
4. 엔딩 트리거 경계값 — 플레이테스트 데이터로 캘리브레이션

**기술**
5. AdMob 계정 심사 — Phase 5 전 완료 필요 (1-2주 소요 가능)
6. Expo EAS 요금제 — Free로 시작, 필요 시 Production 업그레이드
7. BGM/SFX — **권장: SFX만 MVP 포함, BGM은 포스트 런칭**
8. 개보·광고 동의 플로우 — 한국 개보법 + GDPR + CCPA + COPPA 대응

**운영**
9. 런칭 마케팅 채널 — r/DnD, r/DnDMemes, Twitter, 유튜브 TRPG 팬. 별도 기획
10. 커뮤니티 채널 — **권장: 디스코드 + 앱 내 피드백 링크**
11. 콘텐츠 업데이트 주기 — 매주 20-30장 / 격주 / 시즌 이벤트

---

## 14. 성공 기준 (런칭 30일 내)

- **체험 품질**: D1 리텐션 30%+, 튜토리얼 완주율 65%+
- **수익 타당성**: ARPDAU $0.03+
- **콘텐츠 피드백**: TRPG 커뮤니티에서 최소 1회 바이럴 포스트 (100+ upvotes)
- **기술 안정**: 크래시-프리 세션 99%+, Google Play 평점 4.0+

---

## 15. 다음 단계

이 디자인 문서 승인 후:
1. `writing-plans` 스킬로 상세 구현 계획 작성
2. Phase 0 준비 작업 착수 (Expo 프로젝트·Supabase 환경·아티스트 섭외)
3. Phase 1 코어 루프 프로토타입 시작
