const ReportsTable = () => {
  return (
    <div className='bg-white p-6 rounded-3xl'>
      <h2 className='text-lg font-semibold mb-4'>
        Recent Reports
      </h2>

      <table className='w-full text-sm'>
        <thead>
          <tr className='text-left text-gray-500 border-b'>
            <th className='pb-3'>Name</th>
            <th className='pb-3'>Status</th>
            <th className='pb-3'>Date</th>
          </tr>
        </thead>

        <tbody>
          <tr className='border-b'>
            <td className='py-3'>John Doe</td>
            <td>Completed</td>
            <td>12 May</td>
          </tr>

          <tr className='border-b'>
            <td className='py-3'>Jane Smith</td>
            <td>Pending</td>
            <td>11 May</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ReportsTable