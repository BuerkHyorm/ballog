import type { AuthError, Session } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import type { LoginCredentials, SignupCredentials } from '../types/auth'

function getAuthErrorMessage(error: AuthError) {
  if (error.code === 'invalid_credentials') return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (error.code === 'email_not_confirmed') return '이메일 인증을 완료한 후 로그인해주세요.'
  if (error.code === 'user_already_exists') return '이미 가입된 이메일입니다.'
  if (error.code === 'weak_password') return '더 안전한 비밀번호를 사용해주세요.'
  if (error.code === 'over_request_rate_limit') return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
  return error.message
}

export async function getCurrentSession() {
  if (!isSupabaseConfigured) return null
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(getAuthErrorMessage(error))
  return data.session
}

export async function signIn(credentials: LoginCredentials): Promise<Session> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email: credentials.email, password: credentials.password })
  if (error) throw new Error(getAuthErrorMessage(error))
  if (!data.session) throw new Error('로그인 세션을 생성하지 못했습니다.')
  return data.session
}

export async function signUp(credentials: SignupCredentials) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: { data: { nickname: credentials.nickname } },
  })
  if (error) throw new Error(getAuthErrorMessage(error))
  return data
}

export async function signOut() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(getAuthErrorMessage(error))
}
