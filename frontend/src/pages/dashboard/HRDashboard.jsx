import { useState, useEffect } from 'react'
import api from '../../services/api'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import { Users, UserCheck, Activity, FileText, Flag, AlertTriangle } from 'lucide-react'

function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-6 lg:p-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2" />
        ))}
      </div>
    </div>
  )
}

function TierBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium w-20 text-gray-600">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold w-8 text-right">{count}</span>
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
    return () => { mounted = false }
  }, [])

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

  const total = data.total_workers || 0
  const td = data.tier_distribution || {}

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <DashboardHeader />

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of company workforce and performance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-[#0B3B91]" />
            <h2 className="text-lg font-semibold">Total Workers</h2>
          </div>
          <div className="text-3xl font-bold">{total}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck size={18} className="text-green-600" />
            <h2 className="text-lg font-semibold">Today&apos;s Attendance</h2>
          </div>
          <div className="text-3xl font-bold text-green-600">{data.today_attendance_count}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-purple-600" />
            <h2 className="text-lg font-semibold">Avg Team Score</h2>
          </div>
          <div className="text-3xl font-bold">{data.average_team_score} / 100</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Flag size={18} className="text-red-500" />
            <h2 className="text-lg font-semibold">Flagged</h2>
          </div>
          <div className="text-3xl font-bold text-red-500">{data.flagged_count}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
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
                        <td className="py-3 text-gray-900 font-medium">{log.worker_name}</td>
                        <td className="py-3 text-gray-600">{log.date}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.status === 'verified' ? 'bg-green-100 text-green-700' :
                            log.status === 'flagged' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
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
              <div className="text-gray-500 text-center py-8">No logs submitted yet today.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
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
              <p className="text-gray-500 text-sm">No workers assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
