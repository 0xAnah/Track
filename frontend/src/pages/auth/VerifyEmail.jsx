import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import api from '../../services/api'
import { BrandLogo } from '../../components/ui/BrandLogo'

const EmailVerification = () => {
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputsRef = useRef([])

  const storedData = sessionStorage.getItem('hrSignupData')
  const displayEmail = storedData ? JSON.parse(storedData).email : 'hello@secret*****.co'

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return
    const updatedCode = [...code]
    updatedCode[index] = value
    setCode(updatedCode)
    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 5) {
      setError('Please enter the 5-digit code.')
      return
    }
    if (!storedData) {
      setError('Session expired. Please sign up again.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const email = JSON.parse(storedData).email
      await api.post('/auth/signup/hr/verify-code/', { email, code: fullCode })
      navigate('/email-verified')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification code.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT SIDE */}
      <div className="relative flex w-full items-center justify-center px-4 py-8 lg:w-1/2">
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-black"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        <div className="w-full max-w-sm text-center">
          <div className="mb-4 flex justify-center">
            <BrandLogo />
          </div>

          <h1 className="text-xl font-semibold text-black">Verify your email</h1>
          <p className="mt-1 text-xs text-gray-500">
            We’ve sent a code to <span className="font-medium text-black">{displayEmail}</span>
          </p>

          <div className="mt-8">
            {error && <p className="mb-4 text-xs text-red-500">{error}</p>}
            
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  className="h-10 w-10 rounded-md border border-gray-200 bg-white text-center text-lg font-medium outline-none focus:border-[#0B3B91]"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={isLoading}
              className="mt-6 h-9 w-full rounded-md bg-[#0B3B91] text-sm font-medium text-white hover:bg-[#082d70] disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Account'}
            </button>

            <p className="mt-4 text-[11px] text-gray-400">
              Didn’t receive code yet?
              <button
                disabled={isLoading}
                onClick={async () => {
                  try {
                    const parsed = JSON.parse(storedData)
                    await api.post('/auth/signup/hr/request-verification/', { email: parsed.email, first_name: parsed.first_name })
                    alert('Code resent!')
                  } catch (err) {
                    alert('Failed to resend.')
                  }
                }}
                className="ml-1 text-[#0B3B91] hover:underline"
              >
                Resend
              </button>
            </p>
          </div>

          <p className="mt-12 text-[10px] text-gray-400">
            © 2025 All Rights Reserved Track.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
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
            Secure your workspace with one-time verification codes.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0B3B91]">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Security Protocol</p>
              <p className="text-xs text-gray-500">2-Factor Authentication Enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification