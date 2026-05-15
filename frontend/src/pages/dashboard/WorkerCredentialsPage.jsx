import { useEffect, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import api from '../../services/api'

export default function WorkerCredentialsPage() {
  const [credentials, setCredentials] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await api.get('/users/workers/invite-credentials/')
        setCredentials(response.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load credentials.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCredentials()
  }, [])

  const handleExport = async () => {
    try {
      const response = await api.get('/users/workers/invite-credentials/export/', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'worker-invite-credentials.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError('Failed to export credentials file.')
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.5px] text-black">Credential File</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            Temporary login details generated for invited employees.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#0B3B91] hover:bg-[#082d70] text-white px-5 h-[44px] rounded-md text-[13px] font-medium transition shadow-md"
        >
          <Download size={16} />
          Download CSV
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center gap-2">
          <FileText size={16} className="text-[#0B3B91]" />
          <p className="text-[13px] font-medium text-black">Invited Employee Credentials</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f7f9ff] text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Temporary Password</th>
                <th className="px-6 py-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Loading credential file...
                  </td>
                </tr>
              ) : credentials.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No generated credentials yet. Invite workers to populate this file.
                  </td>
                </tr>
              ) : (
                credentials.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-black">{item.worker_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{item.email}</td>
                    <td className="px-6 py-4 text-gray-600">{item.username}</td>
                    <td className="px-6 py-4 text-black font-medium">{item.temporary_password}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(item.created_at).toLocaleString()}</td>
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
