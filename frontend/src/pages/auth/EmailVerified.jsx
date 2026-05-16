import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandLogo } from '../../components/ui/BrandLogo'

const EmailVerified = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT SIDE */}
      <div className="relative flex w-full items-center justify-center px-4 py-8 lg:w-1/2">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 flex justify-center">
            <BrandLogo />
          </div>

          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Check size={24} strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-xl font-semibold text-black">Email verified</h1>
          <p className="mt-1 text-xs text-gray-500">
            Great! Your account is now ready to go.
          </p>

          <button
            onClick={() => navigate('/workspace-setup')}
            className="mt-8 h-9 w-full rounded-md bg-[#0B3B91] text-sm font-medium text-white hover:bg-[#082d70] shadow-sm transition"
          >
            Continue
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
             <Check size={32} className="text-[#0B3B91]" />
          </div>
          <p className="text-2xl font-bold leading-snug tracking-tight text-black">
            Verification complete. You're just one step away from your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerified