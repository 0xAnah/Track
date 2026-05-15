import { useState } from 'react'
import { X, DollarSign, FileText } from 'lucide-react'
import api from '../../../services/api'

export default function SalaryAdvanceModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    reason: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await api.post('/payments/advance/request/', formData)
      onSuccess()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to request salary advance.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Request Salary Advance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            You must have an integrity score of at least 70% to request a salary advance. Advances are deducted from your next paycheck.
          </p>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="number"
                name="amount"
                required
                min="1000"
                step="100"
                value={formData.amount}
                onChange={handleChange}
                className="w-full h-[42px] pl-9 pr-3 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-[#0B3B91] transition"
                placeholder="50000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Advance</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
              <textarea
                name="reason"
                required
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-[#0B3B91] transition resize-none"
                placeholder="Please describe why you need this advance..."
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0B3B91] rounded-md hover:bg-[#082d70] shadow-sm disabled:opacity-50 transition"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
