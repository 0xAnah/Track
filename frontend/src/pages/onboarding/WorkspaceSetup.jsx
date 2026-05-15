import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const WorkspaceSetup = () => {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [formData, setFormData] = useState({
    organizationName: '',
    industry: '',
    employees: '',
    address: '',
    workHours: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem('onboardingStep', '1')
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleContinue = async () => {
    if (!formData.organizationName) {
      setError('Organization name is required.')
      return
    }

    const hrSignupData = sessionStorage.getItem('hrSignupData')
    if (!hrSignupData) {
      setError('Signup session expired. Please restart registration.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const parsedData = JSON.parse(hrSignupData)
      const payload = {
        ...parsedData,
        company_name: formData.organizationName
      }

      const response = await api.post('/auth/signup/hr/', payload)

      // Store auth tokens
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      setUser(response.data.user)

      // Store workspace config for later (optional)
      localStorage.setItem('workspaceData', JSON.stringify(formData))

      // Clear temp session
      sessionStorage.removeItem('hrSignupData')

      navigate('/workforce-import')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.email?.[0] || err.response?.data?.username?.[0] || 'Failed to create workspace. Ensure your email is unique.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sans">

      {/* TOP AREA */}
      <div className="px-5 pt-5 sm:px-8 lg:px-16 lg:pt-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <div className="h-7 w-7 rounded-sm bg-[#0B3B91]" />

          {/* SIGN IN */}
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="hidden text-[13px] text-gray-500 sm:block">
              Already have an account?
            </p>

            <button
              className="
                rounded-md border border-gray-200
                bg-white px-3 py-1.5
                text-[11px] text-gray-500
                shadow-sm transition
                hover:bg-gray-50
              "
            >
              Sign In
            </button>
          </div>
        </div>

        {/* BACK + STEP */}
        <div className="mt-8 flex items-center justify-between">

          <button
            onClick={() => navigate(-1)}
            className="
              flex items-center gap-2
              text-[13px] text-gray-500
              transition hover:text-black
            "
          >
            <ArrowLeft size={15} />
            Go Back
          </button>

          <p className="text-[13px] text-gray-500">
            Step 1 / 4
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-4 h-[4px] w-full overflow-hidden rounded-full bg-[#ececec]">
          <div className="h-full w-1/4 rounded-full bg-[#0B3B91]" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex justify-center px-5 py-12 sm:px-8 lg:py-16">

        <div className="w-full max-w-[420px]">

          {/* TITLE */}
          <div className="text-center">

            <h1
              className="
                text-[28px] font-semibold
                tracking-[-0.5px]
                text-black
                sm:text-[34px]
              "
            >
              Let’s Set Up Your Workspace
            </h1>

            <p
              className="
                mx-auto mt-3 max-w-[320px]
                text-[14px]
                leading-[24px]
                text-gray-500
              "
            >
              Tell us about your organization to personalize
              your dashboard experience.
            </p>
          </div>

          {/* FORM */}
          <div className="mt-12 space-y-5">

            {/* ORGANIZATION */}
            <div>
              <label className="mb-2 block text-[14px] font-medium text-black">
                Organization Name
              </label>

              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Toby Refineries"
                className="
                  h-[46px] w-full rounded-md
                  border border-gray-200
                  bg-white px-4
                  text-[13px]
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-[#0B3B91]
                "
              />
            </div>

            {/* INDUSTRY */}
            <div>
              <label className="mb-2 block text-[14px] font-medium text-black">
                Industry
              </label>

              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="Oil & Gas"
                className="
                  h-[46px] w-full rounded-md
                  border border-gray-200
                  bg-white px-4
                  text-[13px]
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-[#0B3B91]
                "
              />
            </div>

            {/* EMPLOYEES */}
            <div>
              <label className="mb-2 block text-[14px] font-medium text-black">
                Number of Employees
              </label>

              <input
                type="number"
                name="employees"
                value={formData.employees}
                onChange={handleChange}
                placeholder="23"
                className="
                  h-[46px] w-full rounded-md
                  border border-gray-200
                  bg-white px-4
                  text-[13px]
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-[#0B3B91]
                "
              />
            </div>

            {/* ADDRESS */}
            <div>
              <label className="mb-2 block text-[14px] font-medium text-black">
                Office Address
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="12, Market Road, Yaba Lagos"
                className="
                  h-[46px] w-full rounded-md
                  border border-gray-200
                  bg-white px-4
                  text-[13px]
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-[#0B3B91]
                "
              />
            </div>

            {/* WORK HOURS */}
            <div>
              <label className="mb-2 block text-[14px] font-medium text-black">
                Official Work Hours
              </label>

              <input
                type="text"
                name="workHours"
                value={formData.workHours}
                onChange={handleChange}
                placeholder="08:00 am to 5:00 pm"
                className="
                  h-[46px] w-full rounded-md
                  border border-gray-200
                  bg-white px-4
                  text-[13px]
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-[#0B3B91]
                "
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* BUTTON */}
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="
                mt-2 h-[48px] w-full
                rounded-md
                bg-[#0B3B91]
                text-[14px]
                font-medium
                text-white
                shadow-md
                transition hover:bg-[#082d70]
                disabled:opacity-50
              "
            >
              {isLoading ? 'Creating Workspace...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
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

export default WorkspaceSetup