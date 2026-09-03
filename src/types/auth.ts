import type { TeamId } from './team'

export interface UserProfile {
  userId: string
  nickname: string
  favoriteTeam: TeamId | null
}

export interface LoginCredentials {
  email: string
  password: string
  remember: boolean
}

export interface SignupCredentials {
  email: string
  password: string
  nickname: string
}

export interface SignupResult {
  requiresEmailConfirmation: boolean
}
