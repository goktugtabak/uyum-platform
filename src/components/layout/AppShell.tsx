import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Footer } from './Footer'
import { RouteTransition } from './RouteTransition'

export function AppShell() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* A4 — skip-to-content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-primary focus:text-primary-foreground focus:text-sm"
      >
        Ana içeriğe atla
      </a>

      {/* A7 — aria-live region for dynamic announcements */}
      <div
        id="aria-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Soft ambient pastel lights */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-[40rem] w-[40rem] rounded-full bg-accent/12 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full bg-mint/40 blur-[140px]" />
        <div className="absolute -bottom-40 left-0 h-[32rem] w-[32rem] rounded-full bg-sky/40 blur-[140px]" />
      </div>

      <div className="flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <TopBar />
          <main id="main-content" className="px-4 pb-20 pt-2 md:px-6 lg:px-12">
            <RouteTransition>
              <Outlet />
            </RouteTransition>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
