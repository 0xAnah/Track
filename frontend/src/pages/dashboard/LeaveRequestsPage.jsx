import { useState, useEffect } from 'react'
import { Check, X as XIcon, Search, Calendar as CalendarIcon } from 'lucide-react'
import api from '../../services/api'

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/leave/pending/')
      setRequests(response.data)
    } catch (error) {
      console.error('Failed to fetch pending leave requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const handleAction = async (id, status) => {
    try {
      await api.patch(`/leave/${id}/approve/`, { status })
      // Refresh the list after action
      fetchLeaveRequests()
    } catch (error) {
      console.error(`Failed to ${status} request:`, error)
      alert(`Failed to ${status} request. Please try again.`)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Leave Requests Inbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage time-off requests from your workforce
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search requests..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:border-[#0B3B91] transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Dates</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Loading pending requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 flex flex-col items-center">
                    <CalendarIcon size={48} className="text-gray-300 mb-3" />
                    No pending leave requests to review.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                          {req.worker.first_name?.[0]}{req.worker.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{req.worker.first_name} {req.worker.last_name}</p>
                          <p className="text-xs text-gray-500">{req.worker.department || 'Employee'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{new Date(req.start_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">to {new Date(req.end_date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[250px] truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'approved')}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition shadow-sm border border-green-100"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'rejected')}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition shadow-sm border border-red-100"
                          title="Reject"
                        >
                          <XIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
