import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)
const missingVariables = [!supabaseUrl && 'VITE_SUPABASE_URL', !supabasePublishableKey && 'VITE_SUPABASE_PUBLISHABLE_KEY'].filter(Boolean)
export const supabaseConfigurationError = `Supabase 연결 정보가 없습니다. .env.local에 ${missingVariables.join(', ')} 값을 입력한 뒤 개발 서버를 다시 시작해주세요.`

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabasePublishableKey)
  : null

export function getSupabaseClient() {
  if (!supabase) throw new Error(supabaseConfigurationError)
  return supabase
}
