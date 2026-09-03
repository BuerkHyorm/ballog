import { UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

export function Header() {
  const { theme } = useTheme()
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-team font-black text-white shadow-team">B</span><span className="text-lg font-black tracking-tight">BALLOG</span></Link>
        <div className="flex items-center gap-3"><span className="hidden text-xs font-bold text-slate-500 sm:block">{theme.teamName}</span><Link to="/profile" aria-label="프로필" className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600"><UserRound className="h-4 w-4" /></Link></div>
      </div>
    </header>
  )
}
