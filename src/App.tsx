import { AccessibilityProvider } from './contexts/AccessibilityContext'

export default function App() {
  return (
    <AccessibilityProvider>
      <main
        id="main-content"
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-8"
      >
        <h1 className="text-3xl font-bold">UYUM</h1>
        <p className="text-sm opacity-70">METU Sports Tech Hackathon 2026</p>
      </main>
    </AccessibilityProvider>
  )
}
