import { BarChart3, CalendarDays, CirclePlus, Home, ListChecks, MapPinned, Sparkles, UserRound, type LucideIcon } from 'lucide-react'

interface NavigationItem { to: string; label: string; mobileLabel?: string; icon: LucideIcon; end: boolean; featured?: boolean; mobileHidden?: boolean }

export const navigationItems: NavigationItem[] = [
  { to: '/', label: '홈', icon: Home, end: true },
  { to: '/records', label: '기록', icon: ListChecks, end: false },
  { to: '/records/new', label: '기록 추가', mobileLabel: '추가', icon: CirclePlus, end: true, featured: true },
  { to: '/calendar', label: '캘린더', icon: CalendarDays, end: true },
  { to: '/stats', label: '통계', icon: BarChart3, end: true },
  { to: '/stadiums', label: '구장 도장깨기', icon: MapPinned, end: true, mobileHidden: true },
  { to: '/recap', label: '시즌 결산', icon: Sparkles, end: false, mobileHidden: true },
  { to: '/profile', label: '프로필', icon: UserRound, end: true, mobileHidden: true },
]
