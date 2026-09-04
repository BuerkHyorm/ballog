import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { PageContainer } from '../components/common/PageContainer'
import { PageHeader } from '../components/common/PageHeader'
import { StatCard } from '../components/common/StatCard'
import { RecapHighlights } from '../components/recap/RecapHighlights'
import { useRecords } from '../hooks/useRecords'
import { useAuth } from '../hooks/useAuth'
import { useSeasonRecordImages } from '../hooks/useSeasonRecordImages'
import { useTheme } from '../hooks/useTheme'
import { getAvailableSeasons, getSeasonRecap, getSeasonRecapTagline } from '../utils/seasonRecap'
import { ShareCardButton } from '../components/share/ShareCardButton'
import type { SeasonRecapShareCardData } from '../types/share'
import { formatDate } from '../utils/formatDate'

export function RecapPage() {
  const navigate = useNavigate(); const params = useParams(); const { favoriteTeam } = useTheme()
  const { user } = useAuth()
  const { records, isLoading, error, refetch } = useRecords()
  const seasons = useMemo(() => getAvailableSeasons(records), [records])
  const season = params.season && /^\d{4}$/.test(params.season) ? params.season : seasons[0] ?? String(new Date().getFullYear())
  const recap = getSeasonRecap(records, favoriteTeam, season); const stats = recap.statistics
  const seasonImages = useSeasonRecordImages(recap.records, user?.id)
  const highlights = [
    stats.mostVisitedStadium ? { label: 'Favorite Stadium', value: stats.mostVisitedStadium.label } : null,
    stats.mostSeenOpponent ? { label: 'Most Seen Opponent', value: stats.mostSeenOpponent.label } : null,
    stats.bestWinStreak > 0 ? { label: 'Longest Win Streak', value: `${stats.bestWinStreak}연승` } : null,
    recap.busiestMonth ? { label: 'Busiest Month', value: `${recap.busiestMonth.label} · ${recap.busiestMonth.total}경기` } : null,
  ].filter((item): item is { label: string; value: string } => item !== null)
  const shareData: SeasonRecapShareCardData = { fileName: `ballog-recap-${season}`, kind: 'season-recap', eyebrow: `${season} RECAP`, title: `${stats.total} Games`, headline: `${stats.wins}W · ${stats.draws}D · ${stats.losses}L · ${stats.winRate}%`, details: highlights.map(({ label, value }) => `${label} · ${value}`), footer: '야구장의 순간을 기록하다.', teamId: favoriteTeam, recap: { season, total: stats.total, wins: stats.wins, draws: stats.draws, losses: stats.losses, winRate: stats.winRate, highlights, firstDate: recap.firstDate ? formatDate(recap.firstDate) : '-', lastDate: recap.lastDate ? formatDate(recap.lastDate) : '-', tagline: getSeasonRecapTagline(recap) } }
  if (isLoading) return <PageContainer><LoadingState /></PageContainer>
  if (error) return <PageContainer><ErrorState message={error} onRetry={() => void refetch()} /></PageContainer>
    return <PageContainer><div className="flex flex-wrap items-start justify-between gap-3"><PageHeader eyebrow="Season recap" title={`${season} 시즌 결산`} description="한 시즌 동안 야구장과 함께한 순간을 돌아보세요." /><label className="filter-select"><select value={season} onChange={(event) => navigate(`/recap/${event.target.value}`)}>{seasons.length ? seasons.map((item) => <option key={item}>{item}</option>) : <option>{season}</option>}</select></label></div>{!recap.records.length ? <EmptyState title={`${season} 시즌 기록이 없어요`} description="직관 기록이 쌓이면 시즌 결산이 자동으로 만들어집니다." /> : <><section className="mb-6 rounded-3xl bg-gradient-team p-6 text-white md:p-8"><p className="text-sm font-bold text-white/60">{season} BALLOG RECAP</p><p className="mt-3 text-4xl font-black">{stats.total} Games</p><p className="mt-2 text-lg font-bold">{stats.wins}W · {stats.draws}D · {stats.losses}L</p><div className="mt-6 flex items-end justify-between"><p className="text-sm text-white/70">이번 시즌 총 {stats.total}번 야구장에 갔어요.</p><strong className="text-2xl">{stats.winRate}%</strong></div></section><div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard label="총 직관" value={stats.total} /><StatCard label="승 / 무 / 패" value={`${stats.wins}/${stats.draws}/${stats.losses}`} /><StatCard label="승률" value={`${stats.winRate}%`} highlight /><StatCard label="홈 / 원정" value={`${stats.home.total}/${stats.away.total}`} /></div><RecapHighlights recap={recap} /><section className="card mt-6 p-5"><h2 className="font-black">월별 직관</h2><div className="mt-4 space-y-3">{stats.byMonth.map((month) => <div key={month.key} className="flex items-center gap-3"><span className="w-10 text-xs font-bold text-slate-500">{month.label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-team" style={{ width: `${(month.total / Math.max(...stats.byMonth.map((item) => item.total))) * 100}%` }} /></div><b className="w-8 text-right text-sm">{month.total}</b></div>)}</div></section><div className="mt-5"><ShareCardButton data={shareData} label="결산 카드 만들기" seasonImages={seasonImages.images} seasonImagesLoading={seasonImages.isLoading} seasonImagesError={seasonImages.error} /></div></>}</PageContainer>
}
