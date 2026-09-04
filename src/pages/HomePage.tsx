import { ArrowRight, CalendarCheck, MapPinned, Plus, Sparkles, Target, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageContainer } from '../components/common/PageContainer'
import { PrimaryButton } from '../components/common/PrimaryButton'
import { StatCard } from '../components/common/StatCard'
import { UpcomingGameCard } from '../components/home/UpcomingGameCard'
import { RecordCard } from '../components/records/RecordCard'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { TeamLogo } from '../components/common/TeamLogo'
import { upcomingGames } from '../data/mockGames'
import { useRecords } from '../hooks/useRecords'
import { useTheme } from '../hooks/useTheme'
import { getStatistics } from '../utils/statistics'
import { useUpcomingGames } from '../hooks/useUpcomingGames'

export function HomePage() {
  const { theme, favoriteTeam } = useTheme()
  const { records, isLoading, error, refetch } = useRecords()
  const { games: scheduledGames, isLoading: gamesLoading, error: gamesError } = useUpcomingGames(favoriteTeam)
  const nextGame = scheduledGames[0] ?? (import.meta.env.DEV ? upcomingGames[0] : null)
  const season = String(new Date().getFullYear())
  const seasonRecords = records.filter((record) => record.date.startsWith(season))
  const stats = getStatistics(seasonRecords, favoriteTeam)
  return (
    <PageContainer>
      <section className="relative mb-7 overflow-hidden rounded-[28px] bg-gradient-team p-6 text-white shadow-xl shadow-team md:p-9">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[32px] border-white/5" />
        <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/90 p-1.5"><TeamLogo teamId={favoriteTeam} className="h-full w-full" /></span><div><p className="text-xs font-semibold text-white/60">MY TEAM</p><p className="font-black">{theme.teamName}</p></div></div><p className="mt-5 text-sm font-semibold text-white/65">{season} 나의 직관 시즌</p><h1 className="mt-2 text-3xl font-black tracking-tight">함께한 모든 순간을<br />기록해요</h1>
        <div className="mt-7 flex items-end justify-between"><div><p className="text-xs text-white/60">이번 시즌 직관</p><p className="mt-1 text-4xl font-black">{stats.total}<span className="ml-1 text-base font-semibold">경기</span></p></div><PrimaryButton to="/records/new" className="bg-white !text-team shadow-none"><Plus className="h-4 w-4" />기록 추가</PrimaryButton></div>
      </section>
      <section className="mb-4 rounded-3xl border border-slate-200/80 bg-white p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold text-slate-400">나의 직관</p><p className="mt-1 text-2xl font-black">{stats.total}경기 <span className="text-base text-slate-500">· {stats.wins}승 {stats.draws}무 {stats.losses}패</span></p></div><strong className="text-xl text-team">승률 {stats.winRate}%</strong></div>{stats.currentStreak && <p className="mt-3 text-sm font-bold text-slate-600">최근 직관 {stats.currentStreak.count}{stats.currentStreak.type === 'win' ? '연승 중 🔥' : '연패 중'}</p>}</section>
      <div className="mb-4 grid grid-cols-2 gap-3"><Link to="/stadiums" className="card flex items-center gap-3 p-4 transition hover:border-team"><span className="grid h-10 w-10 place-items-center rounded-xl bg-team-soft text-team"><MapPinned className="h-5 w-5" /></span><span><b className="block text-sm">구장 도장깨기</b><small className="text-slate-400">방문 현황 보기</small></span></Link><Link to={`/recap/${season}`} className="card flex items-center gap-3 p-4 transition hover:border-team"><span className="grid h-10 w-10 place-items-center rounded-xl bg-team-soft text-team"><Sparkles className="h-5 w-5" /></span><span><b className="block text-sm">시즌 결산</b><small className="text-slate-400">{season} 돌아보기</small></span></Link></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard label="승리" value={`${stats.wins}승`} icon={Trophy} /><StatCard label="무 / 패" value={`${stats.draws}무 ${stats.losses}패`} icon={CalendarCheck} /><StatCard label="직관 승률" value={`${stats.winRate}%`} subtext="무승부 제외" icon={Target} highlight /><StatCard label="홈 / 원정" value={`${stats.home.total} / ${stats.away.total}`} subtext="경기" /></div>
      <div className="mt-9 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"><section><div className="section-title"><h2>최근 직관 기록</h2><Link to="/records">전체 보기 <ArrowRight /></Link></div>{isLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => void refetch()} /> : seasonRecords.length ? <div className="space-y-3">{seasonRecords.slice(0, 3).map((record) => <RecordCard key={record.id} record={record} />)}</div> : <EmptyState title="첫 기록을 남겨보세요" description="직관한 경기를 추가하면 여기에 표시됩니다." />}</section><section><div className="section-title"><h2>예정 경기</h2></div>{gamesLoading ? <LoadingState label="예정 경기를 불러오는 중..." /> : nextGame ? <UpcomingGameCard game={nextGame} /> : <EmptyState title="예정 경기가 없어요" description={gamesError || '등록된 다음 경기 일정이 없습니다.'} />}</section></div>
    </PageContainer>
  )
}
