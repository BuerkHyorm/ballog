import { MapPinned } from 'lucide-react'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { PageContainer } from '../components/common/PageContainer'
import { PageHeader } from '../components/common/PageHeader'
import { StadiumCard } from '../components/stadiums/StadiumCard'
import { useRecords } from '../hooks/useRecords'
import { getStadiumProgress } from '../utils/stadiumProgress'

export function StadiumsPage() {
  const { records, isLoading, error, refetch } = useRecords()
  const progress = getStadiumProgress(records)
  const visited = progress.filter((stadium) => stadium.visited).length
  return <PageContainer><PageHeader eyebrow="Stadium tour" title="구장 도장깨기" description="직관 기록을 남기면 방문 도장이 자동으로 채워집니다." />{isLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => void refetch()} /> : <><section className="mb-6 overflow-hidden rounded-3xl bg-gradient-team p-6 text-white"><MapPinned className="h-7 w-7" /><p className="mt-4 text-sm font-semibold text-white/65">KBO 주요 구장 방문</p><p className="mt-1 text-3xl font-black">{visited} / {progress.length} 구장 방문</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{ width: `${(visited / progress.length) * 100}%` }} /></div></section><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{progress.map((stadium) => <StadiumCard key={stadium.id} stadium={stadium} />)}</div></>}</PageContainer>
}
