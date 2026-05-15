const WorkSessionHistory = ({ sessions = [] }) => {
  const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const formatTime = (value) => {
    if (!value) return '--'
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (minutes = 0) => {
    if (!minutes) return '0m'
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (!hrs) return `${mins}m`
    if (!mins) return `${hrs}h`
    return `${hrs}h ${mins}m`
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'signed_out':
        return 'bg-green-100 text-green-700'
      case 'signed_in':
        return 'bg-blue-100 text-blue-700'
      case 'absent':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (session) => {
    if (session?.is_absent) return 'Absent'
    if (session?.status === 'signed_out') return 'Completed'
    if (session?.status === 'signed_in') return 'Active'
    return 'Not Started'
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-black">Work Session History</h2>
          <p className="mt-1 text-sm text-gray-500">Review the latest session updates.</p>
        </div>
        <button className="rounded-[4px] border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
          May 2026
        </button>
      </div>

      <table className='w-full text-sm mt-4'>
        <thead>
          <tr className='text-left text-gray-500 border-b'>
            <th className='py-2'>Date</th>
            <th>Start</th>
            <th>Ended</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {sessions.length === 0 ? (
            <tr>
              <td colSpan='5' className='py-6 text-center text-gray-500'>
                No session history yet.
              </td>
            </tr>
          ) : sessions.map((session, i) => (
            <tr key={session.date || i} className='border-b border-gray-100'>
              <td className='py-3 text-gray-700'>{formatDate(session.date)}</td>
              <td className='text-gray-600'>{formatTime(session.sign_in_time)}</td>
              <td className='text-gray-600'>{formatTime(session.sign_out_time)}</td>
              <td className='text-gray-600'>{formatDuration(session.duration_minutes)}</td>
              <td>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(session.status)}`}>
                  {getStatusLabel(session)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default WorkSessionHistory
