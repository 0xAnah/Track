import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const MonthlyHoursChart = ({ data }) => {
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Monthly Hours Worked</p>
          <h2 className="mt-2 text-xl font-semibold text-black">May 2026</h2>
        </div>
        <button className="inline-flex items-center rounded-[4px] border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
          May 2026
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[28px] font-semibold text-black">167 Hours 45 Minutes</p>
          <p className="mt-2 text-sm text-gray-500">Total time logged this month</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#166534]">
          +2.0% Vs last month
        </span>
      </div>

      <div className="mt-6 h-[320px] w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 8" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip cursor={{ stroke: '#0B3B91', strokeWidth: 1 }} />
            <Line type="monotone" dataKey="hours" stroke="#0B3B91" strokeWidth={3} dot={{ r: 4, fill: '#0B3B91' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MonthlyHoursChart