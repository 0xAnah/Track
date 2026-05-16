import { useState } from 'react'
import { X, CheckCircle, Banknote, Shield } from 'lucide-react'

function generateSquadRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let ref = 'SQTECH'
  for (let i = 0; i < 18; i++) ref += chars[Math.floor(Math.random() * chars.length)]
  return ref
}

export default function SquadPaymentModal({ records, isBatch, onClose, onComplete }) {
  const [step, setStep] = useState('confirm')
  const [squadRef] = useState(generateSquadRef)

  const totalAmount = records.reduce((s, r) => s + r.net_pay, 0)

  const handleConfirm = () => {
    setStep('processing')
    setTimeout(() => {
      setStep('success')
      setTimeout(() => {
        records.forEach(r => onComplete(r.id))
        onClose()
      }, 2000)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {step === 'confirm' && (
          <>
            <div className="bg-gradient-to-r from-[#0B3B91] to-[#1a56db] px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Squad</p>
                    <p className="text-xs text-white/70">Secure Payment Gateway</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              {isBatch ? (
                <div>
                  <p className="text-sm font-medium text-gray-500">Batch Payment Summary</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">₦{totalAmount.toLocaleString()}</p>
                  <p className="mt-1 text-sm text-gray-500">{records.length} employees</p>
                  <div className="mt-4 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-3">
                    {records.map(r => (
                      <div key={r.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{r.worker_name}</span>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">₦{r.net_pay.toLocaleString()}</span>
                          <span className="ml-2 text-xs text-gray-500">{r.account_number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-500">Salary Payment</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{records[0].worker_name}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-lg font-bold text-gray-900">₦{records[0].net_pay.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-sm font-medium text-gray-900">{records[0].department}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Bank Account</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                          <Banknote size={14} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{records[0].bank_name} • {records[0].account_number}</p>
                          <p className="text-xs text-gray-500">{records[0].account_type}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield size={15} className="text-[#0B3B91]" />
                  <span className="font-medium text-[#0B3B91]">Payment via Squad Transfer</span>
                </div>
                <p className="mt-1 text-xs text-blue-700/70">
                  Funds will be transferred from your Squad wallet to the employee's GTBank account. Secured by Squad's infrastructure.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 rounded-lg bg-[#0B3B91] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#082d70] transition"
                >
                  {isBatch ? `Pay ₦${totalAmount.toLocaleString()}` : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-8 w-8 animate-spin text-[#0B3B91]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">Processing Payment</p>
            <p className="mt-1 text-sm text-gray-500">Squad is processing your {isBatch ? 'batch' : ''} payment...</p>
            <div className="mt-4 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium text-[#0B3B91]">
              Ref: {squadRef.slice(0, 16)}...
            </div>
            <div className="mt-6 flex justify-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#0B3B91]" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#0B3B91]" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#0B3B91]" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">Payment Successful</p>
            <p className="mt-1 text-sm text-gray-500">
              {isBatch
                ? `${records.length} employees have been paid via Squad.`
                : `${records[0].worker_name} has been paid via Squad.`}
            </p>
            <div className="mt-4 inline-block rounded-full bg-green-50 px-4 py-1.5 text-xs font-medium text-green-700">
              Ref: {squadRef}
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield size={12} />
              Secured by Squad
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
