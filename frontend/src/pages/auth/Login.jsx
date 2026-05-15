import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LockKeyhole, Eye, EyeOff } from 'lucide-react'
import { USE_MOCK } from '../../services/api'
import { BrandLogo } from '../../components/ui/BrandLogo'

const inputClass =
  'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-[#0B3B91]'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(true)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(identifier.trim() || 'demo')
      navigate('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="relative flex w-full items-center justify-center px-4 py-8 lg:w-1/2">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="h-8 rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Create account
          </button>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-4 flex justify-center">
            <BrandLogo />
          </div>

          <h1 className="text-center text-xl font-semibold text-black">Sign in</h1>
          <p className="mt-1 text-center text-xs text-gray-500">
            {USE_MOCK
              ? 'Mock mode: use any email/password. Add “hr” for HR dashboard.'
              : 'Welcome back. Enter your details.'}
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-3">
            <input
              type="text"
              placeholder="Email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={inputClass}
            />

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <label className="flex items-center gap-2 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={() => setKeepLoggedIn(!keepLoggedIn)}
                className="h-3.5 w-3.5 rounded border-gray-300"
              />
              Keep me logged in
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="h-9 w-full rounded-md bg-[#0B3B91] text-sm font-medium text-white hover:bg-[#082d70] disabled:opacity-50"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

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
            Track workforce activity, daily reports, and performance in one place.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?img=32"
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

export default Login

