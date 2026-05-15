import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

import AuthLayout from '../../components/auth/AuthLayout'

const SecureAccount = () => {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleContinue = () => {

    navigate('/dashboard')
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
            <ShieldCheck
              size={30}
              className='text-[#0052CC]'
            />
          </div>

          <h1 className='text-3xl font-bold mb-3'>
            Secure Your Account
          </h1>

          <p className='text-gray-500 text-sm sm:text-base'>
            Update your temporary password to continue.
          </p>

        </div>

        {/* FORM */}
        <div className='space-y-5'>

          <div>

            <label className='block mb-2 text-sm font-medium'>
              New Password
            </label>

            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='Enter new password'
              className='
                w-full h-14 rounded-2xl border border-gray-200
                px-4 outline-none focus:border-[#0052CC]
              '
            />

          </div>

          <div>

            <label className='block mb-2 text-sm font-medium'>
              Confirm Password
            </label>

            <input
              type='password'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder='Confirm password'
              className='
                w-full h-14 rounded-2xl border border-gray-200
                px-4 outline-none focus:border-[#0052CC]
              '
            />

          </div>

          <button
            onClick={handleContinue}
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

export default SecureAccount