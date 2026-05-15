import { useState, useEffect } from 'react'
import { Plus, Search, Calendar as CalendarIcon, Clock } from 'lucide-react'
import api from '../../services/api'
import RequestLeaveModal from '../../components/dashboard/modals/RequestLeaveModal'

export default function LeavePage() {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/leave/my-requests/')
      setRequests(response.data)
    } catch (error) {
      console.error('Failed to fetch leave requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-100 text-green-700">Approved</span>
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-100 text-red-700">Rejected</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-700">Pending</span>
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Leave Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your time off and view your request history
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#0B3B91] hover:bg-[#082d70] text-white px-5 py-2.5 rounded-md font-medium transition shadow-md"
        >
          <Plus size={18} />
          Request Time Off
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Request History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Dates</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 flex flex-col items-center">
                    <CalendarIcon size={48} className="text-gray-300 mb-3" />
                    No leave requests found. Click 'Request Time Off' to submit one.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{new Date(req.start_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">to {new Date(req.end_date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {Math.ceil((new Date(req.end_date) - new Date(req.start_date)) / (1000 * 60 * 60 * 24))} days
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <RequestLeaveModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false)
            fetchLeaveRequests()
          }} 
        />
      )}
    </div>
  )
}
