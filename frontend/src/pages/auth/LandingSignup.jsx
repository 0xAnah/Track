import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import api, { USE_MOCK } from '../../services/api'
import { BrandLogo } from '../../components/ui/BrandLogo'

const inputClass =
  'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-[#0B3B91]'

const LandingSignup = () => {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || 'Admin'
    const lastName = nameParts.slice(1).join(' ') || 'User'

    const hrSignupData = {
      username: email.split('@')[0],
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      department: 'HR'
    }

    sessionStorage.setItem('hrSignupData', JSON.stringify(hrSignupData))

    if (USE_MOCK) {
      setTimeout(() => {
        navigate('/verify-email')
        setIsLoading(false)
      }, 800)
      return
    }

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
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT SIDE - FORM */}
      <div className="relative flex w-full items-center justify-center px-4 py-8 lg:w-1/2">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="h-8 rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Sign in
          </button>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-4 flex justify-center">
            <BrandLogo />
          </div>

          <h1 className="text-center text-xl font-semibold text-black">Create workspace</h1>
          <p className="mt-1 text-center text-xs text-gray-500">
            Set up your workforce management dashboard.
          </p>

          <form onSubmit={handleSignup} className="mt-6 space-y-3">
            {error && <p className="text-center text-xs text-red-500">{error}</p>}

            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={`${inputClass} pl-9`}
              />
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputClass} pl-9`}
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputClass} pl-9 pr-9`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-9 w-full rounded-md bg-[#0B3B91] text-sm font-medium text-white hover:bg-[#082d70] disabled:opacity-50"
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] text-gray-400">
            © 2025 All Rights Reserved Track.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - QUOTE */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[#F9FAFB] lg:flex">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative z-10 max-w-md px-10">
          <p className="text-2xl font-bold leading-snug tracking-tight text-black">
            The Workforce Management tool has revolutionized our operations.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-black">Amina Yusuf</p>
              <p className="text-xs text-gray-500">HR Manager, Global Solutions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingSignup