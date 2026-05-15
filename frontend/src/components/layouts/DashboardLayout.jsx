import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'
import { cn } from '../../lib/utils'

const SIDEBAR_STORAGE_KEY = 'track:dashboard-sidebar-collapsed'
const SIDEBAR_WIDTH = '16rem'
const COLLAPSED_SIDEBAR_WIDTH = '4rem'
const MOBILE_SIDEBAR_WIDTH = '280px'

export default function DashboardLayout() {
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  })
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, isSidebarCollapsed ? 'true' : 'false')
  }, [isSidebarCollapsed])

  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [location.pathname])

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((open) => !open)
  }, [])

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false)
  }, [])

  const sidebarOffset = isSidebarCollapsed ? COLLAPSED_SIDEBAR_WIDTH : SIDEBAR_WIDTH

  return (
    <div className="h-svh overflow-hidden bg-[#F9FAFB]">
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-10 flex bg-[#F9FAFB] transition-opacity duration-300 lg:hidden',
          isMobileSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        style={{ width: MOBILE_SIDEBAR_WIDTH }}
      >
        <DashboardSidebar
          collapsed={false}
          onToggleCollapsed={() => {}}
          onMobileOpenChange={setIsMobileSidebarOpen}
          isMobileInline
        />
      </div>

      <DashboardSidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed((c) => !c)}
        onMobileOpenChange={() => {}}
      />

      <div
        className={cn(
          'relative h-svh p-2 transition-transform duration-300 ease-out sm:p-3 lg:transition-none',
          isMobileSidebarOpen && 'lg:translate-x-0'
        )}
        style={{
          transform: isMobileSidebarOpen ? `translateX(${MOBILE_SIDEBAR_WIDTH})` : undefined,
        }}
      >
        <div
          className="relative h-full max-lg:min-h-0 lg:ml-[var(--sidebar-offset)]"
          style={{ '--sidebar-offset': sidebarOffset }}
        >
          {isMobileSidebarOpen && (
            <button
              type="button"
              className="absolute inset-0 z-20 bg-black/20 lg:hidden"
              onClick={closeMobileSidebar}
              aria-label="Close sidebar overlay"
            />
          )}

          <main className="relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white sm:rounded-2xl">
            <DashboardHeader
              onMobileMenuClick={toggleMobileSidebar}
              isMobileSidebarOpen={isMobileSidebarOpen}
            />

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="mx-auto w-full max-w-7xl">
                <Outlet key={location.pathname} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
