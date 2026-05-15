import { useState } from 'react'
import SubmitLogModal from './SubmitLogModal'

export default function SubmitReport({ onLogSubmitted }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSuccess = () => {
    onLogSubmitted?.()
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-snug text-gray-600">
          Submit your daily work summary before ending your work session.
        </p>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-xs font-medium text-gray-800 shadow-sm transition hover:bg-gray-50"
        >
          Submit Report
        </button>
      </div>

      <SubmitLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}
