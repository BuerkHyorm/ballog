import { CalendarDays, MapPin, Pencil, Star, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { PageContainer } from '../components/common/PageContainer'
import { TeamBadge } from '../components/common/TeamBadge'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { getRecordById } from '../services/recordService'
import type { AttendanceRecord } from '../types/record'
import { formatDate } from '../utils/formatDate'
import { RecordImageGallery } from '../components/photos/RecordImageGallery'
import { useRecordImages } from '../hooks/useRecordImages'
import { ShareCardButton } from '../components/share/ShareCardButton'
import { getTeamTheme } from '../data/teamThemes'

export function RecordDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { favoriteTeam } = useTheme()
  const location = useLocation()
  const [record, setRecord] = useState<AttendanceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { images, isLoading: imagesLoading, error: imagesError, remove: removeImage } = useRecordImages(id, user?.id)

  useEffect(() => {
    if (!id || !user) return
    let active = true
    void getRecordById(id, user.id, favoriteTeam).then((data) => { if (active) setRecord(data) }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : '기록을 불러오지 못했습니다.') }).finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [favoriteTeam, id, user])

  if (isLoading) return <PageContainer><LoadingState /></PageContainer>
  if (error) return <PageContainer><ErrorState message={error} /></PageContainer>
  if (!record) return <PageContainer><div className="card p-8 text-center"><h1 className="text-xl font-bold">기록을 찾을 수 없어요.</h1><p className="mt-2 text-sm text-slate-500">삭제되었거나 접근 권한이 없는 기록입니다.</p><Link to="/records" className="mt-3 inline-block text-sm font-bold text-team">목록으로 돌아가기</Link></div></PageContainer>

  const result = { win: 'WIN', draw: 'DRAW', loss: 'LOSS', pending: record.gameStatus === 'cancelled' ? 'CANCELLED' : record.gameStatus === 'postponed' ? 'POSTPONED' : 'RECORDED' }[record.result]
  const uploadWarning = (location.state as { uploadWarning?: string } | null)?.uploadWarning
  const shareData = { fileName: `ballog-${record.date}`, eyebrow: formatDate(record.date), title: `${getTeamTheme(record.awayTeam).shortName} ${record.awayScore} : ${record.homeScore} ${getTeamTheme(record.homeTeam).shortName}`, headline: record.stadium, details: [`경기 결과 · ${result}`, `나의 별점 · ${'★'.repeat(record.rating)}`, record.seat ? `좌석 · ${record.seat}` : ''].filter(Boolean), footer: record.comment || undefined, teamId: favoriteTeam }
  return <PageContainer className="max-w-3xl"><div className="mb-5 flex items-center justify-between"><Link to="/records" className="text-sm font-bold text-slate-500">← 기록 목록</Link><button className="flex items-center gap-1 text-sm font-bold text-slate-400"><Pencil className="h-4 w-4" />수정</button></div>
    {uploadWarning && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{uploadWarning}</p>}
    <article className="card overflow-hidden"><div className="bg-gradient-team p-6 text-white md:p-9"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-white/70">{formatDate(record.date, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">{result}</span></div><div className="my-8 flex items-center justify-center gap-5 md:gap-10"><TeamBadge teamId={record.awayTeam} /><p className="text-4xl font-black">{record.awayScore}<span className="mx-3 text-white/35">:</span>{record.homeScore}</p><TeamBadge teamId={record.homeTeam} /></div><p className="flex justify-center gap-2 text-sm text-white/70"><MapPin className="h-4 w-4" />{record.stadium}</p></div>
      <div className="p-6 md:p-8"><div className="flex gap-1">{[1,2,3,4,5].map((value) => <Star key={value} className={`h-5 w-5 ${value <= record.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</div><blockquote className="my-5 text-xl font-bold leading-8 text-slate-900">“{record.comment || '한줄평이 없습니다.'}”</blockquote><div className="grid gap-3 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3"><p className="detail-item"><CalendarDays />{record.time} 경기</p><p className="detail-item"><MapPin />{record.seat || '좌석 미입력'}</p><p className="detail-item"><Users />{record.companions.length ? record.companions.join(', ') : '혼자'}</p></div></div>
    </article><RecordImageGallery images={images} isLoading={imagesLoading} error={imagesError} onDelete={removeImage} /><div className="mt-5"><ShareCardButton data={shareData} /></div></PageContainer>
}
