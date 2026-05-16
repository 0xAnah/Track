import { useCallback } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Clock,
  FileText,
  BarChart3,
  Bell,
  CreditCard,
  Settings,
  HelpCircle,
  Users,
  CalendarDays,
  X,
  PanelLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { BrandLogo } from '../ui/BrandLogo'
import { UserAvatar } from '../ui/UserAvatar'
import { cn } from '../../lib/utils'

const SIDEBAR_WIDTH = '16rem'
const COLLAPSED_SIDEBAR_WIDTH = '4rem'

const workerMainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/work-sessions', label: 'Work Sessions', icon: Clock },
  { to: '/daily-reports', label: 'Daily Reports', icon: FileText },
  { to: '/performance', label: 'Performance', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: '15+' },
  { to: '/payments', label: 'Payments', icon: CreditCard },
]

const hrMainNav = [
  { to: '/HRDashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/workers', label: 'Workers', icon: Users },
  { to: '/worker-credentials', label: 'Worker Credentials', icon: FileText },
  { to: '/leave-requests', label: 'Leave Requests', icon: CalendarDays },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: '15+' },
  { to: '/payments', label: 'Payments', icon: CreditCard },
]

const otherNav = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help & Support', icon: HelpCircle },
]

function SidebarContent({
  collapsed,
  onToggleCollapsed,
  onNavClick,
  showCloseButton,
  onClose,
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHRRoute = location.pathname.includes('/HRDashboard')
  const mainNav = isHRRoute ? hrMainNav : workerMainNav

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex shrink-0 items-center gap-2 pb-2 pt-5',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-black/5"
            aria-label="Expand sidebar"
          >
            <BrandLogo collapsed />
          </button>
        ) : (
          <>
            <BrandLogo collapsed={false} />
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-black/5"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-black/5"
                aria-label="Collapse sidebar"
              >
                <PanelLeft size={18} />
              </button>
            )}
          </>
        )}
      </div>

      {!collapsed && (
        <div className="shrink-0 px-4 pb-1 pl-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Main menu</p>
        </div>
      )}

      <nav className={cn('min-h-0 flex-1 space-y-0.5 overflow-y-auto py-2', collapsed ? 'px-2' : 'px-3')}>
        {mainNav.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                isActive ? 'bg-gray-100 text-[#0B3B91]' : 'text-gray-600 hover:bg-gray-50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1">{label}</span>
                    {badge && (
                      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0">
        {!collapsed && (
          <div className="px-4 pb-1 pl-6 pt-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Other menu</p>
          </div>
        )}

        <nav className={cn('space-y-0.5 pb-2', collapsed ? 'px-2' : 'px-3')}>
          {otherNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors',
                  collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                  isActive ? 'bg-gray-100 text-[#0B3B91]' : 'text-gray-600 hover:bg-gray-50'
                )
              }
            >
              <Icon size={20} strokeWidth={1.5} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={cn('shrink-0 p-3', collapsed && 'flex justify-center')}>
        {collapsed ? (
          <UserAvatar user={user} size={36} className="h-9 w-9" />
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:bg-gray-50"
          >
            <UserAvatar user={user} size={40} className="h-10 w-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-black">
                {user ? `${user.first_name} ${user.last_name}` : 'User'}
              </p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

export function DashboardSidebar({
  collapsed,
  onToggleCollapsed,
  onMobileOpenChange,
  isMobileInline,
}) {
  const endMobileSidebar = useCallback(() => onMobileOpenChange(false), [onMobileOpenChange])
  const location = useLocation()
  const routeKey = location.pathname.includes('/HRDashboard') ? 'hr' : 'worker'

  if (isMobileInline) {
    return (
      <div className="h-full bg-[#F9FAFB]">
        <SidebarContent
          key={routeKey}
          collapsed={false}
          showCloseButton
          onClose={endMobileSidebar}
          onNavClick={endMobileSidebar}
        />
      </div>
    )
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-20 hidden flex-col bg-[#F9FAFB] transition-[width] duration-200 ease-in-out lg:flex"
      style={{ width: collapsed ? COLLAPSED_SIDEBAR_WIDTH : SIDEBAR_WIDTH }}
    >
      <SidebarContent key={routeKey} collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} />
    </aside>
  )
}

