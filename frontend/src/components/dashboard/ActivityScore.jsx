import { Zap } from 'lucide-react'

const ActivityScore = ({ score = 0 }) => {

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#FFF7ED] text-[#C2410C]">
          <Zap size={20} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Activity Score</p>
          <div className="mt-2 text-3xl font-semibold text-black">{score} / 100</div>
        </div>
      </div>

      <div className="mt-6 w-full overflow-hidden rounded-full bg-[#F3F4F6] h-3">
        <div
          className="h-full rounded-full bg-[#0B3B91]"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-medium text-gray-500">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )
}

export default ActivityScore