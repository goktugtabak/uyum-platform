import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { useProfile } from './contexts/ProfileContext'
import { AppShell } from './components/layout/AppShell'

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { hasProfile } = useProfile()
  if (!hasProfile) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function NotFound() {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <p className="text-lg font-heading mb-4">Sayfa bulunamadı.</p>
      <Link to="/" className="text-uyum-purple underline hover:text-uyum-blue">
        Ana sayfaya dön
      </Link>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={
            <RequireProfile>
              <DashboardPage />
            </RequireProfile>
          }
        />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/match"
          element={
            <RequireProfile>
              <MatchSportPage />
            </RequireProfile>
          }
        />
        <Route
          path="/map"
          element={
            <RequireProfile>
              <FacilityMapPage />
            </RequireProfile>
          }
        />
        <Route
          path="/facility/:id"
          element={
            <RequireProfile>
              <FacilityDetailPage />
            </RequireProfile>
          }
        />
        <Route
          path="/exercises"
          element={
            <RequireProfile>
              <ExerciseLibraryPage />
            </RequireProfile>
          }
        />
        <Route
          path="/events"
          element={
            <RequireProfile>
              <EventListPage />
            </RequireProfile>
          }
        />
        <Route
          path="/coaches"
          element={
            <RequireProfile>
              <CoachDirectoryPage />
            </RequireProfile>
          }
        />
        <Route path="*"              element={<NotFound />} />
      </Route>
    </Routes>
  )
}

import { lazy, Suspense } from 'react'
const OnboardingPage   = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })))
const DashboardPage    = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const MatchSportPage   = lazy(() => import('./pages/MatchSport').then(m => ({ default: m.MatchSport })))
const FacilityMapPage     = lazy(() => import('./pages/FacilityMap').then(m => ({ default: m.FacilityMap })))
const FacilityDetailPage  = lazy(() => import('./pages/FacilityDetail').then(m => ({ default: m.FacilityDetail })))
const ExerciseLibraryPage = lazy(() => import('./pages/ExerciseLibrary').then(m => ({ default: m.ExerciseLibrary })))
const EventListPage       = lazy(() => import('./pages/EventList').then(m => ({ default: m.EventList })))
const CoachDirectoryPage  = lazy(() => import('./pages/CoachDirectory').then(m => ({ default: m.CoachDirectory })))

export default function App() {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <ProfileProvider>
          <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
            <AppRoutes />
          </Suspense>
        </ProfileProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  )
}
