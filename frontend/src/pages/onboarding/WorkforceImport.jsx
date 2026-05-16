import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Folder } from 'lucide-react'
import api from '../../services/api'
import { BrandLogo } from '../../components/ui/BrandLogo'

const WorkforceImport = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBrowseFile = () => fileInputRef.current.click()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file only.')
      return
    }
    setSelectedFile(file)
  }

  const handleContinue = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first.')
      return
    }

    setError('')
    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target.result
        const rows = text.split('\n').filter(row => row.trim().length > 0)
        if (rows.length < 2) {
          setError('CSV file is empty or only contains headers.')
          setIsLoading(false)
          return
        }

        const workers = []
        for (let i = 1; i < rows.length; i++) {
          const columns = rows[i].split(',').map(c => c.trim())
          if (columns.length >= 3) {
            workers.push({
              first_name: columns[0] || '',
              last_name: columns[1] || '',
              email: columns[2] || '',
              department: columns[3] || '',
              employee_id: columns[4] || ''
            })
          }
        }

        const validWorkers = workers.filter(w => w.email)
        if (validWorkers.length === 0) {
          setError('Could not find valid email addresses in the CSV.')
          setIsLoading(false)
          return
        }

        await api.post('/users/workers/invite-bulk/', { workers: validWorkers })
        navigate('/tracking-configuration')
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to process CSV file.')
        setIsLoading(false)
      }
    }
    reader.readAsText(selectedFile)
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

        <div className="w-full max-w-sm">
          <div className="mb-4 flex justify-center">
            <BrandLogo />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold text-black">Import workforce</h1>
            <p className="mt-1 text-xs text-gray-500">
              Upload your staff list in bulk. (Step 2/4)
            </p>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-center gap-6 mb-8">
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-[#0B3B91]" />
                 <span className="text-xs font-medium text-black">CSV Upload</span>
               </div>
               <button 
                 onClick={() => navigate('/manual-workforce')}
                 className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
               >
                 <div className="h-2 w-2 rounded-full bg-gray-300" />
                 <span className="text-xs font-medium text-gray-500">Add Manually</span>
               </button>
            </div>

            <div
              onClick={handleBrowseFile}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-10 transition hover:border-[#0B3B91] hover:bg-white"
            >
              <Folder size={64} className="text-[#0B3B91] fill-[#0B3B91]/10" strokeWidth={1.5} />
              <p className="mt-4 text-sm font-semibold text-black">
                {selectedFile ? selectedFile.name : 'Select CSV file'}
              </p>
              <p className="mt-1 text-[11px] text-gray-400 text-center">
                Click to browse or drag and drop
              </p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </div>

            {error && <p className="mt-4 text-center text-xs text-red-500">{error}</p>}

            <button
              onClick={handleContinue}
              disabled={isLoading || !selectedFile}
              className="mt-8 h-9 w-full rounded-md bg-[#0B3B91] text-sm font-medium text-white hover:bg-[#082d70] disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </div>

          <p className="mt-12 text-center text-[10px] text-gray-400">
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
            Seamlessly migrate your team data with CSV bulk imports.
          </p>
          <div className="mt-8 flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0B3B91]">
               <Folder size={20} />
             </div>
             <div>
               <p className="text-sm font-semibold text-black">Bulk Data Upload</p>
               <p className="text-xs text-gray-500">Automatic Invitations</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkforceImport