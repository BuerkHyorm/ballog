import { Filter } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { PageContainer } from '../components/common/PageContainer'
import { PageHeader } from '../components/common/PageHeader'
import { RecordCard } from '../components/records/RecordCard'
import { useRecords } from '../hooks/useRecords'
import type { GameResult } from '../types/record'

export function RecordsPage() {
  const [season, setSeason] = useState('2026')
  const [result, setResult] = useState<GameResult | 'all'>('all')
  const { records: allRecords, isLoading, error, refetch } = useRecords()
  const records = useMemo(() => allRecords.filter((record) => record.date.startsWith(season) && (result === 'all' || record.result === result)), [allRecords, season, result])
  return <PageContainer><PageHeader eyebrow="My archive" title="직관 기록" description="구장에서 함께한 모든 순간을 모아보세요." />
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1"><label className="filter-select"><Filter className="h-4 w-4" /><select value={season} onChange={(event) => setSeason(event.target.value)}><option>2026</option><option>2025</option></select></label>{([['all', '전체'], ['win', '승리'], ['draw', '무승부'], ['loss', '패배']] as const).map(([value, label]) => <button key={value} onClick={() => setResult(value)} className={`filter-chip ${result === value ? 'active' : ''}`}>{label}</button>)}</div>
    {isLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => void refetch()} /> : records.length ? <div className="grid gap-4 md:grid-cols-2">{records.map((record) => <RecordCard key={record.id} record={record} />)}</div> : <EmptyState title="기록이 없어요" description="조건을 바꾸거나 새로운 직관 기록을 추가해 보세요." />}
  </PageContainer>
}
