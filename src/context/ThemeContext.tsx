import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getTeamTheme } from '../data/teamThemes'
import { useAuth } from '../hooks/useAuth'
import type { TeamId } from '../types/team'
import { ThemeContext } from './themeContextValue'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile, isAuthenticated } = useAuth()
  const [localFavoriteTeam, setFavoriteTeam] = useState<TeamId>('doosan')
  const favoriteTeam = profile?.favoriteTeam ?? localFavoriteTeam
  const theme = useMemo(() => isAuthenticated ? getTeamTheme(favoriteTeam) : { ...getTeamTheme('doosan'), primaryColor: '#0F172A', secondaryColor: '#334155', accentColor: '#64748B' }, [favoriteTeam, isAuthenticated])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--team-primary', theme.primaryColor)
    root.style.setProperty('--team-secondary', theme.secondaryColor)
    root.style.setProperty('--team-accent', theme.accentColor)
    root.style.setProperty('--team-text', theme.textColor)
  }, [favoriteTeam, theme])

  return <ThemeContext.Provider value={{ favoriteTeam, theme, setFavoriteTeam }}>{children}</ThemeContext.Provider>
}
