import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { LoginCredentials, SignupCredentials, SignupResult, UserProfile } from '../types/auth'
import type { TeamId } from '../types/team'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  initializationError: string
  signIn: (credentials: LoginCredentials) => Promise<void>
  signUp: (credentials: SignupCredentials) => Promise<SignupResult>
  completeTeamSetup: (teamId: TeamId) => Promise<void>
  updateFavoriteTeam: (teamId: TeamId) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
