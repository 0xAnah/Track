

const StatsCard = ({ title, value, increase }) => {
  return (
    <div className='bg-white p-6 rounded-3xl shadow-sm border border-gray-100'>
      <p className='text-gray-500 text-sm'>{title}</p>

      <div className='flex items-end justify-between mt-4'>
        <h2 className='text-3xl font-bold'>{value}</h2>

        <span className='text-green-600 text-sm font-semibold'>
          {increase}
        </span>
      </div>
    </div>
  )
}

export default StatsCard