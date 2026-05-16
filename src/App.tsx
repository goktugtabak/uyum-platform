import { AccessibilityToolbar } from './components/a11y/AccessibilityToolbar'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { ProfileProvider } from './contexts/ProfileContext'

export default function App() {
  return (
    <AccessibilityProvider>
      <ProfileProvider>
        {/* A4 — skip-to-content, taşınacak AppShell/Header'a M5'te */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded focus:bg-uyum-purple focus:text-white focus:text-sm"
        >
          Ana içeriğe atla
        </a>

        {/* A1/A2/A6/A3 toolbar — taşınacak AppShell Header'a M5'te */}
        <div className="fixed top-0 left-0 right-0 z-40">
          <AccessibilityToolbar />
        </div>

        {/* A7 — aria-live region for dynamic announcements */}
        <div
          id="aria-live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        <main
          id="main-content"
          className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 pt-20"
        >
          <h1 className="text-3xl font-bold font-heading">UYUM</h1>
          <p className="text-sm opacity-70">METU Sports Tech Hackathon 2026</p>
        </main>
      </ProfileProvider>
    </AccessibilityProvider>
  )
}
