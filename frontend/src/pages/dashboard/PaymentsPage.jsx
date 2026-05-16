import { useState, useEffect } from 'react'
import { Plus, Building2, CreditCard, AlertTriangle, Check, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import BankAccountSetupModal from '../../components/dashboard/modals/BankAccountSetupModal'
import SalaryAdvanceModal from '../../components/dashboard/modals/SalaryAdvanceModal'

export default function PaymentsPage() {
  const { user } = useAuth()
  const isHR = user?.role === 'hr'

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {isHR ? <HRPaymentsView /> : <WorkerPaymentsView />}
    </div>
  )
}

function WorkerPaymentsView() {
  const [status, setStatus] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false)

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

  if (isLoading) return <div className="text-gray-500">Loading payment data...</div>

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments & Salary</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your bank account and salary advances</p>
        </div>
        <div className="flex items-center gap-3">
          {!status?.bank_account_verified ? (
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-[#0B3B91] text-[#0B3B91] hover:bg-blue-50 px-5 py-2.5 rounded-md font-medium transition shadow-sm"
            >
              <Building2 size={18} />
              Setup Bank Account
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-md text-sm font-medium border border-green-100">
              <Check size={18} /> Bank Linked
            </div>
          )}
          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            disabled={!status?.advance_eligible || !status?.bank_account_verified}
            className="flex items-center gap-2 bg-[#0B3B91] hover:bg-[#082d70] disabled:bg-gray-300 disabled:text-gray-500 text-white px-5 py-2.5 rounded-md font-medium transition shadow-md"
          >
            <Plus size={18} />
            Request Advance
          </button>
        </div>
      </div>

      {/* WARNINGS */}
      {!status?.bank_account_verified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
          <div className="flex items-center">
            <AlertTriangle className="text-yellow-400 mr-3" size={20} />
            <p className="text-sm text-yellow-700 font-medium">
              You must set up a verified bank account to receive your salary and request advances.
            </p>
          </div>
        </div>
      )}

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

      {isBankModalOpen && (
        <BankAccountSetupModal onClose={() => setIsBankModalOpen(false)} onSuccess={() => { setIsBankModalOpen(false); fetchData(); }} />
      )}
      {isAdvanceModalOpen && (
        <SalaryAdvanceModal onClose={() => setIsAdvanceModalOpen(false)} onSuccess={() => { setIsAdvanceModalOpen(false); fetchData(); }} />
      )}
    </div>
  )
}

function HRPaymentsView() {
  const [teamPayments, setTeamPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments/team/')
      setTeamPayments(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleRelease = async (disbursementId) => {
    if (!confirm('Are you sure you want to release this withheld salary?')) return
    try {
      await api.post(`/payments/release/${disbursementId}/`)
      fetchPayments()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to release salary.')
    }
  }

  if (isLoading) return <div className="text-gray-500">Loading team payments...</div>

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-sm text-gray-500 mt-1">Review current month's salary disbursements and manage holds</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Current Month Team Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Worker</th>
                <th className="px-6 py-4 font-medium">Bank</th>
                <th className="px-6 py-4 font-medium">Account</th>
                <th className="px-6 py-4 font-medium">Net Payout</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No payment records found.</td>
                </tr>
              ) : (
                teamPayments.map(record => {
                  const d = record.disbursement
                  if (!d) return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{record.worker_name}</td>
                      <td colSpan="5" className="px-6 py-4 text-gray-500 italic">No disbursement generated yet this month.</td>
                    </tr>
                  )

                  const isHeld = d.status === 'held'
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{record.worker_name}</td>
                      <td className="px-6 py-4 text-gray-900">{record.bank_name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="font-medium">{record.account_number}</div>
                        <div className="text-xs text-gray-500">{record.account_type}</div>
                      </td>
                      <td className="px-6 py-4 font-bold">₦{parseFloat(d.net_payout).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          isHeld ? 'bg-red-100 text-red-700' :
                          d.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isHeld && (
                          <button
                            onClick={() => handleRelease(d.id)}
                            className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 transition border border-red-100"
                          >
                            <RefreshCw size={14} /> Release
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
