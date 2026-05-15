import { useState } from 'react'
import SubmitLogModal from './SubmitLogModal'

const SubmitReport = ({ onLogSubmitted }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSuccess = () => {
    setSuccessMessage('Daily log submitted successfully.')
    if (onLogSubmitted) {
      onLogSubmitted()
    }
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        {/* LEFT TEXT */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700">
            Daily Report
          </h2>
          <p className="text-xs text-gray-500">
            Submit your daily tasks
          </p>
          {successMessage && <p className="text-[12px] text-green-600 mt-1">{successMessage}</p>}
        </div>

        {/* BUTTON */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0B3B91] text-white text-sm px-4 py-2 rounded-md hover:bg-[#082d70] transition shadow-sm"
        >
          Submit Log
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

export default SubmitReport
