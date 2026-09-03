import { getTeamTheme } from '../data/teamThemes'
import type { AttendanceRecord, RecordOutcome } from '../types/record'
import type { TeamId } from '../types/team'
import { getOpponentTeam } from './recordOutcome'

export interface BreakdownStat {
  key: string
  label: string
  total: number
  wins: number
  draws: number
  losses: number
  pending: number
  winRate: number
}

interface Streak { type: 'win' | 'loss'; count: number }

export interface AttendanceStatistics {
  total: number; completed: number; wins: number; draws: number; losses: number; pending: number; winRate: number
  home: BreakdownStat; away: BreakdownStat; byStadium: BreakdownStat[]; byOpponent: BreakdownStat[]
  byMonth: BreakdownStat[]; byWeekday: BreakdownStat[]; currentStreak: Streak | null; bestWinStreak: number
  mostVisitedStadium: BreakdownStat | null; mostSeenOpponent: BreakdownStat | null
  bestStadium: BreakdownStat | null; bestOpponent: BreakdownStat | null
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const rate = (wins: number, losses: number) => wins + losses ? Math.round((wins / (wins + losses)) * 1000) / 10 : 0

function summarize(key: string, label: string, records: AttendanceRecord[]): BreakdownStat {
  const wins = records.filter((record) => record.result === 'win').length
  const draws = records.filter((record) => record.result === 'draw').length
  const losses = records.filter((record) => record.result === 'loss').length
  return { key, label, total: records.length, wins, draws, losses, pending: records.length - wins - draws - losses, winRate: rate(wins, losses) }
}

function groupBy(records: AttendanceRecord[], keyOf: (record: AttendanceRecord) => string, labelOf: (key: string) => string = (key) => key) {
  const groups = new Map<string, AttendanceRecord[]>()
  for (const record of records) {
    const key = keyOf(record)
    groups.set(key, [...(groups.get(key) ?? []), record])
  }
  return [...groups.entries()].map(([key, group]) => summarize(key, labelOf(key), group))
}

const byMostGames = (a: BreakdownStat, b: BreakdownStat) => b.total - a.total || b.wins - a.wins || a.label.localeCompare(b.label, 'ko')
const byBestRate = (a: BreakdownStat, b: BreakdownStat) => b.winRate - a.winRate || b.total - a.total || a.label.localeCompare(b.label, 'ko')

function getStreaks(records: AttendanceRecord[]) {
  const outcomes = [...records]
    .filter((record): record is AttendanceRecord & { result: Exclude<RecordOutcome, 'pending'> } => record.isFinal === true && record.result !== 'pending')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .map((record) => record.result)
  let bestWinStreak = 0
  let runningWins = 0
  for (const outcome of outcomes) {
    runningWins = outcome === 'win' ? runningWins + 1 : 0
    bestWinStreak = Math.max(bestWinStreak, runningWins)
  }
  const latest = outcomes.at(-1)
  if (latest !== 'win' && latest !== 'loss') return { currentStreak: null, bestWinStreak }
  let count = 0
  for (let index = outcomes.length - 1; index >= 0 && outcomes[index] === latest; index -= 1) count += 1
  return { currentStreak: { type: latest, count } satisfies Streak, bestWinStreak }
}

export const getStatistics = (records: AttendanceRecord[], favoriteTeam: TeamId, minimumBestSample = 3): AttendanceStatistics => {
  const overall = summarize('all', '전체', records)
  const byStadium = groupBy(records, (record) => record.stadium).sort(byMostGames)
  const teamRecords = records.filter((record) => getOpponentTeam(record, favoriteTeam) !== null)
  const byOpponent = groupBy(teamRecords, (record) => getOpponentTeam(record, favoriteTeam)!, (teamId) => getTeamTheme(teamId).teamName).sort(byMostGames)
  const byMonth = groupBy(records, (record) => record.date.slice(0, 7), (month) => `${Number(month.slice(5, 7))}월`).sort((a, b) => a.key.localeCompare(b.key))
  const byWeekday = groupBy(records, (record) => String(new Date(`${record.date}T12:00:00`).getDay()), (day) => `${WEEKDAYS[Number(day)]}요일`).sort((a, b) => ((Number(a.key) + 6) % 7) - ((Number(b.key) + 6) % 7))
  const bestCandidate = (items: BreakdownStat[]) => items.filter((item) => item.wins + item.losses >= minimumBestSample).sort(byBestRate)[0] ?? null
  return {
    total: overall.total, completed: overall.wins + overall.draws + overall.losses, wins: overall.wins, draws: overall.draws,
    losses: overall.losses, pending: overall.pending, winRate: overall.winRate,
    home: summarize('home', '홈 경기', records.filter((record) => record.homeTeam === favoriteTeam)),
    away: summarize('away', '원정 경기', records.filter((record) => record.awayTeam === favoriteTeam)),
    byStadium, byOpponent, byMonth, byWeekday, ...getStreaks(records),
    mostVisitedStadium: byStadium[0] ?? null, mostSeenOpponent: byOpponent[0] ?? null,
    bestStadium: bestCandidate(byStadium), bestOpponent: bestCandidate(byOpponent),
  }
}
