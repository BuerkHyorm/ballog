import { BarChart3, CalendarRange, Flame, MapPin, Plane, Target, Trophy, UsersRound } from 'lucide-react'
import { BreakdownTable } from '../components/stats/BreakdownTable'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { PageContainer } from '../components/common/PageContainer'
import { PageHeader } from '../components/common/PageHeader'
import { StatCard } from '../components/common/StatCard'
import { useRecords } from '../hooks/useRecords'
import { useTheme } from '../hooks/useTheme'
import { getStatistics } from '../utils/statistics'

const season = String(new Date().getFullYear())

function Highlight({ label, value, note }: { label: string; value: string; note?: string }) {
  return <div className="rounded-2xl bg-team-soft p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-lg font-black text-team">{value}</p>{note && <p className="mt-1 text-[11px] text-slate-400">{note}</p>}</div>
}

export function StatsPage() {
  const { favoriteTeam } = useTheme()
  const { records: allRecords, isLoading, error, refetch } = useRecords()
  const records = allRecords.filter((record) => record.date.startsWith(season))
  const stats = getStatistics(records, favoriteTeam)
  if (isLoading) return <PageContainer><PageHeader eyebrow="Season report" title={`${season} 직관 통계`} /><LoadingState /></PageContainer>
  if (error) return <PageContainer><PageHeader eyebrow="Season report" title={`${season} 직관 통계`} /><ErrorState message={error} onRetry={() => void refetch()} /></PageContainer>

  return <PageContainer><PageHeader eyebrow="Season report" title={`${season} 직관 통계`} description="공식 경기 결과를 기준으로 다시 보는 나의 야구 시즌" />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard label="총 직관" value={`${stats.total}경기`} subtext={stats.pending ? `결과 대기 ${stats.pending}경기` : undefined} icon={BarChart3} /><StatCard label="승 / 무 / 패" value={`${stats.wins}/${stats.draws}/${stats.losses}`} icon={Trophy} /><StatCard label="직관 승률" value={`${stats.winRate}%`} subtext="무승부 제외" icon={Target} highlight /><StatCard label="최고 연승" value={`${stats.bestWinStreak}연승`} icon={Flame} /></div>
    {stats.currentStreak && <section className="my-6 rounded-3xl bg-gradient-team p-5 text-white"><p className="text-xs font-bold text-white/65">최근 직관 흐름</p><p className="mt-1 text-2xl font-black">{stats.currentStreak.count}{stats.currentStreak.type === 'win' ? '연승 중 🔥' : '연패 중'}</p></section>}
    <div className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4"><Highlight label="홈 경기 승률" value={`${stats.home.winRate}%`} note={`${stats.home.total}경기`} /><Highlight label="원정 경기 승률" value={`${stats.away.winRate}%`} note={`${stats.away.total}경기`} /><Highlight label="가장 많이 방문" value={stats.mostVisitedStadium?.label ?? '-'} note={stats.mostVisitedStadium ? `${stats.mostVisitedStadium.total}경기` : undefined} /><Highlight label="가장 많이 본 상대" value={stats.mostSeenOpponent?.label ?? '-'} note={stats.mostSeenOpponent ? `${stats.mostSeenOpponent.total}경기` : undefined} /><Highlight label="최고 승률 구장" value={stats.bestStadium?.label ?? '-'} note={stats.bestStadium ? `${stats.bestStadium.winRate}% · ${stats.bestStadium.wins + stats.bestStadium.losses}경기` : '최소 3경기 필요'} /><Highlight label="최고 승률 상대" value={stats.bestOpponent?.label ?? '-'} note={stats.bestOpponent ? `${stats.bestOpponent.winRate}% · ${stats.bestOpponent.wins + stats.bestOpponent.losses}경기` : '최소 3경기 필요'} /></div>
    <div className="grid gap-5 md:grid-cols-2"><section className="card p-5 md:p-6"><h2 className="dashboard-title"><MapPin />구장별 기록</h2><BreakdownTable items={stats.byStadium} /></section><section className="card p-5 md:p-6"><h2 className="dashboard-title"><UsersRound />상대팀별 기록</h2><BreakdownTable items={stats.byOpponent} showTeamLogo /></section><section className="card p-5 md:p-6"><h2 className="dashboard-title"><CalendarRange />월별 기록</h2><BreakdownTable items={stats.byMonth} /></section><section className="card p-5 md:p-6"><h2 className="dashboard-title"><Plane />요일별 기록</h2><BreakdownTable items={stats.byWeekday} /></section></div>
  </PageContainer>
}
