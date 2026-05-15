import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const TrackingConfiguration = () => {
  const navigate = useNavigate()

  const [settings, setSettings] = useState({
    autoTracking: false,
    officeRestriction: true,
    workHours: false,
    lateAlerts: true,
    dailyReports: true,
  })

  /* ========================================= */
  /* TOGGLE SWITCH */
  /* ========================================= */

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  /* ========================================= */
  /* FINISH SETUP */
  /* ========================================= */

  const handleFinishSetup = () => {
    localStorage.setItem(
      'trackingSettings',
      JSON.stringify(settings)
    )

    navigate('/workspace-success')
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sans flex flex-col">

      {/* ========================================= */}
      {/* TOP SECTION */}
      {/* ========================================= */}

      <div className="px-4 pt-5 sm:px-8 lg:px-16 lg:pt-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <div className="h-7 w-7 rounded-sm bg-[#0B3B91]" />

          {/* SIGN IN */}
          <div className="flex items-center gap-2 sm:gap-3">

            <p className="hidden sm:block text-[13px] text-gray-500">
              Already have an account?
            </p>

            <button
              className="
                rounded-md border border-gray-200
                bg-white px-3 py-1
                text-[10px] sm:text-[11px]
                text-gray-500
                shadow-sm
              "
            >
              Sign In
            </button>

          </div>

        </div>

        {/* BACK + STEP */}
        <div className="mt-8 sm:mt-10 flex items-center justify-between">

          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="
              flex items-center gap-2
              text-[12px] sm:text-[13px]
              text-gray-500
            "
          >
            <ArrowLeft size={15} />
            Go Back
          </button>

          {/* STEP */}
          <p className="text-[12px] sm:text-[13px] text-gray-500">
            Step 3 / 4
          </p>

        </div>

        {/* PROGRESS */}
        <div className="mt-4 h-[4px] w-full overflow-hidden rounded-full bg-[#ececec]">

          <div className="h-full w-3/4 rounded-full bg-[#0B3B91]" />

        </div>

      </div>

      {/* ========================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================= */}

      <div className="flex flex-1 justify-center px-4 py-10 sm:px-6 sm:py-14 lg:py-16">

        <div className="w-full max-w-[700px]">

          {/* TITLE */}
          <div className="text-center">

            <h1
              className="
                text-[24px]
                sm:text-[28px]
                lg:text-[30px]
                font-semibold text-black
                leading-tight
              "
            >
              Configure Work Session Tracking
            </h1>

            <p
              className="
                mx-auto mt-3
                max-w-[500px]
                text-[13px]
                sm:text-[14px]
                leading-[22px]
                sm:leading-[24px]
                text-gray-500
                px-2
              "
            >
              Customize how employee attendance,
              work sessions, and daily activities
              will be managed.
            </p>

          </div>

          {/* ========================================= */}
          {/* SETTINGS */}
          {/* ========================================= */}

          <div className="mt-12 sm:mt-16 space-y-8 sm:space-y-10">

            {/* ITEM 1 */}
            <div className="flex items-start justify-between gap-4 sm:gap-6">

              <div className="flex-1">

                <h2 className="text-[14px] sm:text-[16px] font-medium text-black">
                  Enable automatic work session tracking
                </h2>

                <p className="mt-2 text-[11px] sm:text-[12px] leading-[18px] sm:leading-[20px] text-gray-500">
                  Automatically start employee work
                  sessions when they log into Track to
                  ensure accurate attendance records.
                </p>

              </div>

              <button
                onClick={() =>
                  toggleSetting('autoTracking')
                }
                className={`
                  relative h-[28px] w-[50px]
                  sm:h-[30px] sm:w-[54px]
                  rounded-full transition-all flex-shrink-0
                  ${
                    settings.autoTracking
                      ? 'bg-[#0B3B91]'
                      : 'bg-[#d9d9d9]'
                  }
                `}
              >

                <div
                  className={`
                    absolute top-[3px]
                    h-[22px] w-[22px]
                    sm:h-[24px] sm:w-[24px]
                    rounded-full bg-white
                    transition-all
                    ${
                      settings.autoTracking
                        ? 'left-[25px] sm:left-[27px]'
                        : 'left-[3px]'
                    }
                  `}
                />

              </button>

            </div>

            {/* ITEM 2 */}
            <div className="flex items-start justify-between gap-4 sm:gap-6">

              <div className="flex-1">

                <h2 className="text-[14px] sm:text-[16px] font-medium text-black">
                  Restrict login to office location
                </h2>

                <p className="mt-2 text-[11px] sm:text-[12px] leading-[18px] sm:leading-[20px] text-gray-500">
                  Allow employees to access work
                  sessions only within the office
                  location for improved attendance
                  verification.
                </p>

              </div>

              <button
                onClick={() =>
                  toggleSetting('officeRestriction')
                }
                className={`
                  relative h-[28px] w-[50px]
                  sm:h-[30px] sm:w-[54px]
                  rounded-full transition-all flex-shrink-0
                  ${
                    settings.officeRestriction
                      ? 'bg-[#0B3B91]'
                      : 'bg-[#d9d9d9]'
                  }
                `}
              >

                <div
                  className={`
                    absolute top-[3px]
                    h-[22px] w-[22px]
                    sm:h-[24px] sm:w-[24px]
                    rounded-full bg-white
                    transition-all
                    ${
                      settings.officeRestriction
                        ? 'left-[25px] sm:left-[27px]'
                        : 'left-[3px]'
                    }
                  `}
                />

              </button>

            </div>

            {/* ITEM 3 */}
            <div className="flex items-start justify-between gap-4 sm:gap-6">

              <div className="flex-1">

                <h2 className="text-[14px] sm:text-[16px] font-medium text-black">
                  Set official work hours
                </h2>

                <p className="mt-2 text-[11px] sm:text-[12px] leading-[18px] sm:leading-[20px] text-gray-500">
                  Define standard work hours to
                  monitor work duration and
                  attendance consistency.
                </p>

              </div>

              <button
                onClick={() =>
                  toggleSetting('workHours')
                }
                className={`
                  relative h-[28px] w-[50px]
                  sm:h-[30px] sm:w-[54px]
                  rounded-full transition-all flex-shrink-0
                  ${
                    settings.workHours
                      ? 'bg-[#0B3B91]'
                      : 'bg-[#d9d9d9]'
                  }
                `}
              >

                <div
                  className={`
                    absolute top-[3px]
                    h-[22px] w-[22px]
                    sm:h-[24px] sm:w-[24px]
                    rounded-full bg-white
                    transition-all
                    ${
                      settings.workHours
                        ? 'left-[25px] sm:left-[27px]'
                        : 'left-[3px]'
                    }
                  `}
                />

              </button>

            </div>

            {/* ITEM 4 */}
            <div className="flex items-start justify-between gap-4 sm:gap-6">

              <div className="flex-1">

                <h2 className="text-[14px] sm:text-[16px] font-medium text-black">
                  Enable late attendance alerts
                </h2>

                <p className="mt-2 text-[11px] sm:text-[12px] leading-[18px] sm:leading-[20px] text-gray-500">
                  Receive notifications when employees
                  resume work later than the approved
                  work schedule.
                </p>

              </div>

              <button
                onClick={() =>
                  toggleSetting('lateAlerts')
                }
                className={`
                  relative h-[28px] w-[50px]
                  sm:h-[30px] sm:w-[54px]
                  rounded-full transition-all flex-shrink-0
                  ${
                    settings.lateAlerts
                      ? 'bg-[#0B3B91]'
                      : 'bg-[#d9d9d9]'
                  }
                `}
              >

                <div
                  className={`
                    absolute top-[3px]
                    h-[22px] w-[22px]
                    sm:h-[24px] sm:w-[24px]
                    rounded-full bg-white
                    transition-all
                    ${
                      settings.lateAlerts
                        ? 'left-[25px] sm:left-[27px]'
                        : 'left-[3px]'
                    }
                  `}
                />

              </button>

            </div>

            {/* ITEM 5 */}
            <div className="flex items-start justify-between gap-4 sm:gap-6">

              <div className="flex-1">

                <h2 className="text-[14px] sm:text-[16px] font-medium text-black">
                  Enable daily report reminders
                </h2>

                <p className="mt-2 text-[11px] sm:text-[12px] leading-[18px] sm:leading-[20px] text-gray-500">
                  Remind employees to submit their
                  daily work summaries before ending
                  their work session.
                </p>

              </div>

              <button
                onClick={() =>
                  toggleSetting('dailyReports')
                }
                className={`
                  relative h-[28px] w-[50px]
                  sm:h-[30px] sm:w-[54px]
                  rounded-full transition-all flex-shrink-0
                  ${
                    settings.dailyReports
                      ? 'bg-[#0B3B91]'
                      : 'bg-[#d9d9d9]'
                  }
                `}
              >

                <div
                  className={`
                    absolute top-[3px]
                    h-[22px] w-[22px]
                    sm:h-[24px] sm:w-[24px]
                    rounded-full bg-white
                    transition-all
                    ${
                      settings.dailyReports
                        ? 'left-[25px] sm:left-[27px]'
                        : 'left-[3px]'
                    }
                  `}
                />

              </button>

            </div>

          </div>

          {/* ========================================= */}
          {/* BUTTON */}
          {/* ========================================= */}

          <button
            onClick={handleFinishSetup}
            className="
              mx-auto mt-12 sm:mt-16 flex
              h-[44px] sm:h-[46px]
              w-full max-w-[360px]
              items-center justify-center
              rounded-md bg-[#0B3B91]
              text-[13px]
              font-medium text-white
              shadow-md
              transition hover:bg-[#082d70]
            "
          >
            Finish Setup
          </button>

        </div>

      </div>

      
      {/* FOOTER */}

      <div className="pb-5 sm:pb-6 text-center text-[10px] sm:text-[11px] text-gray-400">
        © 2025 All Rights Reserved Track.
      </div>

    </div>
  )
}

export default TrackingConfiguration