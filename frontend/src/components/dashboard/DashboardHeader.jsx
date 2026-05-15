import { Bell, HelpCircle } from 'lucide-react'

const DashboardHeader = () => {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[20px] bg-white p-5 shadow-sm border border-gray-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#0B3B91] text-white">
          <span className="text-lg font-semibold">T</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Track</p>
          <h2 className="text-xl font-semibold text-black">Employee Dashboard</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50">
          <Bell size={18} />
        </button>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50">
          <HelpCircle size={18} />
        </button>
        <div className="flex items-center gap-3 rounded-[14px] border border-gray-200 bg-white px-3 py-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#0B3B91] to-[#0052CC] text-sm font-semibold text-white">
            J
          </div>
          <div>
            <p className="text-sm font-semibold text-black">John Doe</p>
            <p className="text-xs text-gray-500">Employee</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader