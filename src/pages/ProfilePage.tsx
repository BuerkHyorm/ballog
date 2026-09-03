import { Check, ChevronRight, LogOut, Moon, Palette } from 'lucide-react'
import { PageContainer } from '../components/common/PageContainer'
import { PageHeader } from '../components/common/PageHeader'
import { teamThemes } from '../data/teamThemes'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { TeamLogo } from '../components/common/TeamLogo'
import { useState } from 'react'

export function ProfilePage() {
  const { favoriteTeam, setFavoriteTeam, theme } = useTheme()
  const { user, profile, updateFavoriteTeam, signOut } = useAuth()
  const [error, setError] = useState('')
  const [savingTeam, setSavingTeam] = useState<typeof favoriteTeam | null>(null)
  const changeTeam = async (teamId: typeof favoriteTeam) => { setSavingTeam(teamId); setError(''); try { await updateFavoriteTeam(teamId); setFavoriteTeam(teamId) } catch (caught) { setError(caught instanceof Error ? caught.message : '응원팀 변경에 실패했습니다.') } finally { setSavingTeam(null) } }
  return <PageContainer className="max-w-3xl"><PageHeader eyebrow="My ballog" title="프로필 & 설정" />
    <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-team p-6 text-white shadow-xl shadow-team"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/90 p-2"><TeamLogo teamId={favoriteTeam} className="h-full w-full" /></div><div><p className="text-xl font-black">{profile?.nickname}</p><p className="mt-1 text-sm text-white/65">{user?.email}</p><p className="mt-1 text-xs text-white/55">{theme.teamName} 팬 · 2026 시즌</p></div></div><div className="mt-6 rounded-2xl bg-white/10 p-4"><p className="text-xs font-semibold text-white/60">테마 미리보기</p><div className="mt-3 flex gap-2">{[theme.primaryColor, theme.secondaryColor, theme.accentColor].map((color) => <span key={color} className="h-7 flex-1 rounded-lg border border-white/15" style={{ backgroundColor: color }} />)}</div></div></section>
    <section className="card p-5 md:p-7"><div className="mb-5 flex items-center gap-2"><Palette className="h-5 w-5 text-team" /><div><h2 className="font-bold">응원팀 변경</h2><p className="text-xs text-slate-400">선택 즉시 계정과 앱 테마에 저장됩니다.</p></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{teamThemes.map((team) => <button disabled={savingTeam !== null} key={team.id} onClick={() => void changeTeam(team.id)} className={`relative flex items-center gap-3 rounded-2xl border p-3 text-left transition disabled:opacity-60 ${favoriteTeam === team.id ? 'border-team bg-team-soft ring-1 ring-team' : 'border-slate-200 hover:bg-slate-50'}`}><TeamLogo teamId={team.id} className="h-9 w-9" /><span className="text-sm font-bold">{team.shortName}</span>{favoriteTeam === team.id && <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-team" />}</button>)}</div>{error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}</section>
    <section className="card mt-5 divide-y divide-slate-100 px-5"><button className="setting-row"><span><Moon />화면 설정</span><span>시스템 <ChevronRight /></span></button><button className="setting-row"><span>시즌</span><span>2026 <ChevronRight /></span></button><button onClick={() => void signOut()} className="setting-row text-red-500 lg:hidden"><span><LogOut />로그아웃</span></button></section>
  </PageContainer>
}
