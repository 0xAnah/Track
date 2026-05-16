import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Users } from 'lucide-react'
import api from '../../services/api'
import { BrandLogo } from '../../components/ui/BrandLogo'

const inputClass =
  'h-8 w-full rounded-md border border-gray-200 bg-white px-2.5 text-xs text-black outline-none placeholder:text-gray-400 focus:border-[#0B3B91]'

const ManualWorkforce = () => {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([
    { fullName: '', email: '', staffId: '', department: '' },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (index, field, value) => {
    const updatedEmployees = [...employees]
    updatedEmployees[index][field] = value
    setEmployees(updatedEmployees)
  }

  const handleAddEmployee = () => {
    setEmployees([...employees, { fullName: '', email: '', staffId: '', department: '' }])
  }

  const handleRemoveEmployee = (index) => {
    if (employees.length === 1) return
    setEmployees(employees.filter((_, i) => i !== index))
  }

  const handleContinue = async () => {
    setError('')
    setIsLoading(true)
    try {
      const formattedWorkers = employees.map(emp => {
        const nameParts = emp.fullName.trim().split(' ')
        return {
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: emp.email,
          department: emp.department,
          employee_id: emp.staffId,
        }
      })

      const validWorkers = formattedWorkers.filter(w => w.email)
      if (validWorkers.length === 0) {
        setError('Please enter at least one valid email.')
        setIsLoading(false)
        return
      }

      await api.post('/users/workers/invite-bulk/', { workers: validWorkers })
      navigate('/tracking-configuration')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send invites.')
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
           <div className="h-full bg-[#0B3B91] transition-all duration-500" style={{ width: '50%' }} />
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

        <div className="w-full max-w-lg">
          <div className="mb-4 flex justify-center">
            <BrandLogo />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold text-black">Add workforce manually</h1>
            <p className="mt-1 text-xs text-gray-500">
              Add employees individually. (Step 2/4)
            </p>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-center gap-6 mb-8">
               <button 
                 onClick={() => navigate('/workforce-import')}
                 className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
               >
                 <div className="h-2 w-2 rounded-full bg-gray-300" />
                 <span className="text-xs font-medium text-gray-500">CSV Upload</span>
               </button>
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-[#0B3B91]" />
                 <span className="text-xs font-medium text-black">Manual Entry</span>
               </div>
            </div>

            <div className="max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
              <div className="space-y-4">
                {employees.map((emp, index) => (
                  <div key={index} className="relative rounded-lg border border-gray-100 bg-gray-50/30 p-3">
                    {employees.length > 1 && (
                      <button 
                        onClick={() => handleRemoveEmployee(index)}
                        className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 flex items-center justify-center shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={emp.fullName}
                        onChange={(e) => handleChange(index, 'fullName', e.target.value)}
                        className={inputClass}
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={emp.email}
                        onChange={(e) => handleChange(index, 'email', e.target.value)}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Staff ID"
                        value={emp.staffId}
                        onChange={(e) => handleChange(index, 'staffId', e.target.value)}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Department"
                        value={emp.department}
                        onChange={(e) => handleChange(index, 'department', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddEmployee}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 hover:border-[#0B3B91] hover:text-[#0B3B91] transition-all"
            >
              <Plus size={14} />
              Add another employee
            </button>

            {error && <p className="mt-4 text-center text-xs text-red-500">{error}</p>}

            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="mt-8 h-9 w-full rounded-md bg-[#0B3B91] text-sm font-medium text-white hover:bg-[#082d70] disabled:opacity-50"
            >
              {isLoading ? 'Sending invites...' : 'Continue'}
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
            Build your workforce manually or in groups.
          </p>
          <div className="mt-8 flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0B3B91]">
               <Users size={20} />
             </div>
             <div>
               <p className="text-sm font-semibold text-black">Team Management</p>
               <p className="text-xs text-gray-500">Scale your workspace organically</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManualWorkforce