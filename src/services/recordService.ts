import { getSupabaseClient } from '../lib/supabase'
import type { AttendanceRecordRow } from '../types/database'
import type { AttendanceRecord, CreateAttendanceRecordInput } from '../types/record'
import type { TeamId } from '../types/team'
import type { KboGame } from '../types/game'
import { getGameById, getGamesByIds } from './gameService'
import { getTeamOutcome } from '../utils/recordOutcome'

const toRecord = (row: AttendanceRecordRow, favoriteTeam: TeamId, game?: KboGame | null): AttendanceRecord => {
  const effectiveRow: AttendanceRecordRow = { ...row, date: game?.date ?? row.date, start_time: game?.time ?? row.start_time, home_team: game?.homeTeam ?? row.home_team, away_team: game?.awayTeam ?? row.away_team, home_score: game?.homeScore ?? row.home_score, away_score: game?.awayScore ?? row.away_score, stadium: game?.stadium ?? row.stadium }
  const isFinal = !game || (game.status === 'completed' && game.homeScore !== null && game.awayScore !== null)
  return {
    id: effectiveRow.id,
    gameId: row.game_id,
    date: effectiveRow.date,
    time: effectiveRow.start_time.slice(0, 5),
    homeTeam: effectiveRow.home_team,
    awayTeam: effectiveRow.away_team,
    homeScore: effectiveRow.home_score,
    awayScore: effectiveRow.away_score,
    stadium: effectiveRow.stadium,
    seat: row.seat ?? '',
    companions: row.companion ? row.companion.split(',').map((name) => name.trim()).filter(Boolean) : [],
    comment: row.memo ?? '',
    rating: row.rating,
    result: getTeamOutcome({ homeTeam: effectiveRow.home_team, awayTeam: effectiveRow.away_team, homeScore: effectiveRow.home_score, awayScore: effectiveRow.away_score }, favoriteTeam, isFinal),
    gameStatus: game?.status ?? null,
    isFinal,
  }
}

export async function getRecords(userId: string, favoriteTeam: TeamId): Promise<AttendanceRecord[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('attendance_records').select('*').eq('user_id', userId).order('date', { ascending: false }).order('start_time', { ascending: false })
  if (error) throw error
  const gameIds = [...new Set(data.map((row) => row.game_id).filter((id): id is string => Boolean(id)))]
  const gamesById = new Map((await getGamesByIds(gameIds)).map((game) => [game.id, game]))
  return data
    .map((row) => toRecord(row, favoriteTeam, row.game_id ? gamesById.get(row.game_id) : null))
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
}

export async function getRecordById(id: string, userId: string, favoriteTeam: TeamId): Promise<AttendanceRecord | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('attendance_records').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (!data) return null
  const game = data.game_id ? await getGameById(data.game_id) : null
  return toRecord(data, favoriteTeam, game)
}

export async function createRecord(userId: string, input: CreateAttendanceRecordInput): Promise<string> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('attendance_records').insert({
    user_id: userId,
    game_id: input.gameId ?? null,
    date: input.date,
    home_team: input.homeTeam,
    away_team: input.awayTeam,
    stadium: input.stadium,
    start_time: input.startTime,
    home_score: input.homeScore,
    away_score: input.awayScore,
    seat: input.seat || null,
    companion: input.companion || null,
    memo: input.memo || null,
    rating: input.rating,
  }).select('id').single()
  if (error) throw error
  return data.id
}

export async function updateRecord(id: string, userId: string, input: Partial<CreateAttendanceRecordInput>) {
  const supabase = getSupabaseClient()
  const updates: DatabaseRecordUpdate = {}
  if (input.date !== undefined) updates.date = input.date
  if (input.homeTeam !== undefined) updates.home_team = input.homeTeam
  if (input.awayTeam !== undefined) updates.away_team = input.awayTeam
  if (input.stadium !== undefined) updates.stadium = input.stadium
  if (input.startTime !== undefined) updates.start_time = input.startTime
  if (input.homeScore !== undefined) updates.home_score = input.homeScore
  if (input.awayScore !== undefined) updates.away_score = input.awayScore
  if (input.seat !== undefined) updates.seat = input.seat || null
  if (input.companion !== undefined) updates.companion = input.companion || null
  if (input.memo !== undefined) updates.memo = input.memo || null
  if (input.rating !== undefined) updates.rating = input.rating
  const { error } = await supabase.from('attendance_records').update(updates).eq('id', id).eq('user_id', userId)
  if (error) throw error
}

type DatabaseRecordUpdate = Partial<Omit<AttendanceRecordRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export async function deleteRecord(id: string, userId: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('attendance_records').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}
