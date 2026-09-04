import { stadiums, findStadium, type StadiumDefinition } from '../data/stadiums'
import type { AttendanceRecord } from '../types/record'

export interface StadiumProgress extends StadiumDefinition {
  visited: boolean
  visits: number
  firstVisit: string | null
  latestVisit: string | null
  wins: number
  draws: number
  losses: number
  pending: number
  winRate: number
}

export function getStadiumProgress(records: AttendanceRecord[]): StadiumProgress[] {
  return stadiums.map((stadium) => {
    const visits = records.filter((record) => findStadium(record.stadium)?.id === stadium.id).sort((a, b) => a.date.localeCompare(b.date))
    const wins = visits.filter((record) => record.result === 'win').length
    const draws = visits.filter((record) => record.result === 'draw').length
    const losses = visits.filter((record) => record.result === 'loss').length
    return { ...stadium, visited: visits.length > 0, visits: visits.length, firstVisit: visits[0]?.date ?? null, latestVisit: visits.at(-1)?.date ?? null, wins, draws, losses, pending: visits.length - wins - draws - losses, winRate: wins + losses ? Math.round((wins / (wins + losses)) * 1000) / 10 : 0 }
  })
}
