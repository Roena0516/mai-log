mai-log 프로젝트

Claude의 좋은 이해를 위한 좋은 Claude가 작성한 CLAUDE.md를 복사해온 좋은 리드리드미

## 프로젝트 개요

**mai-log**는 maimaiDX International ver. 사설 전적 관리 서비스입니다.

### 프로젝트 목적

- 공식 maimaiDX net 사이트의 불편한 UI/UX 개선
- 더 합리적인 레이팅 시스템 제공
- 플레이 기록 조회 및 악곡 리스트 관리 기능 제공

### 영감

이 프로젝트는 [maishift](https://maimai.shiftpsh.com/)에서 영감을 받았으며, shiftpsh님께 존경과 감사를 표합니다.

---

## 기술 스택

### 프론트엔드

- **Next.js 16.1.6** - React 프레임워크 (App Router)
- **React 19.2.3** - UI 라이브러리
- **TypeScript 5.x** - 정적 타입 체크
- **Tailwind CSS 4.x** - 유틸리티 기반 CSS 프레임워크

### 데이터베이스 (예정)

- **PostgreSQL** - 관계형 데이터베이스
- **Prisma ORM** - TypeScript ORM

### 백엔드

**백엔드는 별도로 구성하지 않습니다.**

- 플레이 기록 조회 및 악곡 리스트 저장은 프론트엔드에서 처리
- 레이팅 산출은 클라이언트 사이드에서 계산

---

## 프로젝트 구조

```
mailog/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   ├── globals.css        # 전역 스타일
│   └── favicon.ico        # 파비콘
├── md/                     # 프로젝트 문서
│   └── mai-log *.md       # 프로젝트 기획서
├── node_modules/           # 의존성 패키지
├── public/                 # 정적 파일
├── package.json            # 프로젝트 의존성
├── tsconfig.json          # TypeScript 설정
├── next.config.ts         # Next.js 설정
├── tailwind.config.ts     # Tailwind CSS 설정 (예정)
├── eslint.config.mjs      # ESLint 설정
└── README.md              # 프로젝트 README
```

---

## 핵심 개념

### 1. maimaiDX 레이팅 시스템

maimaiDX는 플레이어의 실력을 '레이팅'이라는 수치로 표현합니다.

#### 기존 레이팅 산출 공식

```
점수 = (난이도 × 달성률 × 랭크별 계수 / 100) + All Perfect 보너스(1점)
```

- **달성률**: 최대 100.5% (게임에서 101%를 얻어도 100.5로 계산)
- **난이도**: 1.0 ~ 15.0 실수값
- **랭크**: D ~ SSS+ (달성률에 따라 결정)
- **레이팅**: 상위 50곡의 점수 합산 (신곡 15곡 + 나머지 35곡)

#### 랭크별 계수

| 랭크 | 계수 |
| ---- | ---- |
| SSS+ | 22.4 |
| SSS  | 21.6 |
| SS+  | 20.8 |
| SS   | 20.0 |
| ...  | ...  |

### 2. mai-log 개선 레이팅 시스템

#### 개선된 점수 산출 공식

```
점수 = 난이도 × 달성률 × 랭크별 계수 × 클리어 마크 계수 / 100
```

#### 클리어 마크 계수

| 클리어 마크  | 계수  |
| ------------ | ----- |
| Full Combo   | 1.005 |
| Full Combo+  | 1.01  |
| All Perfect  | 1.025 |
| All Perfect+ | 1.05  |

#### 개선 사항

1. **Full Combo/All Perfect의 가치 상승**: 기존 1점 → 최대 15점 추가
2. **신곡/구곡 구분 제거**: 50곡 통합 (기존: 신곡 15 + 구곡 35)
3. **클리어 마크 반영**: FC/AP가 레이팅에 실질적 영향

#### 예시 (14.0 레벨, SSS+ 달성)

- 기존: 315점
- Full Combo: 316점 (+1)
- Full Combo+: 318점 (+3)
- All Perfect: 323점 (+8)
- All Perfect+: 330점 (+15)

---

## 주요 기능

### 1. 개선된 레이팅 시스템

- Full Combo/All Perfect에 더 큰 가치 부여
- 신곡/구곡 통합 레이팅 (50곡)

### 2. 플레이 기록 조회

- 간편한 기록 조회 인터페이스
- 다양한 필터링 옵션
- 난이도별, 랭크별, 달성률별 정렬

### 3. 악곡 리스트 관리

- 플레이하고 싶은 곡 리스트 저장
- 추천 곡 리스트 생성
- 리스트 이름 및 설명 작성
- 공개 범위 설정 (비공개/공개)

### 4. 데이터 업로드

- **북마클릿(Bookmarklet) 방식 채택**
- maimaiDX net 사이트에서 북마크를 통해 데이터 수집
- DOM 구조 파싱 후 mai-log로 전송

> **참고**: maimaiDX는 공식 API를 제공하지 않아 북마클릿 방식 사용

### 5. 페이지 공유

- 플레이 기록 링크 공유
- 갤러리에서 다른 유저 기록 검색
- 인기 악곡 리스트 탐색

---

## 개발 가이드

### 환경 설정

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# ESLint 실행
npm run lint
```

### 개발 서버

- URL: http://localhost:3000
- Hot Reload 지원

### 코딩 컨벤션

#### TypeScript

- **엄격한 타입 체크** 활성화
- `any` 타입 사용 최소화
- 인터페이스 우선 사용

#### 컴포넌트

- 함수형 컴포넌트 사용
- React Server Components 우선 고려
- 클라이언트 컴포넌트는 'use client' 명시

#### 스타일링

- Tailwind CSS 유틸리티 클래스 사용
- 커스텀 CSS는 최소화
- 반응형 디자인 필수

---

## 개발 시 주의사항

### 1. 레이팅 계산 정확성

- 소수점 계산 정밀도 유지
- 랭크별 계수 정확히 적용
- 클리어 마크 계수 누락 방지

### 2. 데이터 수집

- maimaiDX net의 DOM 구조 변경 대응
- 북마클릿 코드의 안정성 확보
- 에러 핸들링 강화

### 3. 성능 최적화

- Next.js Image 컴포넌트 활용
- 클라이언트/서버 컴포넌트 적절히 분리
- 대용량 리스트 렌더링 최적화 (가상화 고려)

### 4. 사용자 경험

- maishift의 심플하고 접근성 좋은 UI/UX 참고
- 필터링 기능 직관적으로 구현
- 로딩 상태 명확히 표시

### 5. 보안

- 사용자 데이터 안전하게 저장
- XSS 공격 방지 (북마클릿 코드 검증)
- 공개 범위 설정 철저히 준수

---

## 데이터베이스 스키마 (예정)

### Users (유저)

- id
- username
- email
- created_at

### PlayRecords (플레이 기록)

- id
- user_id
- song_id
- difficulty
- score
- achievement_rate
- rank
- clear_mark (FC/FC+/AP/AP+)
- rating_score (계산된 레이팅 점수)
- played_at

### Songs (악곡)

- id
- title
- artist
- difficulty_levels (Easy/Basic/Advanced/Expert/Master/Re:Master)
- is_new (신곡 여부)

### SongLists (악곡 리스트)

- id
- user_id
- name
- description
- is_public
- created_at

### SongListItems (리스트 항목)

- id
- list_id
- song_id
- order

---

## 참고 자료

### maimaiDX 관련

- [maimaiDX 공식 사이트](https://maimai.sega.jp/)
- [maimaiDX net](https://maimaidx-eng.com/)

### 유사 서비스

- [maishift](https://maimai.shiftpsh.com/) - 영감을 받은 서비스

### 기술 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)

---

## Claude Code 작업 시 팁

### 레이팅 계산 로직 구현 시

```typescript
// 개선된 레이팅 산출 함수 예시
function calculateRating(
  difficulty: number,
  achievementRate: number,
  rank: string,
  clearMark?: "FC" | "FC+" | "AP" | "AP+",
): number {
  const rankCoefficient = getRankCoefficient(rank);
  const clearMarkCoefficient = getClearMarkCoefficient(clearMark);
  const cappedAchievement = Math.min(achievementRate, 100.5);

  return (
    (difficulty * cappedAchievement * rankCoefficient * clearMarkCoefficient) /
    100
  );
}
```

### 북마클릿 구현 가이드

- maimaiDX net의 DOM을 안전하게 파싱
- 수집한 데이터를 JSON으로 변환
- postMessage API로 mai-log 사이트에 전송

### UI 컴포넌트 개발

- 필터링 가능한 곡 리스트
- 레이팅 상세 정보 카드
- 악곡 리스트 관리 인터페이스
- 갤러리/검색 페이지

---

## 문의 및 기여

프로젝트에 대한 문의사항이나 기여하고 싶은 내용이 있다면 이슈를 생성해주세요.

**mai-log 프로젝트에 관심을 가져주셔서 감사합니다!**
