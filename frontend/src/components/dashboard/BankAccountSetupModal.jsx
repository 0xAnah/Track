import { useState, useEffect } from 'react'
import { X, Building2, Hash } from 'lucide-react'
import api from '../../services/api'

export default function BankAccountSetupModal({ onClose, onSuccess }) {
  const [banks, setBanks] = useState([])
  const [formData, setFormData] = useState({
    bank_code: '',
    account_number: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingBanks, setIsFetchingBanks] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await api.get('/users/banks/')
        setBanks(response.data.banks || [])
      } catch (err) {
        console.error('Failed to fetch banks:', err)
        setError('Failed to load bank list. Please try again later.')
      } finally {
        setIsFetchingBanks(false)
      }
    }
    fetchBanks()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await api.post('/payments/bank-account/register/', formData)
      onSuccess()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to register bank account.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Setup Bank Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            Link your bank account to receive your salary and approved advances directly.
          </p>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                name="bank_code"
                required
                value={formData.bank_code}
                onChange={handleChange}
                disabled={isFetchingBanks}
                className="w-full h-[42px] pl-9 pr-3 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-[#0B3B91] transition appearance-none"
              >
                <option value="" disabled>
                  {isFetchingBanks ? 'Loading banks...' : 'Choose a bank...'}
                </option>
                {banks.map((bank) => (
                  <option key={bank.bank_code} value={bank.bank_code}>
                    {bank.bank_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                name="account_number"
                required
                maxLength={10}
                value={formData.account_number}
                onChange={handleChange}
                className="w-full h-[42px] pl-9 pr-3 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-[#0B3B91] transition"
                placeholder="0123456789"
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
              disabled={isLoading || isFetchingBanks}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0B3B91] rounded-md hover:bg-[#082d70] shadow-sm disabled:opacity-50 transition"
            >
              {isLoading ? 'Verifying...' : 'Link Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
