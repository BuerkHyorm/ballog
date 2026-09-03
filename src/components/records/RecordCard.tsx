import { ChevronRight, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AttendanceRecord } from '../../types/record'
import { formatDate } from '../../utils/formatDate'
import { TeamBadge } from '../common/TeamBadge'

const resultStyle = { win: 'bg-blue-50 text-blue-700', draw: 'bg-slate-100 text-slate-600', loss: 'bg-red-50 text-red-600', pending: 'bg-amber-50 text-amber-700' }
const resultLabel = { win: '승', draw: '무', loss: '패', pending: '기록' }

export function RecordCard({ record }: { record: AttendanceRecord }) {
  const displayResult = record.result === 'pending' && record.gameStatus === 'cancelled' ? '취소' : record.result === 'pending' && record.gameStatus === 'postponed' ? '연기' : resultLabel[record.result]
  return (
    <Link to={`/records/${record.id}`} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-400">{formatDate(record.date)}</span><span className={`rounded-lg px-2.5 py-1 text-xs font-black ${resultStyle[record.result]}`}>{displayResult}</span></div>
      <div className="my-5 flex items-center justify-center gap-4"><TeamBadge teamId={record.awayTeam} /><strong className="text-2xl tracking-tight">{record.awayScore}<span className="mx-2 text-slate-300">:</span>{record.homeScore}</strong><TeamBadge teamId={record.homeTeam} /></div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-4"><div><p className="line-clamp-1 text-sm font-semibold text-slate-700">{record.comment}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3" />{record.stadium}<span className="mx-1">·</span><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{record.rating}</p></div><ChevronRight className="h-5 w-5 shrink-0 text-slate-300" /></div>
    </Link>
  )
}
