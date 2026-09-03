import { Outlet } from 'react-router-dom'
import { isSupabaseConfigured, supabaseConfigurationError } from '../lib/supabase'

export function AuthLayout() {
  return <div className="min-h-screen bg-slate-50"><div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" /><div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl" /></div><main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-5 px-5 py-10">{!isSupabaseConfigured && <div role="alert" className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><strong className="block">Supabase 설정이 필요합니다</strong><span>{supabaseConfigurationError}</span></div>}<Outlet /></main></div>
}
