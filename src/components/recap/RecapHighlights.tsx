import { CalendarDays, Flame, MapPin, Trophy, UsersRound } from 'lucide-react'
import type { ReturnTypeOfSeasonRecap } from '../../types/recap'
import { formatDate } from '../../utils/formatDate'

function Highlight({ icon: Icon, label, value, note }: { icon: typeof Trophy; label: string; value: string; note?: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><Icon className="h-5 w-5 text-team" /><p className="mt-3 text-xs font-semibold text-slate-400">{label}</p><p className="mt-1 font-black text-slate-800">{value}</p>{note && <p className="mt-1 text-[11px] text-slate-400">{note}</p>}</div>
}

export function RecapHighlights({ recap }: { recap: ReturnTypeOfSeasonRecap }) {
  const { statistics: stats } = recap
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-3"><Highlight icon={MapPin} label="올해 가장 자주 간 구장" value={stats.mostVisitedStadium?.label ?? '-'} note={stats.mostVisitedStadium ? `${stats.mostVisitedStadium.total}회 방문` : undefined} /><Highlight icon={UsersRound} label="가장 많이 만난 상대" value={stats.mostSeenOpponent?.label ?? '-'} note={stats.mostSeenOpponent ? `${stats.mostSeenOpponent.total}경기` : undefined} /><Highlight icon={Flame} label="최고 직관 연승" value={`${stats.bestWinStreak}연승`} /><Highlight icon={CalendarDays} label="가장 많이 직관한 달" value={recap.busiestMonth?.label ?? '-'} note={recap.busiestMonth ? `${recap.busiestMonth.total}경기` : undefined} /><Highlight icon={Trophy} label="첫 직관일" value={recap.firstDate ? formatDate(recap.firstDate) : '-'} /><Highlight icon={Trophy} label="마지막 직관일" value={recap.lastDate ? formatDate(recap.lastDate) : '-'} /></div>
}
