import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, BadgeCheck } from 'lucide-react'

import AuthLayout from '../../components/auth/AuthLayout'

const EmployeeLogin = () => {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    staffId: '',
    password: '',
  })

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogin = () => {

    /* SESSION AUTO START */
    localStorage.setItem('isSessionActive', 'true')

    navigate('/secure-account')
  }

  return (
    <AuthLayout>

      <div>

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-sm text-gray-500 mb-8'
        >
          <ArrowLeft size={18} />
          Go Back
        </button>

        {/* HEADER */}
        <div className='mb-8 text-center lg:text-left'>

          <div
            className='
              w-16 h-16 rounded-2xl bg-blue-100
              flex items-center justify-center mb-5 mx-auto lg:mx-0
            '
          >
            <BadgeCheck
              size={30}
              className='text-[#0052CC]'
            />
          </div>

          <h1 className='text-3xl font-bold mb-3'>
            Employee Login
          </h1>

          <p className='text-gray-500 text-sm sm:text-base'>
            Login using your Staff ID and temporary password.
          </p>

        </div>

        {/* FORM */}
        <div className='space-y-5'>

          {/* STAFF ID */}
          <div>

            <label className='block mb-2 text-sm font-medium'>
              Staff ID
            </label>

            <input
              type='text'
              name='staffId'
              value={formData.staffId}
              onChange={handleChange}
              placeholder='Enter staff ID'
              className='
                w-full h-14 rounded-2xl border border-gray-200
                px-4 outline-none focus:border-[#0052CC]
              '
            />

          </div>

          {/* PASSWORD */}
          <div>

            <label className='block mb-2 text-sm font-medium'>
              Temporary Password
            </label>

            <div className='relative'>

              <input
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                placeholder='Enter temporary password'
                className='
                  w-full h-14 rounded-2xl border border-gray-200
                  px-4 pr-12 outline-none focus:border-[#0052CC]
                '
              />

              <Lock
                size={18}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'
              />

            </div>

          </div>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            className='
              w-full h-14 rounded-2xl bg-[#0052CC]
              text-white font-semibold
              hover:bg-blue-700 transition-all
            '
          >
            Continue
          </button>

        </div>

      </div>

    </AuthLayout>
  )
}

export default EmployeeLogin