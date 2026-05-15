import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../../services/api'

const EmailVerification = () => {

  const navigate = useNavigate()

  const [code, setCode] = useState(['', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const inputsRef = useRef([])

  const storedData = sessionStorage.getItem('hrSignupData')
  const displayEmail = storedData ? JSON.parse(storedData).email : 'hello@secret*****.co'

  /* ========================================= */
  /* HANDLE INPUT */
  /* ========================================= */

  const handleChange = (value, index) => {

    if (!/^[0-9]?$/.test(value)) return

    const updatedCode = [...code]

    updatedCode[index] = value

    setCode(updatedCode)

    /* AUTO NEXT */
    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  /* ========================================= */
  /* HANDLE BACKSPACE */
  /* ========================================= */

  const handleBackspace = (e, index) => {

    if (
      e.key === 'Backspace' &&
      !code[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  /* ========================================= */
  /* VERIFY */
  /* ========================================= */

  const handleVerify = async () => {

    const fullCode = code.join('')

    if (fullCode.length !== 5) {
      setError('Please enter the complete 5-digit code.')
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

    <div className="min-h-screen bg-[#f8f8f8] font-sans flex flex-col">

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="px-4 pt-5 sm:px-8 lg:px-16 lg:pt-6">

        {/* TOP */}
        <div className="flex items-center justify-between">

          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="
              flex items-center gap-2
              text-[13px] text-gray-500
            "
          >
            <ArrowLeft size={15} />
            Go Back
          </button>

          {/* SIGN IN */}
          <div className="flex items-center gap-3">

            <p className="hidden sm:block text-[13px] text-gray-500">
              Already have an account?
            </p>

            <button
              className="
                rounded-md border border-gray-200
                bg-white px-3 py-1
                text-[11px] text-gray-500
              "
            >
              Sign In
            </button>

          </div>

        </div>

      </div>

      {/* ========================================= */}
      {/* CENTER CONTENT */}
      {/* ========================================= */}

      <div
        className="
          flex flex-1 items-center
          justify-center px-4 py-10
          sm:px-6
        "
      >

        <div className="w-full max-w-[420px]">

          {/* LOGO */}
          <div className="flex justify-center">

            <div
              className="
                flex h-16 w-16 items-center
                justify-center rounded-full
                border border-gray-200 bg-white
              "
            >

              <div className="h-7 w-7 rounded-sm bg-[#0B3B91]" />

            </div>

          </div>

          {/* TITLE */}
          <div className="mt-6 text-center">

            <h1
              className="
                text-[28px] font-semibold
                text-black sm:text-[32px]
              "
            >
              Email Verification
            </h1>

            <p
              className="
                mx-auto mt-3
                max-w-[320px]
                text-[14px]
                leading-[24px]
                text-gray-500
              "
            >
              We’ve sent a code to your email
              <br />
              {displayEmail} please verify now.
            </p>

          </div>

          {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}

          {/* LABEL */}
          <p
            className="
              mt-6 mb-4 text-center
              text-[13px] text-black
            "
          >
            Enter Verification Code
          </p>

          {/* INPUTS */}
          <div
            className="
              flex items-center justify-center
              gap-2 sm:gap-3
            "
          >

            {code.map((digit, index) => (

              <input
                key={index}
                ref={(el) =>
                  (inputsRef.current[index] = el)
                }
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(
                    e.target.value,
                    index
                  )
                }
                onKeyDown={(e) =>
                  handleBackspace(e, index)
                }
                className="
                  h-11 w-11
                  rounded-[10px]
                  border border-gray-300
                  bg-white
                  text-center
                  text-[18px]
                  font-medium
                  outline-none
                  transition
                  focus:border-[#0B3B91]
                  sm:h-12 sm:w-12
                "
              />

            ))}

          </div>

          {/* BUTTON */}
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className={`
              mt-8 h-[46px] w-full
              rounded-[6px]
              ${isLoading ? 'bg-blue-400' : 'bg-[#0B3B91] hover:bg-[#082d70]'}
              text-[14px]
              font-medium text-white
              shadow-md transition
            `}
          >
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </button>

          {/* RESEND */}
          <div className="mt-4 text-center">

            <p className="text-[12px] text-gray-400">
              Didn’t receive code yet?

              <button
                disabled={isLoading}
                onClick={async () => {
                  try {
                    const parsed = JSON.parse(storedData)
                    await api.post('/auth/signup/hr/request-verification/', { email: parsed.email, first_name: parsed.first_name })
                    alert('Code resent successfully!')
                  } catch (err) {
                    alert('Failed to resend code.')
                  }
                }}
                className="
                  ml-1 text-[#0B3B91]
                  hover:underline
                  disabled:opacity-50
                "
              >
                Resend
              </button>

            </p>

          </div>

        </div>

      </div>

      {/* ========================================= */}
      {/* FOOTER */}
      {/* ========================================= */}

      <div
        className="
          pb-6 text-center
          text-[11px] text-gray-400
        "
      >
        © 2025 All Rights Reserved Track.
      </div>

    </div>
  )
}

export default EmailVerification