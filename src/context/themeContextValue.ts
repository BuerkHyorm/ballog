import { createContext } from 'react'
import type { TeamId, TeamTheme } from '../types/team'

export interface ThemeContextValue {
  favoriteTeam: TeamId
  theme: TeamTheme
  setFavoriteTeam: (team: TeamId) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
