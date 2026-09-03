import { createClient } from '@supabase/supabase-js'
import { fetchKboSchedule, normalizeKboGame, parseKboScheduleResponse } from '../supabase/functions/sync-kbo-games/kboAdapter.ts'
import { upsertGames } from '../supabase/functions/sync-kbo-games/upsertGames.ts'

const year = Number(process.argv[2])
const month = Number(process.argv[3])
const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) throw new Error('사용법: npm run sync:kbo:local -- 2026 9')
if (!supabaseUrl || !serviceRoleKey) throw new Error('서버 환경변수 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.')

const response = await fetchKboSchedule(year, month)
const games = parseKboScheduleResponse(response, year).map(normalizeKboGame)
const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
const count = await upsertGames(client, games)
console.log(`KBO ${year}-${String(month).padStart(2, '0')}: ${count} games upserted`)
