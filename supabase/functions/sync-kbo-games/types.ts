export const TEAM_IDS = ['doosan', 'lg', 'hanwha', 'kia', 'samsung', 'lotte', 'ssg', 'nc', 'kt', 'kiwoom'] as const
export type TeamId = typeof TEAM_IDS[number]

export interface NormalizedKboGame {
  external_game_id: string
  season: number
  date: string
  start_time: string | null
  home_team: TeamId
  away_team: TeamId
  stadium: string | null
  status: string | null
  home_score: number | null
  away_score: number | null
  source: 'KBO'
}
