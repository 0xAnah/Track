import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings2 } from 'lucide-react'
import { BrandLogo } from '../../components/ui/BrandLogo'

const TrackingConfiguration = () => {
  const navigate = useNavigate()

  const [settings, setSettings] = useState({
    autoTracking: false,
    officeRestriction: true,
    workHours: false,
    lateAlerts: true,
    dailyReports: true,
  })

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleFinishSetup = () => {
    localStorage.setItem('trackingSettings', JSON.stringify(settings))
    navigate('/workspace-success')
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT SIDE */}
      <div className="relative flex w-full items-center justify-center px-4 py-8 lg:w-1/2">
        {/* PROGRESS BAR */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
           <div className="h-full bg-[#0B3B91] transition-all duration-500" style={{ width: '75%' }} />
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

        <div className="w-full max-sm">
          <div className="mb-4 flex justify-center">
            <BrandLogo />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold text-black">Tracking configuration</h1>
            <p className="mt-1 text-xs text-gray-500">
              Customize how work sessions are managed. (Step 3/4)
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {Object.entries({
              autoTracking: { label: 'Automatic Tracking', desc: 'Start sessions on login' },
              officeRestriction: { label: 'Office Restriction', desc: 'Login only at office' },
              workHours: { label: 'Set Work Hours', desc: 'Monitor attendance consistency' },
              lateAlerts: { label: 'Late Alerts', desc: 'Notify on late attendance' },
              dailyReports: { label: 'Daily Reports', desc: 'Remind users for summaries' },
            }).map(([key, { label, desc }]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 bg-gray-50/30">
                <div>
                  <h3 className="text-xs font-semibold text-black">{label}</h3>
                  <p className="text-[10px] text-gray-400">{desc}</p>
                </div>
                <button
                  onClick={() => toggleSetting(key)}
                  className={`relative h-5 w-9 rounded-full transition-all ${settings[key] ? 'bg-[#0B3B91]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${settings[key] ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
            ))}

            <button
              onClick={handleFinishSetup}
              className="mt-6 h-9 w-full rounded-md bg-[#0B3B91] text-sm font-medium text-white hover:bg-[#082d70] transition-all"
            >
              Finish Setup
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
            Automate your workflow with smart tracking rules.
          </p>
          <div className="mt-8 flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0B3B91]">
               <Settings2 size={20} />
             </div>
             <div>
               <p className="text-sm font-semibold text-black">System Rules</p>
               <p className="text-xs text-gray-500">Global workspace policies</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackingConfiguration