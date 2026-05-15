import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'

export default function WorkspaceSuccess() {

  const navigate = useNavigate()

  /* ========================================= */
  /* GO TO DASHBOARD */
  /* ========================================= */

  const handleDashboard = () => {
    navigate('/dashboard')
  }

  return (

    <div className="min-h-screen bg-[#f8f8f8] font-sans">

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="px-5 pt-5 sm:px-8 lg:px-16 lg:pt-6">

        {/* TOP */}
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <div className="h-7 w-7 rounded-sm bg-[#0B3B91]" />

          {/* SIGN IN */}
          <div className="flex items-center gap-3">

            <p className="hidden text-[13px] text-gray-500 sm:block">
              Already have an account?
            </p>

            <button
              className="
                rounded-md border border-gray-200
                bg-white px-3 py-1
                text-[11px] text-gray-500
                shadow-sm
              "
            >
              Sign In
            </button>

          </div>

        </div>

        {/* BACK + STEP */}
        <div className="mt-10 flex items-center justify-between">

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

          {/* STEP */}
          <p className="text-[13px] text-gray-500">
            Step 4 / 4
          </p>

        </div>

        {/* PROGRESS */}
        <div
          className="
            mt-4 h-[4px]
            w-full overflow-hidden
            rounded-full bg-[#ececec]
          "
        >

          <div
            className="
              h-full w-full
              rounded-full bg-[#0B3B91]
            "
          />

        </div>

      </div>

      {/* ========================================= */}
      {/* SUCCESS CONTENT */}
      {/* ========================================= */}

      <div className="flex items-center justify-center px-5 py-24">

        <div className="w-full max-w-[420px] text-center">

          {/* SUCCESS ICON */}
          <div className="flex justify-center">

            <div className="relative flex items-center justify-center">

              {/* OUTER RING */}
              <div
                className="
                  flex h-[74px] w-[74px]
                  items-center justify-center
                  rounded-full border-2
                  border-[#0B3B91]
                "
              >

                {/* INNER RING */}
                <div
                  className="
                    flex h-[52px] w-[52px]
                    items-center justify-center
                    rounded-full border-2
                    border-[#0B3B91]
                  "
                >

                  <Check
                    size={24}
                    className="text-[#0B3B91]"
                    strokeWidth={2.5}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* TITLE */}
          <h1
            className="
              mt-8 text-[30px]
              font-semibold text-black
            "
          >
            Your Workspace Is Ready!!
          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              mx-auto mt-3
              max-w-[320px]
              text-[14px]
              leading-[24px]
              text-gray-500
            "
          >
            You can now monitor attendance,
            review daily activity, and manage
            workforce performance.
          </p>

          {/* BUTTON */}
          <button
            onClick={handleDashboard}
            className="
              mx-auto mt-8 flex
              h-[46px] w-full
              max-w-[320px]
              items-center justify-center
              rounded-md bg-[#0B3B91]
              text-[13px]
              font-medium text-white
              shadow-md
              transition hover:bg-[#082d70]
            "
          >
            Go to Dashboard
          </button>

        </div>

      </div>

      {/* ========================================= */}
      {/* FOOTER */}
      {/* ========================================= */}

      <div className="pb-6 text-center text-[11px] text-gray-400">
        © 2025 All Rights Reserved Track.
      </div>

    </div>
  )
}