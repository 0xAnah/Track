import { useState, useEffect } from 'react'
import { CreditCard, Banknote, CheckCircle, AlertCircle, Clock, Search, DollarSign, Zap } from 'lucide-react'
import { teamPayments } from '@data/payments'
import SquadPaymentModal from '../../components/dashboard/modals/SquadPaymentModal'

const tierColors = {
  elite: 'bg-purple-100 text-purple-700',
  solid: 'bg-blue-100 text-blue-700',
  standard: 'bg-gray-100 text-gray-700',
  flagged: 'bg-red-100 text-red-700',
}

const statusBadge = {
  completed: { icon: CheckCircle, class: 'bg-green-100 text-green-700' },
  paid: { icon: CheckCircle, class: 'bg-green-100 text-green-700' },
  held: { icon: AlertCircle, class: 'bg-red-100 text-red-700' },
  pending: { icon: Clock, class: 'bg-yellow-100 text-yellow-700' },
}

export default function HRPayrollPage() {
  const [records, setRecords] = useState([])
  const [search, setSearch] = useState('')
  const [successId, setSuccessId] = useState(null)
  const [paidAllIds, setPaidAllIds] = useState([])
  const [squadModal, setSquadModal] = useState(null)

  useEffect(() => {
    setRecords(teamPayments)
  }, [])

  const filtered = records.filter(r =>
    r.worker_name.toLowerCase().includes(search.toLowerCase()) ||
    r.department.toLowerCase().includes(search.toLowerCase()) ||
    r.account_number.includes(search)
  )

  const handlePaySalary = (id) => {
    const record = records.find(r => r.id === id)
    if (record) setSquadModal({ records: [record], isBatch: false })
  }

  const eligibleForBatch = records.filter(r => r.score >= 70 && r.status !== 'paid' && r.status !== 'completed')

  const handlePayAllEligible = () => {
    setSquadModal({ records: eligibleForBatch, isBatch: true })
  }

  const handleSquadComplete = (id) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'paid' } : r))
    setSuccessId(id)
    setPaidAllIds(prev => [...prev, id])
    setTimeout(() => {
      setSuccessId(null)
      setPaidAllIds([])
    }, 2500)
  }

  const totalPending = records.filter(r => r.status === 'pending' || r.status === 'held').length
  const totalPayroll = records.reduce((sum, r) => sum + (r.net_pay || 0), 0)
  const paidCount = records.filter(r => r.status === 'paid' || r.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-sm text-gray-500 mt-1">Process employee salaries and view payment history</p>
        </div>
        {eligibleForBatch.length > 0 && (
          <button
            onClick={handlePayAllEligible}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-md"
          >
            <Zap size={18} />
            Pay All Eligible ({eligibleForBatch.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Payroll</p>
          <p className="text-2xl font-bold text-gray-900">₦{totalPayroll.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Employees</p>
          <p className="text-2xl font-bold text-gray-900">{records.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paidCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard size={20} className="text-[#0B3B91]" />
            Employee Payroll
          </h2>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3B91]/20 focus:border-[#0B3B91]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">GTBank Account</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Net Pay</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(record => {
                const StatusIcon = (statusBadge[record.status] || statusBadge.pending).icon
                return (
                  <tr key={record.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{record.worker_name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Banknote size={14} className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{record.account_number}</div>
                          <div className="text-xs text-gray-500">GTBank • {record.account_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${tierColors[record.tier] || 'bg-gray-100 text-gray-700'}`}>
                          {record.tier}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{record.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">₦{record.net_pay.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${(statusBadge[record.status] || statusBadge.pending).class}`}>
                        <StatusIcon size={12} />
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {successId === record.id || paidAllIds.includes(record.id) ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs">
                          <CheckCircle size={14} /> Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePaySalary(record.id)}
                          disabled={record.status === 'paid' || record.status === 'completed'}
                          className="inline-flex items-center gap-1.5 bg-[#0B3B91] hover:bg-[#082d70] disabled:bg-gray-200 disabled:text-gray-400 text-white px-4 py-2 rounded-lg text-xs font-medium transition shadow-sm"
                        >
                          <DollarSign size={14} />
                          Pay Salary
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No employees match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {squadModal && (
        <SquadPaymentModal
          records={squadModal.records}
          isBatch={squadModal.isBatch}
          onClose={() => setSquadModal(null)}
          onComplete={handleSquadComplete}
        />
      )}
    </div>
  )
}
