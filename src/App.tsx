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

function NotImplemented({ phase }: { phase: string }) {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <p className="text-lg font-heading mb-4">Bu sayfa {phase}&apos;de geliyor.</p>
      <Link to="/" className="text-uyum-purple underline hover:text-uyum-blue">
        Ana sayfaya dön
      </Link>
    </div>
  )
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
              {/* Dashboard — Faz 7'de doldurulacak, şimdilik lazy import */}
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
        <Route path="/map"           element={<NotImplemented phase="Faz 5" />} />
        <Route path="/facility/:id"  element={<NotImplemented phase="Faz 6" />} />
        <Route path="/exercises"     element={<NotImplemented phase="Faz 9" />} />
        <Route path="/events"        element={<NotImplemented phase="Faz 9" />} />
        <Route path="/coaches"       element={<NotImplemented phase="Faz 9" />} />
        <Route path="*"              element={<NotFound />} />
      </Route>
    </Routes>
  )
}

// Lazy page imports — filled in M6/M7
import { lazy, Suspense } from 'react'
const OnboardingPage = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })))
const DashboardPage  = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const MatchSportPage = lazy(() => import('./pages/MatchSport').then(m => ({ default: m.MatchSport })))

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
