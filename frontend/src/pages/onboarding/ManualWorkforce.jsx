import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import api from '../../services/api'

const ManualWorkforce = () => {

  const navigate = useNavigate()

  const [employees, setEmployees] = useState([
    {
      fullName: '',
      email: '',
      staffId: '',
      department: '',
      role: '',
      phone: '',
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  /* ========================================= */
  /* HANDLE INPUT CHANGE */
  /* ========================================= */

  const handleChange = (index, field, value) => {

    const updatedEmployees = [...employees]

    updatedEmployees[index][field] = value

    setEmployees(updatedEmployees)
  }

  /* ========================================= */
  /* ADD EMPLOYEE */
  /* ========================================= */

  const handleAddEmployee = () => {

    setEmployees([
      ...employees,
      {
        fullName: '',
        email: '',
        staffId: '',
        department: '',
        role: '',
        phone: '',
      },
    ])
  }

  /* ========================================= */
  /* CONTINUE */
  /* ========================================= */

  const handleContinue = async () => {
    setError('')
    setIsLoading(true)

    try {
      // Map frontend state to backend expected format
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

      // Remove empty entries (where email is blank)
      const validWorkers = formattedWorkers.filter(w => w.email)

      if (validWorkers.length === 0) {
        setError('Please enter at least one valid employee with an email address.')
        setIsLoading(false)
        return
      }

      await api.post('/users/workers/invite-bulk/', { workers: validWorkers })
      
      // Success, move to the next screen
      navigate('/tracking-configuration')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to send invites. Please check your data.')
    } finally {
      setIsLoading(false)
    }
  }

  return (

    <div className='min-h-screen bg-[#f8f8f8] font-sans'>

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className='px-5 pt-5 sm:px-8 lg:px-16 lg:pt-6'>

        {/* TOP BAR */}
        <div className='flex items-center justify-between'>

          {/* LOGO */}
          <div className='h-7 w-7 rounded-sm bg-[#0B3B91]' />

          {/* SIGN IN */}
          <div className='flex items-center gap-3'>

            <p className='hidden text-[13px] text-gray-500 sm:block'>
              Already have an account?
            </p>

            <button
              className='
                rounded-[4px]
                border border-gray-200
                bg-white
                px-3 py-1
                text-[11px]
                text-gray-500
              '
            >
              Sign In
            </button>

          </div>

        </div>

        {/* BACK + STEP */}
        <div className='mt-10 flex items-center justify-between'>

          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className='
              flex items-center gap-2
              text-[13px] text-gray-500
            '
          >
            <ArrowLeft size={15} />
            Go Back
          </button>

          {/* STEP */}
          <p className='text-[13px] text-gray-500'>
            Step 2 / 4
          </p>

        </div>

        {/* PROGRESS BAR */}
        <div
          className='
            mt-4 h-[4px]
            w-full overflow-hidden
            rounded-full bg-[#ececec]
          '
        >

          <div
            className='
              h-full w-2/4
              rounded-full bg-[#0B3B91]
            '
          />

        </div>

      </div>

      {/* ========================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================= */}

      <div className='flex justify-center px-5 py-12'>

        <div className='w-full max-w-[420px]'>

          {/* TITLE */}
          <div className='text-center'>

            <h1
              className='
                text-[22px]
                font-semibold
                text-black
              '
            >
              Import Your Workforce
            </h1>

            <p
              className='
                mx-auto mt-2
                max-w-[290px]
                text-[14px]
                leading-[22px]
                text-gray-500
              '
            >
              Add employees individually or upload
              your staff list in bulk.
            </p>

          </div>

          {/* ========================================= */}
          {/* EMPLOYEE FORMS */}
          {/* ========================================= */}

          <div className='mt-12 space-y-10'>

            {employees.map((employee, index) => (

              <div
                key={index}
                className='space-y-5'
              >

                {/* FULL NAME */}
                <div>

                  <label
                    className='
                      mb-2 block
                      text-[14px]
                      font-medium
                      text-black
                    '
                  >
                    Full Name
                  </label>

                  <input
                    type='text'
                    value={employee.fullName}
                    onChange={(e) =>
                      handleChange(
                        index,
                        'fullName',
                        e.target.value
                      )
                    }
                    placeholder='Toby Wilson'
                    className='
                      h-[42px] w-full
                      rounded-[4px]
                      border border-gray-200
                      bg-white px-4
                      text-[13px]
                      outline-none
                      placeholder:text-gray-400
                      focus:border-[#0B3B91]
                    '
                  />

                </div>

                {/* EMAIL ADDRESS */}
                <div>

                  <label
                    className='
                      mb-2 block
                      text-[14px]
                      font-medium
                      text-black
                    '
                  >
                    Email Address
                  </label>

                  <input
                    type='email'
                    value={employee.email}
                    onChange={(e) =>
                      handleChange(
                        index,
                        'email',
                        e.target.value
                      )
                    }
                    placeholder='toby@track.com'
                    required
                    className='
                      h-[42px] w-full
                      rounded-[4px]
                      border border-gray-200
                      bg-white px-4
                      text-[13px]
                      outline-none
                      placeholder:text-gray-400
                      focus:border-[#0B3B91]
                    '
                  />

                </div>

                {/* STAFF ID */}
                <div>

                  <label
                    className='
                      mb-2 block
                      text-[14px]
                      font-medium
                      text-black
                    '
                  >
                    Staff ID
                  </label>

                  <input
                    type='text'
                    value={employee.staffId}
                    onChange={(e) =>
                      handleChange(
                        index,
                        'staffId',
                        e.target.value
                      )
                    }
                    placeholder='2340981'
                    className='
                      h-[42px] w-full
                      rounded-[4px]
                      border border-gray-200
                      bg-white px-4
                      text-[13px]
                      outline-none
                      placeholder:text-gray-400
                      focus:border-[#0B3B91]
                    '
                  />

                </div>

                {/* DEPARTMENT */}
                <div>

                  <label
                    className='
                      mb-2 block
                      text-[14px]
                      font-medium
                      text-black
                    '
                  >
                    Department
                  </label>

                  <input
                    type='text'
                    value={employee.department}
                    onChange={(e) =>
                      handleChange(
                        index,
                        'department',
                        e.target.value
                      )
                    }
                    placeholder='Content'
                    className='
                      h-[42px] w-full
                      rounded-[4px]
                      border border-gray-200
                      bg-white px-4
                      text-[13px]
                      outline-none
                      placeholder:text-gray-400
                      focus:border-[#0B3B91]
                    '
                  />

                </div>

                {/* ROLE */}
                <div>

                  <label
                    className='
                      mb-2 block
                      text-[14px]
                      font-medium
                      text-black
                    '
                  >
                    Role
                  </label>

                  <input
                    type='text'
                    value={employee.role}
                    onChange={(e) =>
                      handleChange(
                        index,
                        'role',
                        e.target.value
                      )
                    }
                    placeholder='Social Media Strategist'
                    className='
                      h-[42px] w-full
                      rounded-[4px]
                      border border-gray-200
                      bg-white px-4
                      text-[13px]
                      outline-none
                      placeholder:text-gray-400
                      focus:border-[#0B3B91]
                    '
                  />

                </div>

                {/* PHONE */}
                <div>

                  <label
                    className='
                      mb-2 block
                      text-[14px]
                      font-medium
                      text-black
                    '
                  >
                    Phone Number
                  </label>

                  <input
                    type='text'
                    value={employee.phone}
                    onChange={(e) =>
                      handleChange(
                        index,
                        'phone',
                        e.target.value
                      )
                    }
                    placeholder='09138070568'
                    className='
                      h-[42px] w-full
                      rounded-[4px]
                      border border-gray-200
                      bg-white px-4
                      text-[13px]
                      outline-none
                      placeholder:text-gray-400
                      focus:border-[#0B3B91]
                    '
                  />

                </div>

              </div>

            ))}

          </div>

          {/* ========================================= */}
          {/* ADD BUTTON */}
          {/* ========================================= */}

          <div className='mt-7 flex justify-center'>

            <button
              onClick={handleAddEmployee}
              className='
                flex h-8 w-8
                items-center justify-center
                rounded-[4px]
                border border-gray-200
                bg-white text-gray-300
                transition
                hover:border-[#0B3B91]
                hover:text-[#0B3B91]
              '
            >
              <Plus size={16} />
            </button>

          </div>

          {/* ========================================= */}
          {/* CONTINUE BUTTON */}
          {/* ========================================= */}

          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

          <button
            onClick={handleContinue}
            disabled={isLoading}
            className='
              mx-auto mt-10 flex
              h-[44px] w-full
              items-center justify-center
              rounded-[4px]
              bg-[#0B3B91]
              text-[13px]
              font-medium text-white
              shadow-md
              transition hover:bg-[#082d70]
              disabled:opacity-50
            '
          >
            {isLoading ? 'Sending Invites...' : 'Continue'}
          </button>

        </div>

      </div>

      {/* ========================================= */}
      {/* FOOTER */}
      {/* ========================================= */}

      <div
        className='
          pb-6 text-center
          text-[11px]
          text-gray-400
        '
      >
        © 2025 All Rights Reserved Track.
      </div>

    </div>
  )
}

export default ManualWorkforce