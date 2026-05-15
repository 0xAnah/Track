import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical } from 'lucide-react'
import api from '../../services/api'
import InviteWorkerModal from '../../components/dashboard/modals/InviteWorkerModal'

export default function WorkersPage() {
  const [workers, setWorkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/users/workers/')
      setWorkers(response.data)
    } catch (error) {
      console.error('Failed to fetch workers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkers()
  }, [])

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Workforce
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your employees and track their performance
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#0B3B91] hover:bg-[#082d70] text-white px-5 py-2.5 rounded-md font-medium transition shadow-md"
        >
          <Plus size={18} />
          Invite Worker
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search workers..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:border-[#0B3B91] transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Role ID</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading workers...
                  </td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No workers found. Click 'Invite Worker' to add some.
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                          {worker.first_name[0]}{worker.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{worker.first_name} {worker.last_name}</p>
                          <p className="text-xs text-gray-500">{worker.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{worker.department || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{worker.employee_id || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        worker.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {worker.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${worker.current_score >= 70 ? 'bg-green-500' : 'bg-red-500'}`} 
                            style={{ width: `${worker.current_score || 0}%` }}
                          />
                        </div>
                        <span className="font-medium text-gray-700">{worker.current_score || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <InviteWorkerModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false)
            fetchWorkers()
          }} 
        />
      )}
    </div>
  )
}
