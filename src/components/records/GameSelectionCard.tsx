import { Check, Clock, MapPin } from 'lucide-react'
import type { KboGame } from '../../types/game'
import { TeamLogo } from '../common/TeamLogo'
import { getTeamTheme } from '../../data/teamThemes'

export function GameSelectionCard({ game, selected, onSelect }: { game: KboGame; selected: boolean; onSelect: () => void }) {
  const away = getTeamTheme(game.awayTeam)
  const home = getTeamTheme(game.homeTeam)
  const hasScore = game.awayScore !== null && game.homeScore !== null
  return <button type="button" onClick={onSelect} className={`relative w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-team bg-team-soft ring-2 ring-team' : 'border-slate-200 bg-white hover:border-slate-300'}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><TeamLogo teamId={game.awayTeam} className="h-9 w-9" /><span className="text-sm font-bold">{away.shortName}</span></div><strong className="text-sm">{hasScore ? `${game.awayScore} : ${game.homeScore}` : 'VS'}</strong><div className="flex items-center gap-2"><span className="text-sm font-bold">{home.shortName}</span><TeamLogo teamId={game.homeTeam} className="h-9 w-9" /></div></div><div className="mt-3 flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-400"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{game.time ?? '시간 미정'}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{game.stadium ?? '구장 미정'}</span>{game.status && <span>{game.status}</span>}</div>{selected && <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-team text-white"><Check className="h-3 w-3" /></span>}</button>
}
