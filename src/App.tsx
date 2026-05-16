import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { ProfileProvider, useProfile } from './contexts/ProfileContext'
import { AppShell } from './components/layout/AppShell'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { Spinner } from './components/ui/Spinner'

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { hasProfile } = useProfile()
  if (!hasProfile) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl p-8 text-center">
      <p className="font-display text-lg font-bold text-primary-deep mb-3">
        Sayfa bulunamadı.
      </p>
      <Link to="/" className="text-primary underline hover:text-primary-deep">
        Ana sayfaya dön
      </Link>
    </div>
  )
}

const LandingPage         = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })))
const OnboardingPage      = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })))
const DashboardPage       = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const MatchSportPage      = lazy(() => import('./pages/MatchSport').then(m => ({ default: m.MatchSport })))
const FacilityMapPage     = lazy(() => import('./pages/FacilityMap').then(m => ({ default: m.FacilityMap })))
const FacilityDetailPage  = lazy(() => import('./pages/FacilityDetail').then(m => ({ default: m.FacilityDetail })))
const ExerciseLibraryPage = lazy(() => import('./pages/ExerciseLibrary').then(m => ({ default: m.ExerciseLibrary })))
const EventListPage       = lazy(() => import('./pages/EventList').then(m => ({ default: m.EventList })))
const CoachDirectoryPage  = lazy(() => import('./pages/CoachDirectory').then(m => ({ default: m.CoachDirectory })))
const CommunityPage       = lazy(() => import('./pages/Community').then(m => ({ default: m.Community })))
const ProfilePage         = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes — no shell */}
      <Route path="/"           element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Authenticated app shell */}
      <Route element={<AppShell />}>
        <Route path="/dashboard"     element={<RequireProfile><DashboardPage /></RequireProfile>} />
        <Route path="/match"         element={<RequireProfile><MatchSportPage /></RequireProfile>} />
        <Route path="/map"           element={<RequireProfile><FacilityMapPage /></RequireProfile>} />
        <Route path="/facility/:id"  element={<RequireProfile><FacilityDetailPage /></RequireProfile>} />
        <Route path="/exercises"     element={<RequireProfile><ExerciseLibraryPage /></RequireProfile>} />
        <Route path="/events"        element={<RequireProfile><EventListPage /></RequireProfile>} />
        <Route path="/coaches"       element={<RequireProfile><CoachDirectoryPage /></RequireProfile>} />
        <Route path="/community"     element={<RequireProfile><CommunityPage /></RequireProfile>} />
        <Route path="/profile"       element={<RequireProfile><ProfilePage /></RequireProfile>} />
        <Route path="*"              element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AccessibilityProvider>
          <ProfileProvider>
            <Suspense
              fallback={
                <div className="flex min-h-[40vh] items-center justify-center p-8">
                  <Spinner label="Sayfa yükleniyor" />
                </div>
              }
            >
              <AppRoutes />
            </Suspense>
          </ProfileProvider>
        </AccessibilityProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
