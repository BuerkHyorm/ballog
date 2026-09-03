import { getSupabaseClient } from '../lib/supabase'
import type { UserProfile } from '../types/auth'
import type { ProfileRow } from '../types/database'
import type { TeamId } from '../types/team'

const toProfile = (row: ProfileRow): UserProfile => ({ userId: row.id, nickname: row.nickname, favoriteTeam: row.favorite_team })

export async function getProfile(userId: string): Promise<UserProfile> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return toProfile(data)
}

export async function updateFavoriteTeam(userId: string, favoriteTeam: TeamId): Promise<UserProfile> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('profiles').update({ favorite_team: favoriteTeam }).eq('id', userId).select().single()
  if (error) throw error
  return toProfile(data)
}
