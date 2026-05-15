import { MoreHorizontal } from 'lucide-react'
import { ArrowUp02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const defaultPerformance = {
  score: 85,
  trend: { value: '2.0%', isPositive: true },
  segments: [
    { color: '#0B3B91', width: 50 },
    { color: '#C026D3', width: 30 },
    { color: '#22C55E', width: 20 },
  ],
  metrics: [
    { label: 'Attendance Consistency', value: '92%', color: '#0B3B91', trend: { value: '2.0% Vs last month', isPositive: true } },
    { label: 'Report Submission Rate', value: '81%', color: '#C026D3', trend: { value: '2.0% Vs last month', isPositive: true } },
    { label: 'Average Work Duration', value: '8h 32m', color: '#22C55E', trend: { value: '2.0% Vs last month', isPositive: true } },
  ],
}

export default function PerformanceOverview({ performance = defaultPerformance }) {
  const { score, trend, segments, metrics } = performance

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-medium text-gray-900">Performance Overview</h2>
        <button
          type="button"
          className="rounded-md p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          aria-label="More options"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <p className="text-3xl font-semibold text-black">{score}%</p>
        {trend && (
          <>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
              <HugeiconsIcon icon={ArrowUp02Icon} size={12} className="h-2.5 w-2.5" />+ {trend.value}
            </span>
            <span className="text-xs text-gray-400">Vs last month</span>
          </>
        )}
      </div>

      <div className="mt-5 flex h-4 w-full overflow-hidden rounded-full">
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{ width: `${seg.width}%`, backgroundColor: seg.color }}
            className="h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      <ul className="mt-5 space-y-4">
        {metrics.map((item) => (
          <li key={item.label} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-gray-600">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 font-semibold text-black">{item.value}</span>
            </div>
            {item.trend && (
              <div className="flex justify-end">
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700">
                  <HugeiconsIcon icon={ArrowUp02Icon} size={10} className="h-2 w-2" />+ {item.trend.value}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
