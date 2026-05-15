const PaymentsCard = () => {
  return (
    <div className='bg-white p-6 rounded-3xl'>
      <h2 className='text-lg font-semibold mb-4'>
        Payments
      </h2>

      <div className='space-y-3 text-sm'>
        <div className='flex justify-between'>
          <span>Total Earned</span>
          <span className='font-semibold'>$12,400</span>
        </div>

        <div className='flex justify-between'>
          <span>Pending</span>
          <span className='font-semibold'>$1,200</span>
        </div>

        <div className='flex justify-between'>
          <span>Withdrawn</span>
          <span className='font-semibold'>$8,900</span>
        </div>
      </div>
    </div>
  )
}

export default PaymentsCard