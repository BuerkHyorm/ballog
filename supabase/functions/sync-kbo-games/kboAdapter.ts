import type { NormalizedKboGame, TeamId } from './types.ts'

const KBO_ORIGIN = 'https://www.koreabaseball.com'
const SCHEDULE_PAGE = `${KBO_ORIGIN}/Schedule/Schedule.aspx`
const SCHEDULE_ENDPOINT = `${KBO_ORIGIN}/ws/Schedule.asmx/GetScheduleList`
const USER_AGENT = 'Mozilla/5.0 (compatible; BallogScheduleSync/1.0)'

const TEAM_ID_BY_NAME: Record<string, TeamId> = { 두산: 'doosan', LG: 'lg', 한화: 'hanwha', KIA: 'kia', 삼성: 'samsung', 롯데: 'lotte', SSG: 'ssg', NC: 'nc', KT: 'kt', 키움: 'kiwoom' }

interface KboCell { Text?: unknown; Class?: unknown }
export interface RawKboGame { season: number; date: string; time: string | null; awayTeamName: string; homeTeamName: string; stadium: string | null; status: string; awayScore: number | null; homeScore: number | null; externalGameId: string | null; fallbackSequence: number }

export class KboCollectorError extends Error {
  readonly stage: 'session' | 'request' | 'response' | 'parser'
  readonly status?: number
  readonly responseSnippet?: string
  constructor(message: string, stage: 'session' | 'request' | 'response' | 'parser', status?: number, responseSnippet?: string) { super(message); this.stage = stage; this.status = status; this.responseSnippet = responseSnippet }
}

function cookieHeader(response: Response) {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }
  const setCookies = headers.getSetCookie?.() ?? [response.headers.get('set-cookie') ?? '']
  return setCookies.map((cookie) => cookie.split(';', 1)[0]).filter(Boolean).join('; ')
}

export async function fetchKboSchedule(year: number, month: number): Promise<unknown> {
  const pageResponse = await fetch(SCHEDULE_PAGE, { headers: { 'user-agent': USER_AGENT, accept: 'text/html' } })
  if (!pageResponse.ok) throw new KboCollectorError('KBO 일정 페이지 세션 요청 실패', 'session', pageResponse.status, (await pageResponse.text()).slice(0, 500))
  const cookies = cookieHeader(pageResponse)
  const body = new URLSearchParams({ leId: '1', srIdList: '0,9,6', seasonId: String(year), gameMonth: String(month).padStart(2, '0'), teamId: '' })
  const response = await fetch(SCHEDULE_ENDPOINT, { method: 'POST', headers: { 'user-agent': USER_AGENT, accept: 'application/json, text/javascript, */*; q=0.01', 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', origin: KBO_ORIGIN, referer: SCHEDULE_PAGE, 'x-requested-with': 'XMLHttpRequest', ...(cookies ? { cookie: cookies } : {}) }, body })
  const responseText = await response.text()
  if (!response.ok) throw new KboCollectorError('KBO 일정 API 요청 실패', 'request', response.status, responseText.slice(0, 500))
  try { return JSON.parse(responseText) as unknown }
  catch { throw new KboCollectorError('KBO 일정 API JSON 파싱 실패', 'response', response.status, responseText.slice(0, 500)) }
}

const cellText = (cell: KboCell) => typeof cell.Text === 'string' ? cell.Text : ''
const cellClass = (cell: KboCell) => typeof cell.Class === 'string' ? cell.Class : ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
const spanTexts = (html: string) => [...html.matchAll(/<span(?:\s+[^>]*)?>([^<]*)<\/span>/gi)].map((match) => stripHtml(match[1]))

function parseDate(value: string, year: number) {
  const match = value.match(/(\d{1,2})\.(\d{1,2})/)
  return match ? `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}` : null
}

function parseStatus(playHtml: string, relayHtml: string, note: string, hasScores: boolean) {
  const combined = `${stripHtml(playHtml)} ${stripHtml(relayHtml)} ${note}`
  if (/취소/.test(combined)) return 'cancelled'
  if (/연기/.test(combined)) return 'postponed'
  if (hasScores || stripHtml(relayHtml) === '리뷰' || /경기종료/.test(combined)) return 'completed'
  return 'scheduled'
}

export function parseKboScheduleResponse(payload: unknown, season: number): RawKboGame[] {
  if (!payload || typeof payload !== 'object' || !('rows' in payload) || !Array.isArray(payload.rows)) throw new KboCollectorError('KBO 응답에 rows 배열이 없습니다.', 'parser')
  const games: RawKboGame[] = []
  const fallbackCounts = new Map<string, number>()
  let currentDate: string | null = null
  for (const item of payload.rows) {
    if (!item || typeof item !== 'object' || !('row' in item) || !Array.isArray(item.row)) continue
    const cells = item.row.filter((cell): cell is KboCell => Boolean(cell) && typeof cell === 'object')
    const dayCell = cells.find((cell) => cellClass(cell) === 'day')
    if (dayCell) currentDate = parseDate(cellText(dayCell), season)
    const timeCell = cells.find((cell) => cellClass(cell) === 'time')
    const playCell = cells.find((cell) => cellClass(cell) === 'play')
    if (!currentDate || !timeCell || !playCell) continue
    const playHtml = cellText(playCell)
    const spans = spanTexts(playHtml)
    if (spans.length < 3) throw new KboCollectorError(`팀 정보를 해석하지 못했습니다: ${stripHtml(playHtml).slice(0, 120)}`, 'parser')
    const awayTeamName = spans[0]
    const homeTeamName = spans[spans.length - 1]
    const scores = spans.slice(1, -1).filter((value) => /^\d+$/.test(value)).map(Number)
    const time = stripHtml(cellText(timeCell)).match(/\d{1,2}:\d{2}/)?.[0]?.padStart(5, '0') ?? null
    const relayHtml = cells.map(cellText).find((text) => /gameId=/.test(text)) ?? ''
    const externalGameId = relayHtml.match(/[?&]gameId=([^&'"\s]+)/i)?.[1] ?? null
    const stadium = stripHtml(cellText(cells.at(-2) ?? {})) || null
    const note = stripHtml(cellText(cells.at(-1) ?? {}))
    const fallbackKey = `${season}-${currentDate}-${awayTeamName}-${homeTeamName}-${time ?? 'TBD'}`
    const fallbackSequence = fallbackCounts.get(fallbackKey) ?? 0
    fallbackCounts.set(fallbackKey, fallbackSequence + 1)
    games.push({ season, date: currentDate, time, awayTeamName, homeTeamName, stadium, status: parseStatus(playHtml, relayHtml, note, scores.length >= 2), awayScore: scores[0] ?? null, homeScore: scores[1] ?? null, externalGameId, fallbackSequence })
  }
  return games
}

export function normalizeKboGame(rawGame: RawKboGame): NormalizedKboGame {
  const awayTeam = TEAM_ID_BY_NAME[rawGame.awayTeamName]
  const homeTeam = TEAM_ID_BY_NAME[rawGame.homeTeamName]
  if (!awayTeam || !homeTeam) throw new KboCollectorError(`알 수 없는 팀 이름: ${rawGame.awayTeamName}/${rawGame.homeTeamName}`, 'parser')
  const fallbackId = [rawGame.season, rawGame.date.replaceAll('-', ''), awayTeam, homeTeam, rawGame.time?.replace(':', '') ?? 'TBD', rawGame.fallbackSequence].join('-')
  return { external_game_id: rawGame.externalGameId ?? fallbackId, season: rawGame.season, date: rawGame.date, start_time: rawGame.time, home_team: homeTeam, away_team: awayTeam, stadium: rawGame.stadium, status: rawGame.status, home_score: rawGame.homeScore, away_score: rawGame.awayScore, source: 'KBO' }
}
