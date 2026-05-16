import { X, Banknote, Mail, Phone, Building, Calendar, Award, Clock, CheckCircle, AlertCircle, LogOut } from 'lucide-react'

const tierColors = {
  elite: 'bg-purple-100 text-purple-700',
  solid: 'bg-blue-100 text-blue-700',
  standard: 'bg-gray-100 text-gray-700',
  flagged: 'bg-red-100 text-red-700',
}

const sessionStatusBadge = {
  active: { icon: Clock, class: 'bg-blue-100 text-blue-700' },
  completed: { icon: CheckCircle, class: 'bg-green-100 text-green-700' },
  late: { icon: AlertCircle, class: 'bg-yellow-100 text-yellow-700' },
  absent: { icon: LogOut, class: 'bg-red-100 text-red-700' },
}

export default function WorkerDetailModal({ worker, onClose }) {
  if (!worker) return null

  const initials = worker.name.split(' ').map(n => n[0]).join('')

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-8 sm:pt-16">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <div className="rounded-t-2xl bg-gradient-to-r from-[#0B3B91] to-[#1a56db] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{worker.name}</h2>
              <p className="mt-0.5 text-sm text-white/80">{worker.department}</p>
              <p className="text-sm text-white/60">{worker.employee_id}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{worker.score}</div>
              <div className="text-xs text-white/70">Score</div>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Personal Info</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={15} className="text-gray-400" />
                    <span className="text-gray-900">{worker.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={15} className="text-gray-400" />
                    <span className="text-gray-900">{worker.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Building size={15} className="text-gray-400" />
                    <span className="text-gray-900">{worker.department}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={15} className="text-gray-400" />
                    <span className="text-gray-900">Joined {worker.date_joined}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Bank Details</h3>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-2">
                    <Banknote size={18} className="text-green-600" />
                    <span className="font-semibold text-gray-900">{worker.bank_name}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-gray-900">{worker.account_number}</p>
                  <p className="text-xs text-gray-500">{worker.account_type}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Salary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Base Salary</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">₦{worker.salary.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Bonus</p>
                    <p className="mt-1 text-lg font-bold text-green-600">₦{worker.bonus.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Rating & Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Award size={18} className="text-[#0B3B91]" />
                    <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${tierColors[worker.tier] || 'bg-gray-100 text-gray-700'}`}>
                      {worker.tier}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Performance Score</span>
                      <span className="font-semibold text-gray-900">{worker.score}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${worker.score >= 80 ? 'bg-green-500' : worker.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${worker.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                      worker.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {worker.status === 'active' ? 'Active' : 'On Leave'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Attendance</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Attendance Rate</p>
                    <p className="mt-1 text-lg font-bold text-[#0B3B91]">{worker.attendance_rate}%</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Monthly Hours</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">{worker.monthly_hours}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Leave Balance</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-gray-100 bg-blue-50 p-2.5 text-center">
                    <p className="text-xs text-blue-600">Annual</p>
                    <p className="text-lg font-bold text-blue-700">{worker.leave_balance.annual}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-green-50 p-2.5 text-center">
                    <p className="text-xs text-green-600">Sick</p>
                    <p className="text-lg font-bold text-green-700">{worker.leave_balance.sick}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-purple-50 p-2.5 text-center">
                    <p className="text-xs text-purple-600">Personal</p>
                    <p className="text-lg font-bold text-purple-700">{worker.leave_balance.personal}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Recent Attendance</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Sign In</th>
                    <th className="px-4 py-3 font-medium">Sign Out</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {worker.recent_sessions.map((s, i) => {
                    const badge = sessionStatusBadge[s.status] || sessionStatusBadge.completed
                    const Icon = badge.icon
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{s.date}</td>
                        <td className="px-4 py-3 text-gray-600">{s.sign_in}</td>
                        <td className="px-4 py-3 text-gray-600">{s.sign_out}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badge.class}`}>
                            <Icon size={12} />
                            {s.status === 'completed' ? 'Completed' : s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {worker.recent_leaves.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Leave History</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Start</th>
                      <th className="px-4 py-3 font-medium">End</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {worker.recent_leaves.map((l, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{l.type}</td>
                        <td className="px-4 py-3 text-gray-600">{l.start}</td>
                        <td className="px-4 py-3 text-gray-600">{l.end}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            l.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
