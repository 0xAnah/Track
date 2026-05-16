import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  Users,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Bell,
  FileText,
  Building,
} from 'lucide-react'
import {
  UserGroupIcon,
  UserCheck01Icon,
  ActivityCircleIcon,
  Flag01Icon,
} from '@hugeicons/core-free-icons'
import api from '../../services/api'
import { MetricCard } from '../../components/layouts/MetricCard'
import { workers as mockWorkers } from '@data/workers'
import AIChatbot from '../../components/dashboard/widgets/AIChatbot'

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="h-72 rounded-2xl bg-gray-100" />
        <div className="space-y-4">
          <div className="h-32 rounded-2xl bg-gray-100" />
          <div className="h-40 rounded-2xl bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

function TierBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm font-medium text-gray-600">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-9 text-right text-sm font-semibold">{count}</span>
    </div>
  )
}

export default function HRDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teamPayments, setTeamPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)

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

    const fetchTeamPayments = async () => {
      try {
        const response = await api.get('/payments/team/')
        if (mounted) setTeamPayments(response.data)
      } catch (err) {
        console.error('Failed to fetch team payment mock data:', err)
      } finally {
        if (mounted) setPaymentsLoading(false)
      }
    }

    fetchDashboard()
    fetchTeamPayments()

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
  const attendanceRate = total > 0 ? Math.round(((data.today_attendance_count || 0) / total) * 100) : 0
  const flaggedLogs = data.recent_worker_logs?.filter((log) => log.status === 'flagged') || []

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0B3B91]">HR portal</p>
            <h1 className="mt-3 text-3xl font-semibold text-black">Workforce & payroll command center</h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-500">
              Monitor team attendance, identify flagged workers, and jump to the HR tools you use every day.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-[#EFF6FF] px-4 py-3 text-center text-sm font-semibold text-[#1D4ED8]">Live team snapshot</div>
            <div className="rounded-2xl bg-[#ECFDF5] px-4 py-3 text-center text-sm font-semibold text-[#166534]">HR metrics</div>
            <div className="rounded-2xl bg-[#FEF3C7] px-4 py-3 text-center text-sm font-semibold text-[#B45309]">Review & action</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total workers" value={String(total)} icon={UserGroupIcon} iconColor="#0B3B91" />
        <MetricCard
          label="Today present"
          value={`${data.today_attendance_count || 0}`}
          valueCompact={`${attendanceRate}%`}
          icon={UserCheck01Icon}
          iconColor="#16A34A"
        />
        <MetricCard
          label="Team health"
          value={`${data.average_team_score ?? 0}/100`}
          icon={ActivityCircleIcon}
          iconColor="#7C3AED"
        />
        <MetricCard
          label="Flagged workers"
          value={String(data.flagged_count || 0)}
          trend={{ value: 'Review needed', isPositive: false }}
          icon={Flag01Icon}
          iconColor="#DC2626"
        />
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Workforce</p>
            <h2 className="mt-1 text-lg font-semibold text-black">All workers</h2>
          </div>
          <Link to="/workers" className="text-sm font-semibold text-[#0B3B91] hover:underline">
            View full directory
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-3.5 font-medium rounded-l-xl">Name</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Department</th>
                <th className="px-5 py-3.5 font-medium">Score</th>
                <th className="px-5 py-3.5 font-medium">Tier</th>
                <th className="px-5 py-3.5 font-medium rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockWorkers.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{w.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{w.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <Building size={13} />
                      {w.department}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-semibold ${
                      w.score >= 80 ? 'text-green-600' : w.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {w.score}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      w.tier === 'elite' ? 'bg-purple-100 text-purple-700' :
                      w.tier === 'solid' ? 'bg-blue-100 text-blue-700' :
                      w.tier === 'flagged' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {w.tier}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                      w.status === 'active' ? 'bg-green-100 text-green-700' :
                      w.status === 'on_leave' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {w.status === 'on_leave' ? 'On Leave' : w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Quick actions</p>
                <h2 className="mt-2 text-lg font-semibold text-black">Jump to HR tools</h2>
              </div>
              <Link to="/workers" className="text-sm font-semibold text-[#0B3B91] hover:underline">
                Open team directory
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                to="/workers"
                className="group rounded-2xl border border-gray-200 bg-[#F8FAFF] p-4 transition hover:border-[#0B3B91] hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-[#0B3B91]" />
                  <div>
                    <p className="text-sm font-semibold text-black">Worker directory</p>
                    <p className="text-xs text-gray-500">Manage team assignments.</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/leave-requests"
                className="group rounded-2xl border border-gray-200 bg-[#F8FAFF] p-4 transition hover:border-[#0B3B91] hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck size={20} className="text-[#0B3B91]" />
                  <div>
                    <p className="text-sm font-semibold text-black">Leave requests</p>
                    <p className="text-xs text-gray-500">Approve or reject leave.</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/reports"
                className="group rounded-2xl border border-gray-200 bg-[#F8FAFF] p-4 transition hover:border-[#0B3B91] hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-[#0B3B91]" />
                  <div>
                    <p className="text-sm font-semibold text-black">Monthly reports</p>
                    <p className="text-xs text-gray-500">View audit-ready reporting.</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/hr-payments"
                className="group rounded-2xl border border-gray-200 bg-[#F8FAFF] p-4 transition hover:border-[#0B3B91] hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-[#0B3B91]" />
                  <div>
                    <p className="text-sm font-semibold text-black">Payroll</p>
                    <p className="text-xs text-gray-500">Process salaries and review payroll.</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/worker-credentials"
                className="group rounded-2xl border border-gray-200 bg-[#F8FAFF] p-4 transition hover:border-[#0B3B91] hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList size={20} className="text-[#0B3B91]" />
                  <div>
                    <p className="text-sm font-semibold text-black">Credential file</p>
                    <p className="text-xs text-gray-500">Download worker invites.</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/notifications"
                className="group rounded-2xl border border-gray-200 bg-[#F8FAFF] p-4 transition hover:border-[#0B3B91] hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-[#0B3B91]" />
                  <div>
                    <p className="text-sm font-semibold text-black">Notifications</p>
                    <p className="text-xs text-gray-500">Track alerts and updates.</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Recent worker logs</p>
                <h2 className="mt-1 text-lg font-semibold text-black">Latest team submissions</h2>
              </div>
              <Link to="/reports" className="text-sm font-semibold text-[#0B3B91] hover:underline">
                See all logs
              </Link>
            </div>

            <div className="space-y-3">
              {data.recent_worker_logs?.map((log) => (
                <div key={log.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-black">{log.worker_name}</p>
                      <p className="text-sm text-gray-500">{log.date}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase ${
                        log.status === 'verified'
                          ? 'bg-green-100 text-green-700'
                          : log.status === 'flagged'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700">
                      <Activity size={12} /> {log.ai_score_impact} impact
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700">
                      <FileText size={12} /> Review log
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Team health</p>
                <h2 className="mt-1 text-lg font-semibold text-black">Tier distribution</h2>
              </div>
              <div className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">{total} workers</div>
            </div>
            <div className="space-y-4">
              <TierBar label="Elite" count={td.elite || 0} total={total} color="bg-purple-500" />
              <TierBar label="Solid" count={td.solid || 0} total={total} color="bg-blue-500" />
              <TierBar label="Standard" count={td.standard || 0} total={total} color="bg-gray-400" />
              <TierBar label="Flagged" count={td.flagged || 0} total={total} color="bg-red-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-500" />
              <div>
                <p className="text-sm font-medium text-black">Flagged workers</p>
                <p className="text-sm text-gray-500">Cases that need your review first.</p>
              </div>
            </div>

            {flaggedLogs.length > 0 ? (
              <div className="space-y-3">
                {flaggedLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-red-100 bg-red-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-black">{log.worker_name}</p>
                        <p className="text-sm text-gray-600">{log.date}</p>
                      </div>
                      <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold uppercase text-red-700">Flagged</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700">
                        <Activity size={12} /> AI review required
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700">
                        <FileText size={12} /> {log.ai_score_impact} impact
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No active flagged logs in the latest summary.</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Payroll mockup</p>
                <h2 className="text-lg font-semibold text-black">Squad payout accounts</h2>
              </div>
              <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">{teamPayments.length} accounts</span>
            </div>
            {paymentsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="h-20 rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : teamPayments.length > 0 ? (
              <div className="space-y-3">
                {teamPayments.map((record) => (
                  <div key={record.id} className="rounded-2xl border border-gray-200 bg-[#F8FAFF] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-black">{record.worker_name}</p>
                        <p className="text-xs text-gray-500">{record.bank_name} • {record.account_type}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B3B91]">Squad</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-900">{record.account_number}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No payroll accounts available right now.</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Users size={18} className="text-[#0B3B91]" />
              <div>
                <p className="text-sm font-medium text-black">Team readiness</p>
                <p className="text-sm text-gray-500">See the health of your entire workforce.</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFF] p-4">
              <div>
                <p className="text-sm text-gray-500">Attendance today</p>
                <p className="mt-2 text-2xl font-semibold text-black">{attendanceRate}%</p>
              </div>
              <div className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#0B3B91]">{data.today_attendance_count || 0}/{total}</div>
            </div>
          </div>
        </aside>
      </section>

      <AIChatbot />
    </div>
  )
}




