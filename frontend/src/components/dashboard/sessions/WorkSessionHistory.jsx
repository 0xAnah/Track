import { Calendar, ChevronDown, Upload } from 'lucide-react'

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  late: 'bg-amber-100 text-amber-800',
  absent: 'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
  active: 'Active',
  completed: 'Completed',
  late: 'Late',
  absent: 'Absent',
}

function formatRowDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WorkSessionHistory({
  sessions = [],
  monthLabel = 'May 2026',
  showExport = false,
  className = '',
}) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 sm:p-5 ${className}`}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium text-gray-900">Work Session History</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Calendar size={14} className="text-gray-500" />
            {monthLabel}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {showExport && (
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Upload size={14} className="text-gray-500" />
              Export PDF
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Session Start</th>
              <th className="pb-3 pr-4 font-medium">Session Ended</th>
              <th className="pb-3 pr-4 font-medium">Duration</th>
              <th className="pb-3 font-medium">Session Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                  No session history yet.
                </td>
              </tr>
            ) : (
              sessions.map((row, idx) => {
                const status = row.status || 'completed'
                return (
                  <tr
                    key={row.id || row.date}
                    className={`border-b border-gray-50 last:border-0 ${idx % 2 === 1 ? 'bg-gray-50/60' : ''}`}
                  >
                    <td className="py-3.5 pr-4 font-medium text-gray-900">{formatRowDate(row.date)}</td>
                    <td className="py-3.5 pr-4 text-gray-600">{row.sign_in ?? row.sign_in_time ?? '—'}</td>
                    <td className="py-3.5 pr-4 text-gray-600">{row.sign_out ?? row.sign_out_time ?? '—'}</td>
                    <td className="py-3.5 pr-4 text-gray-600">{row.duration ?? '—'}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[status] || STATUS_STYLES.completed
                        }`}
                      >
                        {STATUS_LABELS[status] || status}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
