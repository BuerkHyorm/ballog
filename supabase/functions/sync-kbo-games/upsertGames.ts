import type { SupabaseClient } from '@supabase/supabase-js'
import type { NormalizedKboGame } from './types.ts'

export async function upsertGames(client: SupabaseClient, games: NormalizedKboGame[]) {
  if (games.length === 0) return 0

  // Future schedules sometimes lack a KBO gameId and initially use Ballog's
  // deterministic fallback ID. Reconcile that row before the official ID appears.
  for (const game of games.filter((item) => /^\d{8}[A-Z0-9]+$/.test(item.external_game_id))) {
    let query = client.from('games').select('id, external_game_id').eq('date', game.date).eq('away_team', game.away_team).eq('home_team', game.home_team)
    query = game.start_time === null ? query.is('start_time', null) : query.eq('start_time', game.start_time)
    const { data, error } = await query
    if (error) throw error
    const existing = data?.length === 1 ? data[0] : null
    if (existing && existing.external_game_id !== game.external_game_id) {
      const { error: updateError } = await client.from('games').update({ external_game_id: game.external_game_id }).eq('id', existing.id)
      if (updateError) throw updateError
    }
  }

  // A repeated monthly sync updates mutable official fields (status, scores,
  // time and stadium) while preserving the stable games.id used by records.
  const { error } = await client.from('games').upsert(games, { onConflict: 'external_game_id', ignoreDuplicates: false })
  if (error) throw error
  return games.length
}
