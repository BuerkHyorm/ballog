# KBO 경기 데이터 동기화

Ballog는 브라우저에서 KBO 사이트를 호출하지 않습니다.

```text
KBO 공식 일정 페이지
→ sync-kbo-games Edge Function
→ public.games 월 단위 upsert
→ React gameService 조회
```

## 확인된 공식 요청

collector는 먼저 아래 일정 페이지를 GET하여 `ASP.NET_SessionId` 쿠키를 받습니다.

```text
https://www.koreabaseball.com/Schedule/Schedule.aspx
```

그 다음 같은 쿠키와 Referer를 사용해 아래 endpoint를 form POST합니다.

```text
https://www.koreabaseball.com/ws/Schedule.asmx/GetScheduleList
```

확인된 정규시즌 payload:

```text
leId=1
srIdList=0,9,6
seasonId=2026
gameMonth=09
teamId=
```

응답은 JSON 객체의 `rows[].row[]`에 셀을 담습니다. parser는 `Class`가 `day`, `time`, `play`, `relay`인 셀과 행 끝의 구장·비고 셀을 읽습니다. `play`의 HTML 조각에서 원정팀, 홈팀과 점수를 읽고 `relay` 링크의 `gameId`를 추출합니다.

KBO `gameId`가 없는 미래 일정은 시즌·날짜·원정팀·홈팀·시간·동일 조합 순번으로 fallback ID를 생성합니다. 순번이 포함되므로 동일 시간 더블헤더도 충돌하지 않습니다. 이후 공식 `gameId`가 생기면 `upsertGames`가 같은 일정의 fallback 행을 먼저 조정합니다.

## Edge Function 실행

1. `supabase/migrations/20260902_add_games.sql`을 적용합니다.
2. Edge Function 서버 환경에 충분히 긴 `SYNC_KBO_SECRET`을 설정합니다.
3. `sync-kbo-games`를 배포합니다.
4. 서버 또는 예약 실행 환경에서 다음 형태로 호출합니다.

```text
POST /functions/v1/sync-kbo-games?year=2026&month=9
x-sync-secret: configured-server-secret
```

`SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 Edge Function 서버 환경에서만 사용합니다. `VITE_` 환경변수에 service role key를 넣지 마세요.

## 로컬 서버 실행

서버 전용 환경변수를 현재 셸에 안전하게 설정한 경우 다음 명령으로 수집과 upsert를 실행할 수 있습니다.

```bash
npm run sync:kbo:local -- 2026 9
```

로컬 스크립트는 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`를 요구합니다. service role key를 `.env.local`이나 Git 추적 파일에 저장하지 마세요.

## 저장 확인

Supabase SQL Editor에서 다음 쿼리로 2026년 9월 데이터를 확인합니다.

```sql
select date, start_time, away_team, home_team, stadium, status
from public.games
where date between '2026-09-01' and '2026-09-30'
order by date, start_time;
```

## 예약 실행과 요청 제한

앱은 항상 Supabase만 조회합니다. KBO 요청은 collector에서 월 단위로만 수행합니다. 일정 발표 후 1회, 변경 가능성이 있는 기간에는 하루 몇 차례처럼 보수적으로 예약하고, 공식 사이트의 이용 조건과 허용 범위를 준수해 간격을 결정하세요.

collector 오류 시 서버 로그에는 단계(`session`, `request`, `response`, `parser`), HTTP status, 최대 500자의 응답 일부가 기록됩니다. 쿠키와 secret은 기록하지 않으며 클라이언트 응답에는 일반 오류 메시지만 반환합니다.
