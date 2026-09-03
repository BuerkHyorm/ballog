import type { BreakdownStat } from '../../utils/statistics'
import { TeamLogo } from '../common/TeamLogo'
import type { TeamId } from '../../types/team'

export function BreakdownTable({ items, showTeamLogo = false }: { items: BreakdownStat[]; showTeamLogo?: boolean }) {
  if (!items.length) return <p className="py-6 text-center text-sm text-slate-400">표시할 기록이 없습니다.</p>
  return <div className="divide-y divide-slate-100">{items.map((item) => <div key={item.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-2">{showTeamLogo && <TeamLogo teamId={item.key as TeamId} className="h-8 w-8" />}<div className="min-w-0"><p className="truncate text-sm font-bold text-slate-700">{item.label}</p><p className="text-[11px] text-slate-400">{item.total}경기 · {item.wins}승 {item.draws}무 {item.losses}패{item.pending ? ` · ${item.pending}기록` : ''}</p></div></div><strong className="text-sm text-team">{item.wins + item.losses ? `${item.winRate}%` : '-'}</strong></div>)}</div>
}
