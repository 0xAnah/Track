import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2 } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { BrandLogo } from '../../components/ui/BrandLogo'

const inputClass =
  'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-[#0B3B91]'

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

      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      setUser(response.data.user)
      localStorage.setItem('workspaceData', JSON.stringify(formData))
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
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT SIDE */}
      <div className="relative flex w-full items-center justify-center px-4 py-8 lg:w-1/2">
        {/* PROGRESS BAR */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
           <div className="h-full bg-[#0B3B91] transition-all duration-500" style={{ width: '25%' }} />
        </div>

        <div className="absolute left-4 top-6 sm:left-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-black"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-4 flex justify-center">
            <BrandLogo />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold text-black">Workspace setup</h1>
            <p className="mt-1 text-xs text-gray-500">
              Tell us about your organization. (Step 1/4)
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {error && <p className="text-center text-xs text-red-500">{error}</p>}

            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">Organization Name</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="e.g. Toby Refineries"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g. Oil & Gas"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">Employees</label>
                <input
                  type="number"
                  name="employees"
                  value={formData.employees}
                  onChange={handleChange}
                  placeholder="23"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-700">Work Hours</label>
                <input
                  type="text"
                  name="workHours"
                  value={formData.workHours}
                  onChange={handleChange}
                  placeholder="08:00 - 17:00"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-gray-700">Office Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="12, Market Road, Yaba"
                className={inputClass}
              />
            </div>

            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="h-9 w-full rounded-md bg-[#0B3B91] text-sm font-medium text-white hover:bg-[#082d70] disabled:opacity-50"
            >
              {isLoading ? 'Setting up...' : 'Continue'}
            </button>
          </div>

          <p className="mt-8 text-center text-[10px] text-gray-400">
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
            Personalize your workforce management experience.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0B3B91]">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Company Profile</p>
              <p className="text-xs text-gray-500">Configure your organization details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceSetup