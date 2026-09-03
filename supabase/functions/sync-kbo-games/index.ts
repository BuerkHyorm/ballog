import { createClient } from '@supabase/supabase-js'
import { fetchKboSchedule, KboCollectorError, normalizeKboGame, parseKboScheduleResponse } from './kboAdapter.ts'
import { upsertGames } from './upsertGames.ts'

Deno.serve(async (request) => {
  try {
    const url = new URL(request.url)
    const now = new Date()
    const year = Number(url.searchParams.get('year') ?? now.getUTCFullYear())
    const month = Number(url.searchParams.get('month') ?? now.getUTCMonth() + 1)
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return Response.json({ error: 'year와 month가 올바르지 않습니다.' }, { status: 400 })
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const syncSecret = Deno.env.get('SYNC_KBO_SECRET')
    if (!supabaseUrl || !serviceRoleKey || !syncSecret) return Response.json({ error: 'Edge Function 서버 환경변수가 없습니다.' }, { status: 500 })
    if (request.headers.get('x-sync-secret') !== syncSecret) return Response.json({ error: '동기화 호출 권한이 없습니다.' }, { status: 401 })

    const response = await fetchKboSchedule(year, month)
    const games = parseKboScheduleResponse(response, year).map(normalizeKboGame)
    const count = await upsertGames(createClient(supabaseUrl, serviceRoleKey), games)
    return Response.json({ year, month, upserted: count })
  } catch (error) {
    if (error instanceof KboCollectorError) console.error('KBO collector failed', { stage: error.stage, status: error.status, message: error.message, responseSnippet: error.responseSnippet })
    else console.error('KBO collector failed', error)
    return Response.json({ error: 'KBO 경기 동기화에 실패했습니다. 서버 로그를 확인해주세요.' }, { status: 502 })
  }
})
