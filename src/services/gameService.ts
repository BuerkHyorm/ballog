import { getSupabaseClient } from '../lib/supabase'
import type { GameRow } from '../types/database'
import type { KboGame } from '../types/game'
import type { TeamId } from '../types/team'

const toGame = (row: GameRow): KboGame => ({
  id: row.id,
  externalGameId: row.external_game_id,
  season: row.season,
  date: row.date,
  time: row.start_time?.slice(0, 5) ?? null,
  homeTeam: row.home_team,
  awayTeam: row.away_team,
  stadium: row.stadium,
  status: row.status,
  homeScore: row.home_score,
  awayScore: row.away_score,
  source: row.source,
})

const today = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export async function getGamesByDate(date: string): Promise<KboGame[]> {
  const { data, error } = await getSupabaseClient().from('games').select('*').eq('date', date).order('start_time')
  if (error) throw error
  return data.map(toGame)
}

export async function getGameById(id: string): Promise<KboGame | null> {
  const { data, error } = await getSupabaseClient().from('games').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? toGame(data) : null
}

export async function getGamesByIds(ids: string[]): Promise<KboGame[]> {
  if (ids.length === 0) return []
  const { data, error } = await getSupabaseClient().from('games').select('*').in('id', ids)
  if (error) throw error
  return data.map(toGame)
}

export async function getUpcomingGames(team?: TeamId): Promise<KboGame[]> {
  let query = getSupabaseClient().from('games').select('*').gte('date', today()).or('status.is.null,status.eq.scheduled,status.eq.postponed').order('date').order('start_time').limit(10)
  if (team) query = query.or(`home_team.eq.${team},away_team.eq.${team}`)
  const { data, error } = await query
  if (error) throw error
  return data.map(toGame)
}

export async function getRecentGames(team?: TeamId): Promise<KboGame[]> {
  let query = getSupabaseClient().from('games').select('*').lte('date', today()).order('date', { ascending: false }).order('start_time', { ascending: false }).limit(10)
  if (team) query = query.or(`home_team.eq.${team},away_team.eq.${team}`)
  const { data, error } = await query
  if (error) throw error
  return data.map(toGame)
}
