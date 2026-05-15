import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Eye,
} from 'lucide-react'
import api from '../../services/api'

const LandingSignup = () => {

  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || 'Admin'
    const lastName = nameParts.slice(1).join(' ') || 'User'

    // Store in sessionStorage to use at the end of onboarding
    const hrSignupData = {
      username: email.split('@')[0],
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      department: 'HR'
    }

    sessionStorage.setItem('hrSignupData', JSON.stringify(hrSignupData))

    try {
      await api.post('/auth/signup/hr/request-verification/', {
        email,
        first_name: firstName,
      })
      navigate('/verify-email')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send verification email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#F5F7FA] p-3 sm:p-6'>

      <div
        className='
          min-h-[95vh]
          bg-white
          rounded-[30px]
          overflow-hidden
          grid grid-cols-1 lg:grid-cols-2
        '
      >

        {/* LEFT SIDE */}
        <div
          className='
            px-6 sm:px-10 lg:px-16
            py-8
            flex flex-col
          '
        >

          {/* TOP */}
          <div className='flex items-center justify-between mb-10'>

            {/* LOGO */}
            <div className='flex items-center gap-3'>

              <div
                className='
                  w-10 h-10 rounded-xl
                  bg-[#0052CC]
                  flex items-center justify-center
                  text-white font-bold text-lg
                '
              >
                T
              </div>

            </div>

            {/* SIGN IN */}
            <div className='flex items-center gap-3'>

              <p className='text-sm text-gray-500 hidden sm:block'>
                Already have an account?
              </p>

              <button
                onClick={() => navigate('/login')}
                className='
                  px-4 py-2 rounded-xl
                  border border-gray-200
                  text-sm font-medium
                  hover:bg-gray-50
                  transition-all
                '
              >
                Sign In
              </button>

            </div>

          </div>

          {/* CENTER CONTENT */}
          <div
            className='
              flex-1 flex flex-col
              justify-center
              max-w-md mx-auto w-full
            '
          >

            {/* ICON */}
            <div className='flex justify-center mb-8'>

              <div
                className='
                  w-20 h-20 rounded-full
                  border border-gray-200
                  flex items-center justify-center
                '
              >
                <User
                  size={34}
                  className='text-gray-500'
                />
              </div>

            </div>

            {/* TEXT */}
            <div className='text-center mb-8'>

              <h1 className='text-4xl font-bold mb-3'>
                Create your workspace
              </h1>

              <p className='text-gray-500 leading-relaxed'>
                Set up your workforce management dashboard
                and start tracking employee activity in real time.
              </p>

            </div>

            {/* GOOGLE BUTTON */}
            <button
              className='
                w-full h-14 rounded-2xl
                border border-gray-200
                flex items-center justify-center gap-3
                text-sm font-medium
                hover:bg-gray-50 transition-all
              '
            >

              <img
                src='https://www.svgrepo.com/show/475656/google-color.svg'
                alt='google'
                className='w-5 h-5'
              />

              Sign Up with Google

            </button>

            {/* DIVIDER */}
            <div className='flex items-center gap-4 my-8'>

              <div className='flex-1 h-px bg-gray-200'></div>

              <span className='text-sm text-gray-400'>
                Or
              </span>

              <div className='flex-1 h-px bg-gray-200'></div>

            </div>

            {/* FORM */}
            <form className='space-y-5' onSubmit={handleSignup}>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              {/* FULL NAME */}
              <div>

                <label className='block text-sm font-medium mb-2'>
                  Full Name
                </label>

                <div className='relative'>

                  <input
                    type='text'
                    placeholder='Toby Wilson'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className='
                      w-full h-14 rounded-2xl
                      border border-gray-200
                      pl-12 pr-4
                      outline-none
                      focus:border-[#0052CC]
                    '
                  />

                  <User
                    size={18}
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                  />

                </div>

              </div>

              {/* EMAIL */}
              <div>

                <label className='block text-sm font-medium mb-2'>
                  Email Address
                </label>

                <div className='relative'>

                  <input
                    type='email'
                    placeholder='hello@track.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='
                      w-full h-14 rounded-2xl
                      border border-gray-200
                      pl-12 pr-4
                      outline-none
                      focus:border-[#0052CC]
                    '
                  />

                  <Mail
                    size={18}
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div>

                <label className='block text-sm font-medium mb-2'>
                  Password
                </label>

                <div className='relative'>

                  <input
                    type='password'
                    placeholder='••••••••••'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='
                      w-full h-14 rounded-2xl
                      border border-gray-200
                      pl-12 pr-12
                      outline-none
                      focus:border-[#0052CC]
                    '
                  />

                  <Lock
                    size={18}
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                  />

                  <Eye
                    size={18}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer'
                  />

                </div>

              </div>

              {/* OPTIONS */}
              <div className='flex items-center justify-between text-sm'>

                <label className='flex items-center gap-2 text-gray-500'>

                  <input type='checkbox' />

                  Keep me logged in

                </label>

                <button className='text-gray-500 hover:text-[#0052CC]'>
                  Forgot Password?
                </button>

              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full h-14 rounded-2xl
                  ${isLoading ? 'bg-blue-400' : 'bg-[#0052CC] hover:bg-blue-700'}
                  text-white font-semibold
                  transition-all
                  shadow-lg shadow-blue-200
                `}
              >
                {isLoading ? 'Sending Code...' : 'Create Account'}
              </button>

            </form>

          </div>

          {/* FOOTER */}
          <div className='text-center mt-10 text-xs text-gray-400'>
            © 2025 All Rights Reserved Track.
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div
          className='
            hidden lg:flex
            bg-[#F8F9FA]
            relative
            items-center justify-center
            px-20
          '
        >

          {/* GRID BACKGROUND */}
          <div
            className='
              absolute inset-0
              opacity-40
            '
            style={{
              backgroundImage:
                'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {/* CONTENT */}
          <div className='relative z-10 max-w-xl'>

            <h2 className='text-4xl leading-relaxed font-medium mb-10'>
              The Workforce Management tool has revolutionized our operations.
              Its efficient, user-friendly, and helps us track our staffs
              activities in real time.
            </h2>

            {/* USER */}
            <div className='flex items-center justify-between'>

              <div className='flex items-center gap-4'>

                <img
                  src='https://randomuser.me/api/portraits/women/44.jpg'
                  alt='user'
                  className='w-14 h-14 rounded-full object-cover'
                />

                <div>

                  <h4 className='font-semibold text-lg'>
                    Amina Yusuf
                  </h4>

                  <p className='text-sm text-gray-500'>
                    HR Manager, Global Solutions
                  </p>

                </div>

              </div>

              {/* SLIDER */}
              <div className='flex items-center gap-2'>

                <div className='w-10 h-1 rounded-full bg-[#0052CC]'></div>

                <div className='w-2 h-2 rounded-full bg-gray-300'></div>

                <div className='w-2 h-2 rounded-full bg-gray-300'></div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default LandingSignup