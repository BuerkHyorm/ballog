import { Check, MapPin } from 'lucide-react'
import type { StadiumProgress } from '../../utils/stadiumProgress'
import { formatDate } from '../../utils/formatDate'

export function StadiumCard({ stadium }: { stadium: StadiumProgress }) {
  return <article className={`card p-5 ${stadium.visited ? 'ring-1 ring-team' : 'opacity-70'}`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-slate-400">{stadium.city}</p><h2 className="mt-1 font-black text-slate-900">{stadium.name}</h2></div><span className={`grid h-9 w-9 place-items-center rounded-full ${stadium.visited ? 'bg-team text-white' : 'bg-slate-100 text-slate-400'}`}>{stadium.visited ? <Check className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}</span></div>{stadium.visited ? <><div className="my-4 flex items-end justify-between"><strong className="text-2xl text-team">{stadium.visits}회</strong><span className="text-sm font-bold">{stadium.wins}승 {stadium.draws}무 {stadium.losses}패 · {stadium.winRate}%</span></div><div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500"><p>첫 방문<br /><b className="text-slate-700">{formatDate(stadium.firstVisit!)}</b></p><p>최근 방문<br /><b className="text-slate-700">{formatDate(stadium.latestVisit!)}</b></p></div></> : <p className="mt-7 text-sm text-slate-400">아직 방문 기록이 없어요.</p>}</article>
}
