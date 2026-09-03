import { Outlet } from 'react-router-dom'
import { Header } from '../components/common/Header'
import { DesktopSidebar } from '../components/navigation/DesktopSidebar'
import { MobileBottomNav } from '../components/navigation/MobileBottomNav'

export function AppLayout() {
  return <div className="min-h-screen bg-app"><DesktopSidebar /><div className="lg:pl-64"><Header /><main><Outlet /></main></div><MobileBottomNav /></div>
}
