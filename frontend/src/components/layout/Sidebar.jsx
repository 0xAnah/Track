import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Clock,
  FileText,
  TrendingUp,
  Bell,
  CreditCard,
  Settings,
  HelpCircle,
  User,
  Users,
  CalendarDays,
} from 'lucide-react'

const hrMainMenu = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Workers', icon: Users, path: '/workers' },
  { name: 'Credential File', icon: FileText, path: '/worker-credentials' },
  { name: 'Leave Requests', icon: CalendarDays, path: '/leave-requests' },
  { name: 'Reports', icon: FileText, path: '/reports' },
  { name: 'Payments', icon: CreditCard, path: '/payments' },
]

const workerMainMenu = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Work Sessions', icon: Clock, path: '/work-sessions' },
  { name: 'Leave', icon: CalendarDays, path: '/leave' },
  { name: 'Payments', icon: CreditCard, path: '/payments' },
]

const otherMenu = [
  { name: 'Settings', icon: Settings, path: '/settings' },
  { name: 'Help & Support', icon: HelpCircle, path: '/help' },
]

const Sidebar = () => {
  const { user } = useAuth()

  const isHR = user?.role === 'hr'
  const currentMenu = isHR ? hrMainMenu : workerMainMenu

  return (
    <aside className="flex h-screen w-[280px] flex-col justify-between border-r border-gray-200 bg-white">
      <div className="p-6">
        {/* LOGO */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#0B3B91] text-white font-bold text-sm">
            T
          </div>
          <span className="text-xl font-bold text-black">Track</span>
        </div>

        {/* MAIN MENU */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
          Main Menu
        </p>

        <nav className="mb-8 space-y-2">
          {currentMenu.map((item, i) => {
            const Icon = item.icon

            return (
              <NavLink
                key={i}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[12px] px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0B3B91] text-white shadow-md'
                      : 'text-gray-600 hover:bg-[#F3F4F6]'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* OTHER MENU */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
          Other Menu
        </p>

        <nav className="space-y-2">
          {otherMenu.map((item, i) => {
            const Icon = item.icon

            return (
              <NavLink
                key={i}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[12px] px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0B3B91] text-white shadow-md'
                      : 'text-gray-600 hover:bg-[#F3F4F6]'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* USER PROFILE */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 rounded-[14px] border border-gray-200 bg-white p-3 transition hover:bg-gray-50">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#0B3B91] to-[#0052CC] text-xs font-bold text-white">
            {user ? user.first_name.charAt(0) + user.last_name.charAt(0) : 'U'}
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-black">
              {user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
            </p>
            <p className="truncate text-xs text-gray-500">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
