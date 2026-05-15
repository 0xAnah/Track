import { useCallback, useEffect, useState } from 'react'
import { Square } from 'lucide-react'
import {
  Clock01Icon,
  Clock02Icon,
  CheckmarkCircle01Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import api from '../../services/api'
import { PageHeader } from '../../components/layouts/PageHeader'
import { MetricCard } from '../../components/layouts/MetricCard'
import { METRIC_GROUP, TWO_COL_GRID } from '../../lib/layout'
import WorkSessionHistory from '../../components/dashboard/sessions/WorkSessionHistory'
import SessionDetails from '../../components/dashboard/sessions/SessionDetails'
import SessionTimeline from '../../components/dashboard/sessions/SessionTimeline'

const METRIC_ICONS = [Clock01Icon, Clock02Icon, CheckmarkCircle01Icon, ZapIcon]

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
        <div className="h-96 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-64 rounded-xl bg-gray-200" />
          <div className="h-72 rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export default function WorkSessionsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timelineDate, setTimelineDate] = useState(null)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [ending, setEnding] = useState(false)

  const fetchPage = useCallback(async () => {
    try {
      const response = await api.get('/work-sessions/')
      setData(response.data)
      setTimelineDate(response.data.default_timeline_date)
      setDurationSeconds(response.data.active_session?.duration_seconds ?? 0)
    } catch (err) {
      console.error('Failed to load work sessions', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  useEffect(() => {
    if (data?.active_session?.status !== 'active') return
    const interval = setInterval(() => {
      setDurationSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [data?.active_session?.status])

  const handleEndSession = async () => {
    setEnding(true)
    try {
      await api.post('/attendance/sign-out/')
      await fetchPage()
    } catch (err) {
      console.error('End session failed', err)
    } finally {
      setEnding(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  const metrics = data?.metrics ?? []
  const history = data?.history ?? []
  const timelineByDate = data?.timeline_by_date ?? {}
  const availableDates = Object.keys(timelineByDate)
  const timelineEvents = timelineDate ? timelineByDate[timelineDate] ?? [] : []

  const activeSession = data?.active_session
    ? { ...data.active_session, duration_seconds: durationSeconds }
    : null

  const endButton = (
    <button
      type="button"
      onClick={handleEndSession}
      disabled={ending || activeSession?.status !== 'active'}
      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#0B3B91] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#082d70] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Square size={16} />
      {ending ? 'Ending…' : 'End Work Session'}
    </button>
  )

  return (
    <div className="space-y-2">
      <PageHeader title="Work Sessions" action={endButton} />

      <div className={METRIC_GROUP}>
        <div className="metric-card-grid">
          {metrics.map((metric, i) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              icon={METRIC_ICONS[i] ?? Clock01Icon}
              iconColor={metric.iconColor}
            />
          ))}
        </div>
      </div>

      <div className={TWO_COL_GRID}>
        <WorkSessionHistory sessions={history} monthLabel="May 2026" showExport />
        <div className="flex flex-col gap-2">
          <SessionDetails
            session={activeSession}
            onEndSession={handleEndSession}
            endDisabled={ending}
          />
          <SessionTimeline
            events={timelineEvents}
            selectedDate={timelineDate}
            availableDates={availableDates}
            onDateChange={setTimelineDate}
          />
        </div>
      </div>
    </div>
  )
}
