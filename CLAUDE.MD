# mai-log — CLAUDE.md

## 프로젝트 개요

maimai DX 플레이 데이터를 아르케아(Arcaea), SOUND VOLTEX, 츄니즘(CHUNITHM) 등
타 리듬게임의 지표로 환산해, 타 게임에서 유입된 유저가 자신의 실력대를
친숙한 언어로 즉시 파악할 수 있게 해주는 크로스게임 레이팅 환산 서비스.

## 기술 스택

- **Frontend**: TypeScript, Next.js (App Router), Zustand, Tailwind CSS
- **Database**: Neon (Serverless PostgreSQL), Prisma ORM
- **Deployment**: Cloudflare Pages

## 프로젝트 구조

```
mai-log/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   └── records/
│   │       └── route.ts        # 북마클릿 → 서버 데이터 수신 엔드포인트
│   ├── [username]/             # 유저 프로필 페이지
│   └── page.tsx                # 메인 페이지
├── components/                 # 공통 컴포넌트
├── lib/
│   ├── prisma.ts               # Prisma 클라이언트 싱글톤
│   ├── rating.ts               # maimai 레이팅 계산 로직
│   └── convert/                # 타 게임 지표 환산 로직
│       ├── arcaea.ts           # 포텐셜 환산
│       ├── sdvx.ts             # 볼포스 환산
│       └── chunithm.ts         # 츄니즘 레이팅 환산
├── store/                      # Zustand 전역 상태
├── prisma/
│   └── schema.prisma
└── CLAUDE.md
```

## 데이터 흐름

```
유저가 북마클릿 실행
    → maimai DX NET에서 플레이 데이터 스크래핑
    → POST /api/records 로 전송
    → Neon DB에 저장 (Prisma)
    → 프로필 페이지에서 환산 결과 표시
```

## 데이터베이스 스키마 (Prisma)

```prisma
model User {
  id               String   @id @default(cuid())
  nickname         String   @unique
  title            String?
  playCountTotal   Int      @default(0)
  playCountVersion Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  records          Record[]
}

model Record {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  title          String
  achievement    Float
  level          Float
  difficultyType String   // basic | advanced | expert | master | remaster
  isDx           Boolean
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## 핵심 비즈니스 로직

### maimai 레이팅 계산

```typescript
// 달성률 구간별 계수
function getCoefficient(achievement: number): number {
  if (achievement >= 100.5) return 22.4;
  if (achievement >= 100.0) return 21.6;
  if (achievement >= 99.5) return 21.1;
  if (achievement >= 99.0) return 20.8;
  if (achievement >= 97.0) return 20.0;
  if (achievement >= 94.0) return 16.8;
  if (achievement >= 90.0) return 15.2;
  if (achievement >= 80.0) return 13.6;
  if (achievement >= 75.0) return 12.0;
  if (achievement >= 70.0) return 11.2;
  return 0;
}

// 단일 채보 레이팅
function calcSingleRating(level: number, achievement: number): number {
  return Math.floor(
    ((level * Math.min(achievement, 100.5)) / 100) *
      getCoefficient(achievement),
  );
}

// 전체 레이팅 = 베스트 50곡 평균
```

### 타 게임 환산 기준 (초안)

| maimai 레이팅 | Arcaea 포텐셜 | SDVX 볼포스 | CHUNITHM 레이팅 |
| :-----------: | :-----------: | :---------: | :-------------: |
|    ~5,000     |     ~5.00     |   ~8,000    |      ~5.00      |
|    ~10,000    |     ~8.00     |   ~10,000   |      ~8.00      |
|    ~12,000    |    ~10.00     |   ~12,000   |     ~10.00      |
|    ~14,000    |    ~11.00     |   ~14,000   |     ~12.00      |
|    ~15,000    |    ~12.00     |   ~16,000   |     ~14.00      |
|    ~16,000    |    ~13.00+    |  ~18,000+   |     ~16.00      |

> 환산 기준은 각 게임의 레이팅 산출 구조와 유저 분포를 기반으로 지속적으로 보정.

## API 명세

### POST /api/records

북마클릿에서 수집한 데이터를 수신해 DB에 저장.

**Request Body**

```json
{
  "userProfile": {
    "nickname": "string",
    "title": "string",
    "playCountTotal": 0,
    "playCountVersion": 0
  },
  "records": [
    {
      "title": "string",
      "achievement": 99.5,
      "level": 13.9,
      "difficulty_type": "master",
      "is_dx": true
    }
  ]
}
```

**Response**

```json
{ "ok": true, "saved": 1022 }
```

## 코드 컨벤션

- 컴포넌트: PascalCase, 파일명도 동일
- 유틸 함수: camelCase
- 환산 로직은 `/lib/convert/` 에만 작성, 컴포넌트에 직접 작성 금지
- Prisma 클라이언트는 `/lib/prisma.ts` 싱글톤만 사용
- API Route는 반드시 try-catch로 감싸고 적절한 HTTP 상태코드 반환
- 타입은 `any` 사용 금지, 모든 데이터에 명시적 타입 정의

## 환경 변수

```env
DATABASE_URL=           # Neon PostgreSQL 연결 문자열
DIRECT_URL=             # Prisma migrate용 direct 연결 (Neon 필수)
```

## 주의사항

- 북마클릿은 maimai DX NET 영문판(`maimaidx-eng.com`) 기준으로 동작
- 환산 수치는 추정값이며, 각 게임의 공식 레이팅과 정확히 일치하지 않을 수 있음
- 유저 데이터는 플레이 카운트가 이전보다 증가한 경우에만 갱신
- Neon + Prisma 연결 시 `DATABASE_URL`과 `DIRECT_URL` 모두 설정 필요
