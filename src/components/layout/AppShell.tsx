import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Footer } from './Footer'
import { RouteTransition } from './RouteTransition'

export function AppShell() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* A4 — skip-to-content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-[#320E3B] focus:text-white focus:text-sm"
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

      <div className="flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <TopBar />
          <main id="main-content" className="bg-[#f8f7f7] px-4 pb-20 pt-2 md:px-6 lg:px-12">
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
