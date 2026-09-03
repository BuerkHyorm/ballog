import { NavLink } from 'react-router-dom'
import { navigationItems } from './navigationItems'

export function MobileBottomNav() {
  return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"><div className="flex h-18 items-center justify-around px-1">{navigationItems.filter((item) => !item.mobileHidden).map(({ to, label, mobileLabel, icon: Icon, end, featured }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `group flex min-w-0 flex-1 flex-col items-center gap-1 text-[10px] font-semibold transition ${isActive ? 'text-team' : 'text-slate-400'}`}>{({ isActive }) => <><span className={featured ? '-mt-6 grid h-13 w-13 place-items-center rounded-2xl bg-team text-white shadow-lg shadow-team' : ''}><Icon className={`${featured ? 'h-6 w-6' : 'h-5 w-5'} ${isActive && !featured ? 'stroke-[2.5]' : ''}`} /></span><span>{mobileLabel ?? label}</span></>}</NavLink>)}</div></nav>
}
