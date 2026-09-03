import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { PageContainer } from '../components/common/PageContainer'
import { PageHeader } from '../components/common/PageHeader'
import { TeamLogo } from '../components/common/TeamLogo'
import { useRecords } from '../hooks/useRecords'
import { useTheme } from '../hooks/useTheme'
import type { AttendanceRecord } from '../types/record'
import { getTeamTheme } from '../data/teamThemes'
import { getOpponentTeam } from '../utils/recordOutcome'

const weekdays = ['월', '화', '수', '목', '금', '토', '일']
const outcomeLabel = { win: 'W', loss: 'L', draw: 'D', pending: '기록' }
const outcomeStyle = { win: 'text-blue-600', loss: 'text-red-500', draw: 'text-slate-500', pending: 'text-amber-600' }
const dateKey = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

function opponentOf(record: AttendanceRecord, favoriteTeam: AttendanceRecord['homeTeam']) {
  return getOpponentTeam(record, favoriteTeam) ?? record.awayTeam
}

export function CalendarPage() {
  const now = new Date()
  const navigate = useNavigate()
  const { favoriteTeam } = useTheme()
  const { records, isLoading, error, refetch } = useRecords()
  const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord[]>()
    for (const record of records) map.set(record.date, [...(map.get(record.date) ?? []), record])
    return map
  }, [records])
  const year = cursor.getFullYear(); const month = cursor.getMonth()
  const leading = (new Date(year, month, 1).getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((leading + days) / 7) * 7 }, (_, index) => index - leading + 1)
  const selectedRecords = selectedDate ? recordsByDate.get(selectedDate) ?? [] : []
  const moveMonth = (offset: number) => { setCursor(new Date(year, month + offset, 1)); setSelectedDate(null) }
  const selectDay = (date: string, dayRecords: AttendanceRecord[]) => {
    if (dayRecords.length === 1) navigate(`/records/${dayRecords[0].id}`)
    else if (dayRecords.length > 1) setSelectedDate(date)
  }

  return <PageContainer><PageHeader eyebrow="My calendar" title="직관 캘린더" description="야구장에 다녀온 날을 월별로 모아보세요." />
    {isLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => void refetch()} /> : <>
      <section className="card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6"><button aria-label="이전 달" onClick={() => moveMonth(-1)} className="calendar-arrow"><ChevronLeft /></button><h2 className="text-lg font-black">{year}년 {month + 1}월</h2><button aria-label="다음 달" onClick={() => moveMonth(1)} className="calendar-arrow"><ChevronRight /></button></div>
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">{weekdays.map((day) => <div key={day} className="py-2 text-center text-[11px] font-bold text-slate-400">{day}</div>)}</div>
        <div className="grid grid-cols-7">{cells.map((day, index) => {
          if (day < 1 || day > days) return <div key={`blank-${index}`} className="min-h-20 border-b border-r border-slate-100 bg-slate-50/40 sm:min-h-28" />
          const date = dateKey(year, month, day); const dayRecords = recordsByDate.get(date) ?? []; const preview = dayRecords[0]
          const isToday = date === dateKey(now.getFullYear(), now.getMonth(), now.getDate())
          return <button key={date} onClick={() => selectDay(date, dayRecords)} disabled={!dayRecords.length} className={`min-h-20 min-w-0 border-b border-r border-slate-100 p-1 text-left align-top sm:min-h-28 sm:p-2 ${dayRecords.length ? 'hover:bg-team-soft' : 'cursor-default'} ${selectedDate === date ? 'bg-team-soft' : 'bg-white'}`}><span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${isToday ? 'bg-team text-white' : 'text-slate-500'}`}>{day}</span>{preview && <div className="mt-1 flex min-w-0 flex-col items-center"><TeamLogo teamId={opponentOf(preview, favoriteTeam)} className="h-6 w-6 sm:h-8 sm:w-8" /><strong className={`text-[10px] sm:text-xs ${outcomeStyle[preview.result]}`}>{outcomeLabel[preview.result]}</strong>{dayRecords.length > 1 && <span className="text-[9px] font-bold text-slate-400">+{dayRecords.length - 1}</span>}</div>}</button>
        })}</div></section>
      {selectedDate && selectedRecords.length > 1 && <section className="card mt-5 p-5"><h2 className="mb-3 font-black">{Number(selectedDate.slice(5, 7))}월 {Number(selectedDate.slice(8, 10))}일 기록</h2><div className="space-y-2">{selectedRecords.map((record) => <Link key={record.id} to={`/records/${record.id}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 hover:bg-team-soft"><span className="flex items-center gap-2"><TeamLogo teamId={opponentOf(record, favoriteTeam)} className="h-8 w-8" /><span className="text-sm font-bold">{getTeamTheme(record.awayTeam).shortName} vs {getTeamTheme(record.homeTeam).shortName}</span></span><b className={outcomeStyle[record.result]}>{outcomeLabel[record.result]}</b></Link>)}</div></section>}
      {!records.length && <div className="mt-5"><EmptyState title="아직 캘린더가 비어 있어요" description="직관 기록을 추가하면 경기 날짜에 자동으로 표시됩니다." /></div>}
    </>}
  </PageContainer>
}
