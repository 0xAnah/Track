import { useState, useEffect } from 'react'
import { Plus, Shield, Banknote, Copy, Check } from 'lucide-react'
import api from '../../services/api'
import SalaryAdvanceModal from '../../components/dashboard/modals/SalaryAdvanceModal'

const SQUAD_ACCOUNT = {
  number: '2210000001',
  name: 'John Williams',
  bank: 'Squad',
  type: 'Virtual Account',
}

export default function PaymentsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <WorkerPaymentsView />
    </div>
  )
}

function WorkerPaymentsView() {
  const [status, setStatus] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [statusRes, historyRes] = await Promise.all([
        api.get('/payments/my-status/'),
        api.get('/payments/advance/history/')
      ])
      setStatus(statusRes.data)
      setHistory(historyRes.data)
    } catch (error) {
      console.error('Failed to fetch payment data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(SQUAD_ACCOUNT.number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return <div className="text-gray-500">Loading payment data...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments & Salary</h1>
          <p className="text-sm text-gray-500 mt-1">Your salary is paid via Squad Transfer</p>
        </div>
        <button
          onClick={() => setIsAdvanceModalOpen(true)}
          disabled={!status?.advance_eligible}
          className="flex items-center gap-2 bg-[#0B3B91] hover:bg-[#082d70] disabled:bg-gray-300 disabled:text-gray-500 text-white px-5 py-2.5 rounded-md font-medium transition shadow-md"
        >
          <Plus size={18} />
          Request Advance
        </button>
      </div>

      {/* SQUAD ACCOUNT CARD */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B3B91]/10">
                <Shield size={16} className="text-[#0B3B91]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Squad Account</p>
                <p className="text-xs text-gray-500">Receive salary & advances</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div>
                <p className="text-xs text-gray-500">Account Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold tracking-wider text-gray-900">{SQUAD_ACCOUNT.number}</p>
                  <button
                    onClick={handleCopy}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Account Name: </span>
                  <span className="font-medium text-gray-900">{SQUAD_ACCOUNT.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Bank: </span>
                  <span className="font-medium text-gray-900">{SQUAD_ACCOUNT.bank}</span>
                </div>
                <div>
                  <span className="text-gray-500">Type: </span>
                  <span className="font-medium text-gray-900">{SQUAD_ACCOUNT.type}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex">
            <div className="rounded-xl bg-[#0B3B91] px-4 py-2 text-center text-white">
              <Banknote size={20} className="mx-auto" />
              <p className="mt-0.5 text-[10px] font-medium opacity-80">Squad</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Integrity Score</h3>
          <p className={`text-3xl font-bold ${status?.integrity_score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
            {status?.integrity_score || 0}%
          </p>
          <p className="text-xs text-gray-500 mt-2">Requires 70%+ for advances</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Advance Limit</h3>
          <p className="text-3xl font-bold text-gray-900">₦{parseFloat(status?.advance_limit || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Based on current tier ({status?.tier})</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Outstanding Advance</h3>
          <p className="text-3xl font-bold text-gray-900">₦{parseFloat(status?.outstanding_advance || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">To be deducted from next salary</p>
        </div>
      </div>

      {/* ADVANCE HISTORY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Salary Advance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No advance requests found.</td>
                </tr>
              ) : (
                history.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">₦{parseFloat(item.requested_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{item.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        item.status === 'approved' ? 'bg-green-100 text-green-700' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        item.status === 'disbursed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdvanceModalOpen && (
        <SalaryAdvanceModal onClose={() => setIsAdvanceModalOpen(false)} onSuccess={() => { setIsAdvanceModalOpen(false); fetchData(); }} />
      )}
    </div>
  )
}


