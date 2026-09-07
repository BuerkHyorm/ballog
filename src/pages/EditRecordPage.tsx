import { Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { PageContainer } from '../components/common/PageContainer'
import { PageHeader } from '../components/common/PageHeader'
import { PrimaryButton } from '../components/common/PrimaryButton'
import { AttendanceDetailsFields, Field, RecordGameFields } from '../components/records/RecordFormSections'
import { useAuth } from '../hooks/useAuth'
import { useRecord } from '../hooks/useRecord'
import { useTheme } from '../hooks/useTheme'
import { updateRecord } from '../services/recordService'
import type { AttendanceRecord } from '../types/record'
import type { TeamId } from '../types/team'

function EditRecordForm({ record, userId }: { record: AttendanceRecord; userId: string }) {
  const navigate = useNavigate()
  const [rating, setRating] = useState(record.rating)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const homeTeam = form.get('homeTeam') as TeamId
    const awayTeam = form.get('awayTeam') as TeamId
    if (homeTeam === awayTeam) { setError('홈팀과 원정팀은 달라야 합니다.'); return }
    setSaving(true); setError('')
    try {
      await updateRecord(record.id, userId, {
        date: String(form.get('date') || ''),
        startTime: String(form.get('startTime') || ''),
        homeTeam,
        awayTeam,
        stadium: String(form.get('stadium') || ''),
        homeScore: Number(form.get('homeScore')),
        awayScore: Number(form.get('awayScore')),
        seat: String(form.get('seat') || ''),
        companion: String(form.get('companion') || ''),
        memo: String(form.get('memo') || ''),
        rating,
      })
      navigate(`/records/${record.id}`, { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '기록 수정에 실패했습니다.')
      setSaving(false)
    }
  }

  return <form onSubmit={submit} className="space-y-5">
    <section className="card p-5 md:p-7"><Field label="경기 날짜"><input name="date" type="date" defaultValue={record.date} required /></Field>{record.gameId && <p className="mt-3 text-xs text-slate-500">공식 경기와 연결된 기록입니다. 최신 경기 결과는 KBO 경기 데이터를 우선 표시합니다.</p>}</section>
    <RecordGameFields manualMode selectedGame={null} initialRecord={record} />
    <AttendanceDetailsFields rating={rating} onRatingChange={setRating} initialRecord={record} />
    <p className="text-xs text-slate-500">기존 사진과 티켓은 유지됩니다. 이미지는 상세 화면에서 관리할 수 있습니다.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
    <div className="flex flex-wrap gap-3"><PrimaryButton type="submit" disabled={saving}><Save className="h-4 w-4" />{saving ? '수정 내용 저장 중...' : '수정 내용 저장'}</PrimaryButton><Link to={`/records/${record.id}`} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-bold text-slate-600">취소</Link></div>
  </form>
}

export function EditRecordPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { favoriteTeam } = useTheme()
  const { record, isLoading, error } = useRecord(id, user?.id, favoriteTeam)

  if (isLoading) return <PageContainer><LoadingState /></PageContainer>
  if (error) return <PageContainer><ErrorState message={error} /></PageContainer>
  if (!record || !user) return <PageContainer><ErrorState message="수정할 기록을 찾을 수 없거나 접근 권한이 없습니다." /></PageContainer>
  return <PageContainer className="max-w-3xl"><PageHeader eyebrow="Edit memory" title="직관 기록 수정" description="기존 기록의 경기 정보와 관람 내용을 수정하세요." /><EditRecordForm record={record} userId={user.id} /></PageContainer>
}
