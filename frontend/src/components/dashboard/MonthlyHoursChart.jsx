import { Calendar, ChevronDown } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-black">{point.tooltip || `${point.hours}h`}</p>
    </div>
  )
}

export default function MonthlyHoursChart({
  data = [],
  total = '167 Hours 45 Minutes',
  trend = { value: '2.0%', isPositive: true },
  monthLabel = 'May 2026',
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-900">Monthly Hours Worked</h2>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <p className="text-xl font-semibold text-black sm:text-2xl">{total}</p>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
              ↑ {trend.value}
            </span>
            <span className="text-xs text-gray-400">Vs last month</span>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Calendar size={14} className="text-gray-500" />
          {monthLabel}
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>

      <div className="mt-4 h-[280px] w-full sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 6" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickFormatter={(v) => `${v}h`}
              domain={[0, 8]}
              ticks={[0, 2, 4, 6, 8]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#0B3B91"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#0B3B91', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#0B3B91' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

