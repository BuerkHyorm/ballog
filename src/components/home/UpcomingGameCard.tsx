import { CalendarDays, MapPin } from 'lucide-react'
import type { Game } from '../../types/game'
import type { KboGame } from '../../types/game'
import { formatDate } from '../../utils/formatDate'
import { TeamBadge } from '../common/TeamBadge'

export function UpcomingGameCard({ game }: { game: Game | KboGame }) {
  return <div className="card overflow-hidden"><div className="bg-gradient-team px-5 py-4 text-white"><p className="text-xs font-bold text-white/70">NEXT GAME</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4" />{formatDate(game.date)} · {game.time ?? '시간 미정'}</p></div><div className="p-5"><div className="flex items-center justify-center gap-5"><TeamBadge teamId={game.awayTeam} /><span className="text-xs font-black text-slate-300">VS</span><TeamBadge teamId={game.homeTeam} /></div><p className="mt-5 flex items-center justify-center gap-1 text-xs text-slate-400"><MapPin className="h-3.5 w-3.5" />{game.stadium ?? '구장 미정'}</p></div></div>
}
