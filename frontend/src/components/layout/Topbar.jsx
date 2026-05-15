const Topbar = () => {
  return (
    <header className='bg-white border-b px-6 py-4 flex items-center justify-between'>
      <div>
        <h1 className='text-xl font-semibold'>Dashboard</h1>
      </div>

      <div className='flex items-center gap-4'>
        <input
          type='text'
          placeholder='Search...'
          className='border rounded-lg px-4 py-2 outline-none'
        />

        <div className='w-10 h-10 rounded-full bg-gray-300' />
      </div>
    </header>
  )
}

export default Topbar