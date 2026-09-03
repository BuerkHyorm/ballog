import type { Game } from './game'

export type GameResult = 'win' | 'draw' | 'loss'
export type RecordOutcome = GameResult | 'pending'

export interface AttendanceRecord extends Required<Omit<Game, 'homeScore' | 'awayScore'>> {
  gameId?: string | null
  homeScore: number
  awayScore: number
  seat: string
  companions: string[]
  comment: string
  rating: number
  result: RecordOutcome
  gameStatus?: string | null
  isFinal?: boolean
  photoUrl?: string
}

export interface CreateAttendanceRecordInput {
  gameId?: string | null
  date: string
  homeTeam: AttendanceRecord['homeTeam']
  awayTeam: AttendanceRecord['awayTeam']
  stadium: string
  startTime: string
  homeScore: number
  awayScore: number
  seat: string
  companion: string
  memo: string
  rating: number
}
