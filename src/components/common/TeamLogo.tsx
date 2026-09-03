import { getTeamTheme } from '../../data/teamThemes'
import type { TeamId } from '../../types/team'

export function TeamLogo({ teamId, className = 'h-10 w-10' }: { teamId: TeamId; className?: string }) {
  const team = getTeamTheme(teamId)
  return <img src={team.logoPath} alt={`${team.teamName} 로고`} className={`${className} shrink-0 object-contain`} />
}
