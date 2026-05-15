import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Folder } from 'lucide-react'
import api from '../../services/api'

const WorkforceImport = () => {

  const navigate = useNavigate()

  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  /* ========================================= */
  /* BROWSE FILE */
  /* ========================================= */

  const handleBrowseFile = () => {
    fileInputRef.current.click()
  }

  /* ========================================= */
  /* FILE CHANGE */
  /* ========================================= */

  const handleFileChange = (e) => {

    const file = e.target.files[0]

    if (!file) return

    if (!file.name.endsWith('.csv')) {

      alert('Please upload a CSV file only.')

      return
    }

    setSelectedFile(file)
  }

  /* ========================================= */
  /* CONTINUE CSV */
  /* ========================================= */

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
        
        // Ensure at least one row besides header
        if (rows.length < 2) {
          setError('CSV file is empty or only contains headers.')
          setIsLoading(false)
          return
        }

        const workers = []
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
          const columns = rows[i].split(',').map(c => c.trim())
          if (columns.length >= 3) { // At minimum we need some data, specifically email
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
        console.error(err)
        setError(err.response?.data?.detail || 'Failed to process CSV file.')
        setIsLoading(false)
      }
    }
    
    reader.onerror = () => {
      setError('Error reading file.')
      setIsLoading(false)
    }

    reader.readAsText(selectedFile)
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
            Step 2 / 4
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
              h-full w-2/4
              rounded-full bg-[#0B3B91]
            "
          />

        </div>

      </div>

      {/* ========================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================= */}

      <div className="flex justify-center px-5 py-14">

        <div className="w-full max-w-[640px]">

          {/* TITLE */}
          <div className="text-center">

            <h1 className="text-[22px] font-semibold text-black">
              Import Your Workforce
            </h1>

            <p
              className="
                mx-auto mt-2
                max-w-[420px]
                text-[14px]
                leading-[22px]
                text-gray-500
              "
            >
              Upload your staff list in bulk. Ensure your CSV has the following columns in exact order: 
              <strong> FirstName, LastName, Email, Department, EmployeeID</strong>.
              <br/>(The first row is ignored as headers).
            </p>

          </div>

          {/* ========================================= */}
          {/* OPTIONS */}
          {/* ========================================= */}

          <div className="mt-10 flex items-center justify-center gap-8">

            {/* CSV OPTION */}
            <div className="flex items-center gap-2">

              <div
                className="
                  flex h-4 w-4
                  items-center justify-center
                  rounded-full border
                  border-[#0B3B91]
                "
              >

                <div className="h-2 w-2 rounded-full bg-[#0B3B91]" />

              </div>

              <span className="text-[13px] text-black">
                Upload CSV
              </span>

            </div>

            {/* MANUAL OPTION */}
            <button
              onClick={() =>
                navigate('/manual-workforce')
              }
              className="flex items-center gap-2"
            >

              <div
                className="
                  flex h-4 w-4
                  items-center justify-center
                  rounded-full border
                  border-gray-300
                "
              />

              <span className="text-[13px] text-gray-500">
                Add Manually
              </span>

            </button>

          </div>

          {/* ========================================= */}
          {/* CSV AREA */}
          {/* ========================================= */}

          <div className="mt-12">

            {/* DRAG + DROP */}
            <div
              onClick={handleBrowseFile}
              className="
                flex cursor-pointer flex-col
                items-center justify-center
                rounded-sm border
                border-dashed border-[#d9d9d9]
                px-6 py-14
                transition hover:border-[#0B3B91]
              "
            >

              {/* ICON */}
              <Folder
                size={68}
                className="fill-[#0B3B91] text-[#0B3B91]"
                strokeWidth={1.6}
              />

              {/* FILE NAME */}
              <h2 className="mt-5 text-[15px] font-semibold text-black">

                {selectedFile
                  ? selectedFile.name
                  : 'Select a CSV file to upload'}

              </h2>

              {/* SUBTEXT */}
              <p className="mt-1 text-[12px] text-gray-400">
                or drag and drop it here
              </p>

              {/* INPUT */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

            </div>

            {/* URL INPUT */}
            <div className="mt-5">

              <p className="mb-2 text-[12px] text-black">
                Or upload from a URL
              </p>

              <div
                className="
                  flex items-center overflow-hidden
                  rounded-sm border border-gray-200
                  bg-white
                "
              >

                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) =>
                    setFileUrl(e.target.value)
                  }
                  placeholder="Add the file URL"
                  className="
                    h-[40px] flex-1
                    px-4 text-[12px]
                    outline-none
                    placeholder:text-gray-400
                  "
                />

                <button
                  className="
                    mr-1 rounded-sm border
                    border-gray-200
                    bg-[#f7f7f7]
                    px-4 py-1.5
                    text-[11px]
                    text-black
                  "
                >
                  Upload
                </button>

              </div>

            </div>

          </div>

          {/* ========================================= */}
          {/* CONTINUE */}
          {/* ========================================= */}

          {error && <p className="text-red-500 text-sm text-center mt-6">{error}</p>}

          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="
              mx-auto mt-12 flex
              h-[44px] w-full max-w-[360px]
              items-center justify-center
              rounded-md bg-[#0B3B91]
              text-[13px]
              font-medium text-white
              shadow-md
              transition hover:bg-[#082d70]
              disabled:opacity-50
            "
          >
            {isLoading ? 'Processing...' : 'Continue'}
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

export default WorkforceImport