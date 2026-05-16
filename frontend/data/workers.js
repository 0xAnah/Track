export const workers = [
  {
    id: 1, name: 'John Williams', email: 'john.williams@track.app', department: 'Engineering', score: 78, tier: 'solid', status: 'active',
    employee_id: 'EMP-001', phone: '+234 802 345 6789', date_joined: '2025-09-01',
    bank_name: 'GTBank', account_number: '0581000001', account_type: 'Savings',
    salary: 350000, bonus: 17500,
    attendance_rate: 88, monthly_hours: '152h 30m',
    recent_sessions: [
      { date: '2026-05-15', sign_in: '08:02 AM', sign_out: '05:02 PM', status: 'active' },
      { date: '2026-05-14', sign_in: '08:10 AM', sign_out: '05:05 PM', status: 'completed' },
      { date: '2026-05-13', sign_in: '08:45 AM', sign_out: '05:30 PM', status: 'late' },
      { date: '2026-05-12', sign_in: '08:00 AM', sign_out: '05:00 PM', status: 'completed' },
    ],
    leave_balance: { annual: 12, sick: 5, personal: 3 },
    recent_leaves: [
      { type: 'Annual', start: '2026-04-10', end: '2026-04-12', status: 'approved' },
    ],
  },
  {
    id: 2, name: 'Ada Okonkwo', email: 'ada@track.app', department: 'Operations', score: 91, tier: 'elite', status: 'active',
    employee_id: 'EMP-002', phone: '+234 803 456 7890', date_joined: '2025-06-15',
    bank_name: 'GTBank', account_number: '0581000002', account_type: 'Savings',
    salary: 420000, bonus: 42000,
    attendance_rate: 97, monthly_hours: '175h 15m',
    recent_sessions: [
      { date: '2026-05-15', sign_in: '07:55 AM', sign_out: '05:00 PM', status: 'active' },
      { date: '2026-05-14', sign_in: '08:00 AM', sign_out: '04:55 PM', status: 'completed' },
      { date: '2026-05-13', sign_in: '07:50 AM', sign_out: '05:05 PM', status: 'completed' },
      { date: '2026-05-12', sign_in: '08:05 AM', sign_out: '05:00 PM', status: 'completed' },
    ],
    leave_balance: { annual: 15, sick: 8, personal: 5 },
    recent_leaves: [
      { type: 'Personal', start: '2026-03-15', end: '2026-03-15', status: 'approved' },
    ],
  },
  {
    id: 3, name: 'Chidi Nwosu', email: 'chidi@track.app', department: 'Sales', score: 54, tier: 'flagged', status: 'active',
    employee_id: 'EMP-003', phone: '+234 804 567 8901', date_joined: '2025-11-01',
    bank_name: 'GTBank', account_number: '0581000003', account_type: 'Current',
    salary: 280000, bonus: 0,
    attendance_rate: 65, monthly_hours: '128h 00m',
    recent_sessions: [
      { date: '2026-05-15', sign_in: '09:30 AM', sign_out: '04:30 PM', status: 'late' },
      { date: '2026-05-14', sign_in: '—', sign_out: '—', status: 'absent' },
      { date: '2026-05-13', sign_in: '10:15 AM', sign_out: '05:00 PM', status: 'late' },
      { date: '2026-05-12', sign_in: '08:30 AM', sign_out: '04:45 PM', status: 'completed' },
    ],
    leave_balance: { annual: 8, sick: 3, personal: 1 },
    recent_leaves: [
      { type: 'Sick', start: '2026-04-20', end: '2026-04-21', status: 'approved' },
      { type: 'Annual', start: '2026-05-05', end: '2026-05-05', status: 'pending' },
    ],
  },
  {
    id: 4, name: 'Fatima Bello', email: 'fatima@track.app', department: 'Support', score: 72, tier: 'standard', status: 'on_leave',
    employee_id: 'EMP-004', phone: '+234 805 678 9012', date_joined: '2025-08-20',
    bank_name: 'GTBank', account_number: '0581000004', account_type: 'Savings',
    salary: 310000, bonus: 0,
    attendance_rate: 81, monthly_hours: '140h 45m',
    recent_sessions: [
      { date: '2026-05-15', sign_in: '—', sign_out: '—', status: 'absent' },
      { date: '2026-05-14', sign_in: '—', sign_out: '—', status: 'absent' },
      { date: '2026-05-13', sign_in: '08:10 AM', sign_out: '05:00 PM', status: 'completed' },
      { date: '2026-05-12', sign_in: '08:05 AM', sign_out: '04:55 PM', status: 'completed' },
    ],
    leave_balance: { annual: 10, sick: 6, personal: 2 },
    recent_leaves: [
      { type: 'Annual', start: '2026-05-18', end: '2026-05-19', status: 'pending' },
      { type: 'Personal', start: '2026-04-05', end: '2026-04-05', status: 'approved' },
    ],
  },
]

export const workerCredentials = [
  { id: 1, worker_name: 'John Williams', username: 'john', temporary_password: 'Track#2026', invited_at: '2026-05-01' },
  { id: 2, worker_name: 'Ada Okonkwo', username: 'ada', temporary_password: 'Track#2026', invited_at: '2026-05-02' },
]
