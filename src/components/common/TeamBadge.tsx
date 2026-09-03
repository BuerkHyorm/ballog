import { getTeamTheme } from '../../data/teamThemes'
import type { TeamId } from '../../types/team'
import { TeamLogo } from './TeamLogo'

export function TeamBadge({ teamId, compact = false }: { teamId: TeamId; compact?: boolean }) {
  const team = getTeamTheme(teamId)
  return (
    <span className="inline-flex items-center gap-2 font-bold text-slate-800">
      <span className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} grid shrink-0 place-items-center rounded-xl bg-white/90 p-1 shadow-sm`}><TeamLogo teamId={teamId} className="h-full w-full" /></span>
      {!compact && <span>{team.shortName}</span>}
    </span>
  )
}
