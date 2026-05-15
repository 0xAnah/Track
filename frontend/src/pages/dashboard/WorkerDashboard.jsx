import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import MonthlyHoursChart from '../../components/dashboard/MonthlyHoursChart'
import AttendanceRate from '../../components/dashboard/AttendanceRate'
import ActivityScore from '../../components/dashboard/ActivityScore'
import WorkSessionHistory from '../../components/dashboard/WorkSessionHistory'
import CurrentWorkSession from '../../components/dashboard/CurrentWorkSession'
import DailyReports from '../../components/dashboard/DailyReports'
import PerformanceOverview from '../../components/dashboard/PerformanceOverview'
import RecentNotifications from '../../components/dashboard/RecentNotifications'
import SubmitReport from '../../components/dashboard/SubmitReport'
import { AlertTriangle } from 'lucide-react'

function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 h-80" />
          <div className="bg-white rounded-2xl p-6 border border-gray-100 h-48" />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 h-48" />
          <div className="bg-white rounded-2xl p-6 border border-gray-100 h-32" />
        </div>
      </div>
    </div>
  )
}

export default function WorkerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get('/users/dashboard/')
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleSessionToggle = async () => {
    if (!data?.today_session) return
    setSessionLoading(true)
    try {
      if (data.today_session.status === 'signed_in') {
        await api.post('/attendance/sign-out/')
      } else {
        await api.post('/attendance/sign-in/')
      }
      await fetchDashboard()
    } catch (err) {
      console.error('Failed to toggle session', err)
    } finally {
      setSessionLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <DashboardHeader />
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <AlertTriangle size={48} className="text-red-400 mb-4" />
          <p className="text-lg font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-sm text-[#0B3B91] hover:underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  const sessionStatus = data?.today_session?.status || 'not_started'
  const sessionButtonLabel = sessionStatus === 'signed_in' ? 'End Work Session' : 'Start Work Session'

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <DashboardHeader />

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of your work activity and performance</p>
          </div>

          <button
            onClick={handleSessionToggle}
            disabled={sessionLoading}
            className="w-full sm:w-auto bg-[#0B3B91] hover:bg-[#082d70] text-white px-6 py-3 rounded-md font-medium transition shadow-md disabled:opacity-60"
          >
            {sessionLoading ? 'Please wait...' : sessionButtonLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        <CurrentWorkSession
          isActive={sessionStatus === 'signed_in'}
          startTime={data?.today_session?.sign_in_time}
        />
        <AttendanceRate percent={data?.attendance_rate || 0} />
        <DailyReports count={data?.today_log_submitted ? 1 : 0} total={1} />
        <ActivityScore score={data?.current_activity_score || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <MonthlyHoursChart data={data?.weekly_hours || []} />
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 overflow-hidden">
            <WorkSessionHistory sessions={data?.recent_attendance_sessions || []} />
          </div>
        </div>

        <div className="space-y-6 order-1 lg:order-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:aspect-square flex flex-col justify-center">
            <PerformanceOverview />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SubmitReport onLogSubmitted={fetchDashboard} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <RecentNotifications />
          </div>
        </div>
      </div>
    </div>
  )
}
