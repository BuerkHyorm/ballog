import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AppReadyRoute() {
  const { isLoading, profile, initializationError, signOut } = useAuth()
  if (isLoading) return <div className="grid min-h-screen place-items-center text-sm font-semibold text-slate-500">Ballog를 불러오는 중...</div>
  if (initializationError) return <div className="grid min-h-screen place-items-center bg-slate-50 p-5 text-center"><div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><h1 className="text-xl font-black">프로필을 불러오지 못했어요</h1><p className="mt-2 text-sm text-slate-500">{initializationError}</p><p className="mt-2 text-xs text-slate-400">Supabase SQL과 환경변수 설정을 확인해주세요.</p><button onClick={() => void signOut()} className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">로그인 화면으로</button></div></div>
  return profile?.favoriteTeam ? <Outlet /> : <Navigate to="/setup/team" replace />
}
