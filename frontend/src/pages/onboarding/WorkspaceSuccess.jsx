import { useNavigate } from 'react-router-dom'
import { Check, Rocket } from 'lucide-react'
import { BrandLogo } from '../../components/ui/BrandLogo'

export default function WorkspaceSuccess() {
  const navigate = useNavigate()

  const handleDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT SIDE */}
      <div className="relative flex w-full items-center justify-center px-4 py-8 lg:w-1/2">
        {/* PROGRESS BAR */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
           <div className="h-full bg-[#0B3B91] transition-all duration-500" style={{ width: '100%' }} />
        </div>

        <div className="w-full max-w-sm text-center">
          <div className="mb-4 flex justify-center">
            <BrandLogo />
          </div>

          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Check size={24} strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-black">Workspace ready!</h1>
          <p className="mt-1 text-xs text-gray-500">
            Your organization has been successfully set up.
          </p>

          <button
            onClick={handleDashboard}
            className="mt-8 h-9 w-full rounded-md bg-[#0B3B91] text-sm font-medium text-white hover:bg-[#082d70] shadow-sm transition"
          >
            Go to Dashboard
          </button>

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
        <div className="relative z-10 max-w-md px-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100">
             <Rocket size={32} className="text-[#0B3B91]" />
          </div>
          <p className="text-2xl font-bold leading-snug tracking-tight text-black">
            You're all set. Start managing your workforce with ease.
          </p>
        </div>
      </div>
    </div>
  )
}