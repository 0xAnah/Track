import { MapPin, Monitor, Square } from 'lucide-react'

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

export default function SessionDetails({ session, onEndSession, endDisabled = false }) {
  if (!session) return null
  const isActive = session.status === 'active'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <h2 className="text-sm font-medium text-gray-900">Session Details</h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isActive ? 'Active Session' : 'Ended'}
        </span>
      </div>
      <div className="space-y-4 pt-4">
        <div>
          <p className="text-xs text-gray-500">Started At</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{session.started_label}</p>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">Current Duration</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            {formatDuration(session.duration_seconds ?? 0)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-900">
              <MapPin size={14} className="text-gray-400" />
              {session.location}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Device</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-900">
              <Monitor size={14} className="text-gray-400" />
              {session.device}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">Activity</p>
          <p className="mt-1 text-sm text-gray-700">{session.activity}</p>
        </div>
        <button
          type="button"
          onClick={onEndSession}
          disabled={endDisabled || !isActive}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Square size={14} />
          End Work Session
        </button>
      </div>
    </div>
  )
}
