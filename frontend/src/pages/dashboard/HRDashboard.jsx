import { useState, useEffect } from 'react'
import { Users, UserCheck, Activity, Flag, FileText, AlertTriangle } from 'lucide-react'
import api from '../../services/api'
import { MetricCard } from '../../components/layouts/MetricCard'

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-gray-100" />
    </div>
  )
}

function TierBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm font-medium text-gray-600">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-sm font-semibold">{count}</span>
    </div>
  )
}

export default function HRDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/users/dashboard/')
        if (mounted) setData(response.data)
      } catch (err) {
        if (mounted) setError(err.response?.data?.detail || 'Failed to load dashboard data.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchDashboard()
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertTriangle size={48} className="mb-4 text-red-400" />
        <p className="text-lg font-medium">{error}</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-4 text-sm text-[#0B3B91] hover:underline">
          Try again
        </button>
      </div>
    )
  }

  const total = data.total_workers || 0
  const td = data.tier_distribution || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-black sm:text-2xl">HR Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of company workforce and performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Workers" value={String(total)} icon={Users} iconColor="#0B3B91" />
        <MetricCard
          label="Today's Attendance"
          value={String(data.today_attendance_count ?? 0)}
          icon={UserCheck}
          iconColor="#16A34A"
        />
        <MetricCard
          label="Avg Team Score"
          value={`${data.average_team_score ?? 0} / 100`}
          icon={Activity}
          iconColor="#7C3AED"
        />
        <MetricCard
          label="Flagged"
          value={String(data.flagged_count ?? 0)}
          trend={{ value: 'Review needed', isPositive: false }}
          icon={Flag}
          iconColor="#DC2626"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 md:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={18} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Recent Worker Logs</h2>
          </div>

          {data.recent_worker_logs?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="pb-3 font-medium">Worker</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Score Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_worker_logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{log.worker_name}</td>
                      <td className="py-3 text-gray-600">{log.date}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            log.status === 'verified'
                              ? 'bg-green-100 text-green-700'
                              : log.status === 'flagged'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{log.ai_score_impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No logs submitted yet today.</div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={18} className="text-purple-600" />
            <h2 className="text-lg font-semibold">Tier Distribution</h2>
          </div>
          {total > 0 ? (
            <div className="space-y-3">
              <TierBar label="Elite" count={td.elite || 0} total={total} color="bg-purple-500" />
              <TierBar label="Solid" count={td.solid || 0} total={total} color="bg-blue-500" />
              <TierBar label="Standard" count={td.standard || 0} total={total} color="bg-gray-400" />
              <TierBar label="Flagged" count={td.flagged || 0} total={total} color="bg-red-500" />
            </div>
          ) : (
            <p className="text-sm text-gray-500">No workers assigned.</p>
          )}
        </div>
      </div>
    </div>
  )
}




