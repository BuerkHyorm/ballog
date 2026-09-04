import type { AttendanceRecord } from '../types/record'
import type { TeamId } from '../types/team'
import { getStatistics } from './statistics'

export function getAvailableSeasons(records: AttendanceRecord[]) {
  return [...new Set(records.map((record) => record.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a))
}

export function getSeasonRecap(records: AttendanceRecord[], favoriteTeam: TeamId, season: string) {
  const seasonRecords = records.filter((record) => record.date.startsWith(`${season}-`)).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  const statistics = getStatistics(seasonRecords, favoriteTeam)
  const busiestMonth = [...statistics.byMonth].sort((a, b) => b.total - a.total || a.key.localeCompare(b.key))[0] ?? null
  return {
    season,
    records: seasonRecords,
    statistics,
    busiestMonth,
    firstDate: seasonRecords[0]?.date ?? null,
    lastDate: seasonRecords.at(-1)?.date ?? null,
  }
}

export function getSeasonRecapTagline(recap: ReturnType<typeof getSeasonRecap>) {
  const { statistics } = recap
  if (statistics.bestWinStreak >= 4) return `가장 뜨거웠던 순간, ${statistics.bestWinStreak}연승`
  if (statistics.completed >= 5 && statistics.winRate >= 65) return '야구장에 가면 이겼던 시즌'
  const stadium = statistics.mostVisitedStadium
  if (stadium && stadium.total >= 3 && stadium.total / statistics.total >= 0.4) return `올해 가장 자주 향한 곳, ${stadium.label}`
  return undefined
}
