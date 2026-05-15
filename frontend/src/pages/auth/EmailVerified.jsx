import { ArrowLeft, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EmailVerified = () => {

  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans">

      {/* TOP BAR */}
      <div
        className='
          flex flex-col sm:flex-row
          items-start sm:items-center
          justify-between
          gap-4
          px-6 sm:px-10 lg:px-16
          pt-8
        '
      >

        {/* GO BACK */}
        <button
          onClick={() => navigate(-1)}
          className="
            flex items-center gap-2
            text-[14px] text-gray-500
            transition hover:text-black
          "
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        {/* SIGN IN */}
        <div className="flex items-center gap-3">

          <p className="hidden sm:block text-[14px] text-gray-500">
            Already have an account?
          </p>

          <button
            className="
              rounded-md border border-gray-200
              bg-white px-3 py-1.5
              text-[12px] text-gray-500
              shadow-sm transition
              hover:bg-gray-50
            "
          >
            Sign In
          </button>

        </div>

      </div>

      {/* CENTER CONTENT */}
      <div
        className='
          flex min-h-[80vh]
          items-center justify-center
          px-6
        '
      >

        <div className="w-full max-w-[420px] text-center">

          {/* VERIFIED ICON */}
          <div className="mb-8 flex justify-center">

            <div className="relative flex items-center justify-center">

              {/* OUTER RING */}
              <div
                className="
                  h-[92px] w-[92px]
                  rounded-full
                  border-2 border-[#0B3B91]
                  border-dashed
                "
              />

              {/* INNER CIRCLE */}
              <div
                className="
                  absolute flex h-[58px] w-[58px]
                  items-center justify-center
                  rounded-full border-2
                  border-[#0B3B91]
                "
              >
                <Check
                  size={28}
                  strokeWidth={2.5}
                  className="text-[#0B3B91]"
                />
              </div>

            </div>

          </div>

          {/* TITLE */}
          <h1
            className="
              text-[30px] sm:text-[36px]
              font-semibold
              tracking-[-1px]
              text-black
            "
          >
            Your Email Has Been Verified
          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              mx-auto mt-3 max-w-[340px]
              text-[14px]
              leading-[24px]
              text-gray-500
            "
          >
            Great! Your account is now ready to go.
            Let’s complete a few quick steps to set up
            your account.
          </p>

          {/* BUTTON */}
          <button
            onClick={() => navigate('/workspace-setup')}
            className="
              mt-8 h-[48px] w-full
              rounded-lg
              bg-[#0B3B91]
              text-[14px]
              font-medium
              text-white
              shadow-md
              transition hover:bg-[#082d70]
            "
          >
            Continue
          </button>

        </div>

      </div>

      {/* FOOTER */}
      <div
        className="
          absolute bottom-6 left-1/2
          -translate-x-1/2
          text-[11px] text-gray-400
        "
      >
        ©2025 All Rights Reserved Track.
      </div>

    </div>
  )
}

export default EmailVerified