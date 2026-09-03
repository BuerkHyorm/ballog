import type { TeamId } from './team'

export interface Game {
  id: string
  date: string
  time: string
  homeTeam: TeamId
  awayTeam: TeamId
  stadium: string
  homeScore?: number
  awayScore?: number
}

export interface KboGame {
  id: string
  externalGameId: string | null
  season: number
  date: string
  time: string | null
  homeTeam: TeamId
  awayTeam: TeamId
  stadium: string | null
  status: string | null
  homeScore: number | null
  awayScore: number | null
  source: string
}
