const WorkSessionCard = () => {
  return (
    <div className='bg-white p-6 rounded-3xl'>
      <h2 className='text-lg font-semibold mb-4'>
        Work Sessions
      </h2>

      <div className='space-y-3 text-sm'>
        <div className='flex justify-between'>
          <span>Active Sessions</span>
          <span className='font-semibold'>12</span>
        </div>

        <div className='flex justify-between'>
          <span>Completed</span>
          <span className='font-semibold'>84</span>
        </div>

        <div className='flex justify-between'>
          <span>Pending</span>
          <span className='font-semibold'>5</span>
        </div>
      </div>
    </div>
  )
}

export default WorkSessionCard