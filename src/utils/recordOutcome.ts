import type { RecordOutcome } from '../types/record'
import type { TeamId } from '../types/team'

interface ScoreLine {
  homeTeam: TeamId
  awayTeam: TeamId
  homeScore: number
  awayScore: number
}

export function getOpponentTeam(game: Pick<ScoreLine, 'homeTeam' | 'awayTeam'>, favoriteTeam: TeamId): TeamId | null {
  if (game.homeTeam === favoriteTeam) return game.awayTeam
  if (game.awayTeam === favoriteTeam) return game.homeTeam
  return null
}

export function getTeamOutcome(game: ScoreLine, favoriteTeam: TeamId, isFinal: boolean): RecordOutcome {
  if (!isFinal || !getOpponentTeam(game, favoriteTeam)) return 'pending'
  if (game.homeScore === game.awayScore) return 'draw'
  const favoriteScore = game.homeTeam === favoriteTeam ? game.homeScore : game.awayScore
  const opponentScore = game.homeTeam === favoriteTeam ? game.awayScore : game.homeScore
  return favoriteScore > opponentScore ? 'win' : 'loss'
}
