import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppReadyRoute } from './components/auth/AppReadyRoute'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute'
import { TeamSetupRoute } from './components/auth/TeamSetupRoute'
import { LoadingState } from './components/common/LoadingState'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'

const HomePage = lazy(() => import('./pages/HomePage').then(({ HomePage: page }) => ({ default: page })))
const RecordsPage = lazy(() => import('./pages/RecordsPage').then(({ RecordsPage: page }) => ({ default: page })))
const AddRecordPage = lazy(() => import('./pages/AddRecordPage').then(({ AddRecordPage: page }) => ({ default: page })))
const RecordDetailPage = lazy(() => import('./pages/RecordDetailPage').then(({ RecordDetailPage: page }) => ({ default: page })))
const CalendarPage = lazy(() => import('./pages/CalendarPage').then(({ CalendarPage: page }) => ({ default: page })))
const StatsPage = lazy(() => import('./pages/StatsPage').then(({ StatsPage: page }) => ({ default: page })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(({ ProfilePage: page }) => ({ default: page })))
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(({ LoginPage: page }) => ({ default: page })))
const SignupPage = lazy(() => import('./pages/auth/SignupPage').then(({ SignupPage: page }) => ({ default: page })))
const TeamSetupPage = lazy(() => import('./pages/auth/TeamSetupPage').then(({ TeamSetupPage: page }) => ({ default: page })))

function RouteFallback() {
  return <div className="mx-auto max-w-5xl p-5 md:p-8"><LoadingState label="화면을 준비하는 중..." /></div>
}

export default function App() {
  return <Suspense fallback={<RouteFallback />}><Routes>
    <Route element={<AuthLayout />}>
      <Route element={<PublicOnlyRoute />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<TeamSetupRoute />}><Route path="setup/team" element={<TeamSetupPage />} /></Route>
      </Route>
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route element={<AppReadyRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="records/new" element={<AddRecordPage />} />
          <Route path="records/:id" element={<RecordDetailPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>
}
