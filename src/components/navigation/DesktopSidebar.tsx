import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { navigationItems } from './navigationItems'

export function DesktopSidebar() {
  const { profile, signOut } = useAuth(); const { theme } = useTheme()
  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-white px-5 py-7 lg:flex"><div className="flex items-center gap-3 px-2"><span className="grid h-10 w-10 place-items-center rounded-xl bg-team font-black text-white shadow-team">B</span><div><strong className="block tracking-tight">BALLOG</strong><span className="text-[11px] text-slate-400">KBO ARCHIVE</span></div></div><nav className="mt-10 space-y-2">{navigationItems.map(({ to, label, icon: Icon, end, featured }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition ${isActive ? 'bg-team text-white shadow-md shadow-team' : featured ? 'border border-slate-200 text-slate-700 hover:border-slate-300' : 'text-slate-500 hover:bg-slate-100'}`}><Icon className="h-5 w-5" />{label}</NavLink>)}</nav><div className="mt-auto border-t border-slate-100 pt-5"><div className="mb-4 flex items-center gap-3 px-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-team-soft text-xs font-black text-team">{profile?.nickname.slice(0, 1)}</span><div className="min-w-0"><p className="truncate text-sm font-bold">{profile?.nickname}</p><p className="truncate text-[11px] text-slate-400">{theme.teamName}</p></div></div><button onClick={() => void signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-50 hover:text-slate-700"><LogOut className="h-4 w-4" />로그아웃</button></div></aside>
}
