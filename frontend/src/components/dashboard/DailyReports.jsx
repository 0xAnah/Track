import { FileText } from 'lucide-react'

const DailyReports = ({ count = 0, total = 0 }) => {
  return (
    <div className='bg-white p-6 rounded-xl'>

      <div className='flex items-center gap-2 mb-3'>
        <FileText size={18} className='text-purple-600' />
        <h2 className='text-lg font-semibold'>Daily Reports</h2>
      </div>

      <div className='text-3xl font-bold'>
        {count} {total > 0 ? `/ ${total}` : ''}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Submitted today</p>
        <span className="rounded-full bg-[#ECF0FF] px-3 py-1 text-xs font-semibold text-[#3730A3]">
          +2.0%
        </span>
      </div>
    </div>
  )
}

export default DailyReports