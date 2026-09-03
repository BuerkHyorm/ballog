export const TEAM_IDS = ['doosan', 'lg', 'hanwha', 'kia', 'samsung', 'lotte', 'ssg', 'nc', 'kt', 'kiwoom'] as const
export type TeamId = typeof TEAM_IDS[number]

export interface TeamTheme {
  id: TeamId
  teamName: string
  shortName: string
  logoPath: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
}
