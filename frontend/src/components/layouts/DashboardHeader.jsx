import { memo } from 'react'
import { Bell, HelpCircle, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { UserAvatar } from '../ui/UserAvatar'
import { formatWelcomeDate } from '../../lib/formatDate'
import { cn } from '../../lib/utils'

export const DashboardHeader = memo(function DashboardHeader({
  onMobileMenuClick,
  isMobileSidebarOpen,
}) {
  const { user } = useAuth()
  const userName = user?.first_name || 'there'

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex shrink-0 flex-col gap-2 border-b border-gray-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6'
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
          aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-medium text-black sm:text-lg md:text-xl">
            Welcome Back, {userName}
          </h1>
          <p className="text-xs text-gray-500 sm:text-sm">{formatWelcomeDate()}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <button
          type="button"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
          aria-label="Help"
        >
          <HelpCircle size={16} />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-2">
          <UserAvatar user={user} size={32} className="h-8 w-8" />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-xs font-semibold text-black">
              {user ? `${user.first_name} ${user.last_name}` : 'User'}
            </p>
            <p className="text-[10px] capitalize text-gray-500">{user?.role || 'member'}</p>
          </div>
        </div>
      </div>
    </header>
  )
})

