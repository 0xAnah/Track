const EndSessionModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm'>
      
      <div className='bg-white w-[420px] p-6 rounded-xl'>

        <h2 className='text-lg font-semibold mb-2'>
          End Today's Work Session?
        </h2>

        <p className='text-sm text-gray-500 mb-6'>
          Your daily report has already been submitted successfully.
        </p>

        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 border rounded-lg'
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg'
          >
            End Session
          </button>
        </div>

      </div>
    </div>
  )
}

export default EndSessionModal