const NotificationPanel = () => {
  return (
    <div className='bg-white p-6 rounded-3xl'>
      <h2 className='text-lg font-semibold mb-4'>
        Notifications
      </h2>

      <div className='space-y-4 text-sm'>
        <div>
          <p className='font-medium'>New Report Generated</p>
          <p className='text-gray-500'>2 mins ago</p>
        </div>

        <div>
          <p className='font-medium'>Payment Received</p>
          <p className='text-gray-500'>1 hour ago</p>
        </div>

        <div>
          <p className='font-medium'>System Update</p>
          <p className='text-gray-500'>Yesterday</p>
        </div>
      </div>
    </div>
  )
}

export default NotificationPanel