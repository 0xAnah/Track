import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  UserCircle2,
  LockKeyhole,
  Eye,
  EyeOff,
} from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(identifier.trim(), password)
      // Removed role-based block as we want all users to be able to sign in
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">

      {/* LEFT */}
      <div className="relative flex w-full items-center justify-center lg:w-1/2 px-6">

        {/* REGISTER */}
        <div className="absolute right-6 top-6">
          <button
            onClick={() => navigate('/')}
            className="border px-4 py-2 rounded-xl"
          >
            Create Account
          </button>
        </div>

        {/* FORM */}
        <div className="w-full max-w-md">

          {/* ICON */}
          <div className="flex justify-center mb-6">
            <UserCircle2 size={48} />
          </div>

          {/* TITLE */}
          <h1 className="text-3xl font-bold text-center">
            Sign In
          </h1>

          <p className="text-center text-gray-500 mt-2">
            Welcome back! Please enter your details.
          </p>

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

          <form onSubmit={handleLogin}>
            {/* EMAIL */}
            <input
              type="text" // Using text instead of email in case username is allowed
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full mt-8 p-4 border rounded-xl"
            />

          {/* PASSWORD */}
          <div className="relative mt-4">

            <LockKeyhole className="absolute left-3 top-4 text-gray-400" />

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 pl-10 pr-10 border rounded-xl"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* CHECKBOX */}
          <label className="flex items-center gap-2 mt-4 text-sm">
            <input
              type="checkbox"
              checked={keepLoggedIn}
              onChange={() => setKeepLoggedIn(!keepLoggedIn)}
            />
            Keep me logged in
          </label>

          {/* LOGIN BUTTON (FIXED) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          </form>

        </div>
      </div>

      {/* RIGHT SIDE */}
      {/* ================================================= */}
      <div
        className='
          relative hidden w-1/2
          items-center justify-center
          overflow-hidden bg-[#F9FAFB]
          lg:flex
        '
      >

        {/* DOT GRID */}
        <div
          className='absolute inset-0 opacity-40'
          style={{
            backgroundImage:
              'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* CONTENT */}
        <div className='relative z-10 max-w-2xl px-16'>

          {/* QUOTE */}
          <p
            className='
              text-[42px] font-black italic
              leading-[1.45] tracking-tight
              text-black
            '
          >
            “The Workforce Management tool has revolutionized
            our operations. It's efficient, user-friendly,
            and helps us track our staffs activities in
            real time.”
          </p>

          {/* PROFILE */}
          <div className='mt-10 flex items-center gap-4'>

            <img
              src='https://i.pravatar.cc/150?img=32'
              alt='Amina Yusuf'
              className='
                h-14 w-14 rounded-full
                object-cover
              '
            />

            <div>

              <h4
                className='
                  text-lg font-bold text-black
                '
              >
                Amina Yusuf
              </h4>

              <p className='text-sm text-gray-500'>
                HR Manager, Global Solutions
              </p>

            </div>

          </div>

          </div>
        </div>
    </div>
  )
}

export default Login
