import { useState, useEffect, useCallback } from 'react'
import { Power, AlertTriangle } from 'lucide-react'
import {
  Clock01Icon,
  CheckmarkCircle01Icon,
  File01Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import api from '../../services/api'
import { MetricCard } from '../../components/layouts/MetricCard'
import { METRIC_GROUP, TWO_COL_GRID } from '../../lib/layout'
import MonthlyHoursChart from '../../components/dashboard/charts/MonthlyHoursChart'
import WorkSessionHistory from '../../components/dashboard/sessions/WorkSessionHistory'
import PerformanceOverview from '../../components/dashboard/charts/PerformanceOverview'
import RecentNotifications from '../../components/dashboard/widgets/RecentNotifications'
import SubmitReport from '../../components/dashboard/widgets/SubmitReport'

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-9 w-48 rounded-lg bg-gray-200" />
      <div className="rounded-xl bg-gray-100 p-2">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white" />
          ))}
        </div>
      </div>
      <div className={TWO_COL_GRID}>
        <div className="h-80 rounded-xl bg-gray-200" />
        <div className="h-80 rounded-xl bg-gray-200" />
      </div>
      <div className={TWO_COL_GRID}>
        <div className="h-72 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-32 rounded-xl bg-gray-200" />
          <div className="h-40 rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    setSessionLoading(true)
    try {
      const status = data?.today_session?.status || 'not_started'
      if (status === 'signed_in') {
        await api.post('/attendance/sign-out/')
      } else {
        await api.post('/attendance/sign-in/')
      }
      await fetchDashboard()
    } catch (err) {
      console.error('Session toggle failed', err)
    } finally {
      setSessionLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertTriangle size={48} className="mb-4 text-red-400" />
        <p className="text-lg font-medium">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-[#0B3B91] hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  const sessionStatus = data?.today_session?.status || 'not_started'
  const isActive = sessionStatus === 'signed_in'
  const sessionButtonLabel = isActive ? 'End Work Session' : 'Start Work Session'
  const startedLabel =
    isActive && data?.today_session?.sign_in_time
      ? `Since ${formatTime(data.today_session.sign_in_time)}`
      : 'Not started'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-medium text-black sm:text-xl">Dashboard</h1>
        <button
          type="button"
          onClick={handleSessionToggle}
          disabled={sessionLoading}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#0B3B91] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#082d70] disabled:opacity-60"
        >
          <Power size={16} />
          {sessionLoading ? 'Please wait…' : sessionButtonLabel}
        </button>
      </div>

      <div className={METRIC_GROUP}>
        <div className="metric-card-grid">
          <MetricCard
            label="Current Work Session"
            value={isActive ? 'Active' : 'Inactive'}
            trend={{ value: startedLabel, isPositive: isActive }}
            icon={Clock01Icon}
            iconColor="#16A34A"
          />
          <MetricCard
            label="Attendance Rate"
            value={`${data?.attendance_rate || 0}%`}
            trend={{ value: '2.0% vs last month', isPositive: true }}
            icon={CheckmarkCircle01Icon}
            iconColor="#0B3B91"
          />
          <MetricCard
            label="Daily Reports"
            value={`${data?.today_log_submitted ? 1 : 0} / 1`}
            trend={{ value: '2.0% vs last month', isPositive: true }}
            icon={File01Icon}
            iconColor="#7C3AED"
          />
          <MetricCard
            label="Activity Score"
            value={`${data?.current_activity_score || 0} / 100`}
            valueCompact={`${data?.current_activity_score || 0}/100`}
            trend={{ value: '2.0% vs last month', isPositive: true }}
            icon={ZapIcon}
            iconColor="#C2410C"
          />
        </div>
      </div>

      <div className={TWO_COL_GRID}>
        <MonthlyHoursChart
          data={data?.monthly_hours || []}
          total={data?.monthly_hours_total}
          trend={data?.monthly_hours_trend}
        />
        <PerformanceOverview performance={data?.performance} />
      </div>

      <div className={TWO_COL_GRID}>
        <WorkSessionHistory sessions={data?.recent_attendance_sessions || []} />
        <div className="flex flex-col gap-2">
          <SubmitReport onLogSubmitted={fetchDashboard} />
          <RecentNotifications />
        </div>
      </div>
    </div>
  )
}
