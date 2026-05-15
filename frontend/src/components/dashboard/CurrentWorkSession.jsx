import { Clock } from 'lucide-react'

const CurrentWorkSession = ({ isActive = false, startTime = null }) => {
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className='bg-white p-6 rounded-xl'>

      <div className='flex items-center gap-2 mb-3'>
        <Clock size={18} className='text-blue-600' />
        <h2 className='text-lg font-semibold'>Current Work Session</h2>
      </div>

      <div className='flex items-center gap-2 mb-4'>
        <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
        <span className={`font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {startTime ? (
        <p className='text-sm text-gray-500'>
          Started at {formatTime(startTime)}
        </p>
      ) : (
        <p className='text-sm text-gray-500'>
          No session started today
        </p>
      )}

    </div>
  )
}

export default CurrentWorkSession