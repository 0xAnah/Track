import { useNavigate } from 'react-router-dom'

const CreateWorkspace = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-[#F5F7FB] flex items-center justify-center px-4'>
      <div className='w-full max-w-[520px] bg-white rounded-[32px] p-10 shadow-sm'>

        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>
            Create Workspace
          </h1>

          <p className='text-gray-500'>
            Set up your team workspace to continue.
          </p>
        </div>

        <div className='space-y-5'>
          <div>
            <label className='block mb-2 text-sm font-medium'>
              Workspace Name
            </label>

            <input
              type='text'
              placeholder='Enter workspace name'
              className='w-full h-14 border border-gray-200 rounded-2xl px-4 outline-none focus:border-blue-500'
            />
          </div>

          <div>
            <label className='block mb-2 text-sm font-medium'>
              Email Address
            </label>

            <input
              type='email'
              placeholder='Enter email address'
              className='w-full h-14 border border-gray-200 rounded-2xl px-4 outline-none focus:border-blue-500'
            />
          </div>

          <div>
            <label className='block mb-2 text-sm font-medium'>
              Password
            </label>

            <input
              type='password'
              placeholder='Enter password'
              className='w-full h-14 border border-gray-200 rounded-2xl px-4 outline-none focus:border-blue-500'
            />
          </div>

          <button
            onClick={() => navigate('/verify-email')}
            className='w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all'
          >
            Create Workspace
          </button>
        </div>

      </div>
    </div>
  )
}

export default CreateWorkspace