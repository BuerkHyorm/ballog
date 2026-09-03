import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import { getCurrentSession, signIn as signInWithSupabase, signOut as signOutFromSupabase, signUp as signUpWithSupabase } from '../services/authService'
import { getProfile, updateFavoriteTeam as updateProfileTeam } from '../services/profileService'
import type { LoginCredentials, SignupCredentials, UserProfile } from '../types/auth'
import type { TeamId } from '../types/team'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [initializationError, setInitializationError] = useState('')

  const applySession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession)
    setUser(nextSession?.user ?? null)
    if (!nextSession?.user) {
      setProfile(null)
      setIsLoading(false)
      return
    }
    try {
      setInitializationError('')
      setProfile(await getProfile(nextSession.user.id))
    } catch (error) {
      setProfile(null)
      setInitializationError(error instanceof Error ? error.message : '프로필을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    let active = true
    void getCurrentSession().then((currentSession) => {
      if (active) void applySession(currentSession)
    }).catch(() => {
      if (active) setIsLoading(false)
    })

    const { data: { subscription } } = getSupabaseClient().auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => { if (active) void applySession(nextSession) }, 0)
    })

    return () => { active = false; subscription.unsubscribe() }
  }, [applySession])

  const signIn = async (credentials: LoginCredentials) => {
    setIsLoading(true); setInitializationError('')
    try { await applySession(await signInWithSupabase(credentials)) } catch (error) { setIsLoading(false); throw error }
  }

  const signUp = async (credentials: SignupCredentials) => {
    setIsLoading(true); setInitializationError('')
    try {
      const result = await signUpWithSupabase(credentials)
      if (result.session) await applySession(result.session)
      else setIsLoading(false)
      return { requiresEmailConfirmation: !result.session }
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const updateFavoriteTeam = async (teamId: TeamId) => {
    if (!user) throw new Error('로그인이 필요합니다.')
    const nextProfile = await updateProfileTeam(user.id, teamId)
    setProfile(nextProfile)
  }

  const signOut = async () => {
    await signOutFromSupabase()
    setSession(null); setUser(null); setProfile(null)
    setInitializationError('')
  }

  return <AuthContext.Provider value={{ user, session, profile, isAuthenticated: Boolean(session), isLoading, initializationError, signIn, signUp, completeTeamSetup: updateFavoriteTeam, updateFavoriteTeam, signOut }}>{children}</AuthContext.Provider>
}
