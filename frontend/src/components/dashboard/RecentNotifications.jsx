import { Check, AlertCircle } from 'lucide-react'
import { notifications } from '@data/notifications'

function NotificationIcon({ type, color }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
      style={{ backgroundColor: color }}
    >
      {type === 'check' ? <Check size={14} strokeWidth={2.5} /> : <AlertCircle size={14} strokeWidth={2.5} />}
    </div>
  )
}

export default function RecentNotifications({ items = notifications }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-gray-900">Recent Notifications</h2>
        <button
          type="button"
          className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          View All
        </button>
      </div>

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <NotificationIcon type={item.icon} color={item.color} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-black">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
            <span className="shrink-0 text-xs text-gray-400">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
