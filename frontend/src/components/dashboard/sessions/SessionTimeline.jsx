import { Calendar, ChevronDown, FileText, Play } from 'lucide-react'

const TYPE_STYLES = {
  started: { bg: 'bg-blue-100', icon: Play, iconClass: 'text-blue-600' },
  report: { bg: 'bg-purple-100', icon: FileText, iconClass: 'text-purple-600' },
}

function formatTimelineDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SessionTimeline({
  events = [],
  selectedDate,
  dateLabel,
  availableDates = [],
  onDateChange,
}) {
  const displayDate = dateLabel || formatTimelineDate(selectedDate)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-gray-900">Session Timeline</h2>
        <div className="relative">
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Calendar size={14} className="text-gray-500" />
            {displayDate}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {availableDates.length > 1 && (
            <select
              className="absolute inset-0 cursor-pointer opacity-0"
              value={selectedDate || ''}
              onChange={(e) => onDateChange?.(e.target.value)}
              aria-label="Select timeline date"
            >
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {formatTimelineDate(d)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <ul className="relative space-y-0">
        {events.length === 0 ? (
          <li className="py-6 text-center text-sm text-gray-500">No events for this day.</li>
        ) : (
          events.map((event, idx) => {
            const style = TYPE_STYLES[event.type] || TYPE_STYLES.report
            const Icon = style.icon
            const isLast = idx === events.length - 1

            return (
              <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute left-4 top-9 bottom-0 w-px border-l border-dashed border-gray-200"
                    aria-hidden
                  />
                )}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.bg}`}
                >
                  <Icon size={14} className={style.iconClass} />
                </div>
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2 pt-0.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{event.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">{event.time}</span>
                </div>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
