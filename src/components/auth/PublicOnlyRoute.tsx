import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, profile } = useAuth()
  if (isLoading) return <div className="grid min-h-screen place-items-center text-sm font-semibold text-slate-500">Ballog를 불러오는 중...</div>
  if (!isAuthenticated) return <Outlet />
  return <Navigate to={profile?.favoriteTeam ? '/' : '/setup/team'} replace />
}
