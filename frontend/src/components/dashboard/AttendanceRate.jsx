import { CheckCircle2 } from 'lucide-react'

const AttendanceRate = ({ percent = 0 }) => {

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#ECF8F3] text-[#16A34A]">
          <CheckCircle2 size={20} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
          <div className="mt-2 text-3xl font-semibold text-black">{percent}%</div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Based on weekly attendance</p>
        <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#166534]">
          +2.0%
        </span>
      </div>
    </div>
  )
}

export default AttendanceRate