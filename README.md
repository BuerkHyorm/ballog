# Ballog

KBO 야구팬을 위한 개인 직관 기록 및 통계 웹앱입니다.

Ballog는 사용자가 직접 관람한 경기를 기록하고, 응원팀 관점의 승패와 구장·상대팀·월별 통계를 확인할 수 있는 개인 야구 다이어리입니다. KBO 또는 각 구단의 공식 서비스나 제휴 앱은 아닙니다.

## 주요 기능

- Supabase Auth 기반 회원가입과 로그인
- 응원팀 선택 및 구단별 컬러 테마
- 실제 KBO 경기 일정 조회와 경기 선택
- 좌석, 동행인, 한줄평, 별점을 포함한 직관 기록
- 공식 경기 재동기화를 통한 경기 결과 자동 반영
- 구장·상대팀·월·요일 및 연승 기록 통계
- 월별 직관 캘린더
- 모바일 하단 내비게이션과 데스크톱 사이드바

## 기술 스택

- React, TypeScript, Vite
- Tailwind CSS
- React Router
- Supabase Auth, PostgreSQL, RLS
- Supabase Edge Functions

## 로컬 실행

Node.js 20 이상이 필요합니다.

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에 Supabase Dashboard의 Project URL과 브라우저용 publishable key를 입력합니다.

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

서버 전용 `SUPABASE_SERVICE_ROLE_KEY`, `SYNC_KBO_SECRET`, 개인 access token은 프론트 환경변수나 Git 추적 파일에 저장하지 마세요.

품질 검사와 프로덕션 빌드:

```bash
npm run lint
npm run build
npm run preview
```

## Supabase 설정

새 프로젝트는 Supabase SQL Editor에서 [`supabase/schema.sql`](./supabase/schema.sql)을 실행합니다. 기존 프로젝트에 games 구조만 추가할 때는 [`supabase/migrations/20260902_add_games.sql`](./supabase/migrations/20260902_add_games.sql)을 사용합니다.

스키마의 역할은 다음과 같습니다.

- `profiles`: 닉네임과 응원팀
- `attendance_records`: 사용자의 좌석, 동행인, 메모, 별점과 경기 snapshot
- `games`: 서버 collector가 관리하는 공식 경기 일정과 결과

RLS를 통해 사용자는 자신의 profile과 직관 기록만 접근하며, `games`는 로그인 사용자에게 읽기만 허용합니다.

## KBO 경기 데이터

브라우저가 KBO 웹사이트를 직접 호출하지 않습니다.

```text
KBO 공식 일정 → Supabase Edge Function collector → public.games → React 앱
```

collector는 `external_game_id`를 기준으로 upsert하므로 재실행 시 점수, 경기 상태, 시작 시간과 구장이 갱신됩니다. 배포, secret 설정, 동기화 방법은 [`docs/kbo-game-sync.md`](./docs/kbo-game-sync.md)를 참고하세요.

## 팀 로고

팀 이름, 컬러와 로고 경로는 [`src/data/teamThemes.ts`](./src/data/teamThemes.ts)에서 중앙 관리합니다. `public/images/teams/`의 파일은 현재 placeholder이며, 사용 권한이 확인된 공식 로고를 같은 파일명으로 교체하면 모든 화면에 반영됩니다. 프로젝트는 공식 로고를 자동 다운로드하거나 외부 URL로 hotlink하지 않습니다.

## 현재 MVP 상태

인증, 프로필 생성, 응원팀 설정, 직관 기록 CRUD, 실제 경기 선택, 경기 결과 반영, 통계와 캘린더가 구현되어 있습니다. 사진 업로드와 실제 구단 로고는 아직 포함하지 않습니다. 개발 환경에서는 일정 데이터가 없을 때만 `mockGames`가 홈 화면 fallback으로 사용됩니다.

## 주요 경로

- `/login`, `/signup`, `/setup/team`
- `/`
- `/records`, `/records/new`, `/records/:id`
- `/calendar`
- `/stats`
- `/profile`

## 향후 계획

- 사용 권한이 확인된 실제 구단 로고
- 직관 사진 및 티켓 이미지 업로드
- 구장 도장깨기
- 시즌 결산
- 공유용 직관 카드

## 배포 참고

앱은 `BrowserRouter`를 사용합니다. 배포 플랫폼에서 존재하지 않는 경로를 `/index.html`로 보내는 SPA rewrite를 설정해야 새로고침 시 각 route가 정상적으로 열립니다.
