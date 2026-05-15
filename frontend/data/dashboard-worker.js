const today = new Date()
const signIn = new Date(today)
signIn.setHours(8, 2, 0, 0)

export const workerDashboard = {
  today_session: {
    status: 'signed_in',
    sign_in_time: signIn.toISOString(),
    sign_out_time: null,
  },
  attendance_rate: 92,
  today_log_submitted: false,
  current_activity_score: 78,
  monthly_hours_total: '167 Hours 45 Minutes',
  monthly_hours_trend: { value: '2.0%', isPositive: true },
  monthly_hours: [
    { day: 'May 1', hours: 6.5 },
    { day: 'May 2', hours: 7.0 },
    { day: 'May 3', hours: 6.0 },
    { day: 'May 4', hours: 7.5 },
    { day: 'May 5', hours: 8.0 },
    { day: 'May 6', hours: 0 },
    { day: 'May 7', hours: 7.25 },
    { day: 'May 8', hours: 8.0 },
    { day: 'May 9', hours: 7.75 },
    { day: 'May 10', hours: 8.05, tooltip: 'Friday 8 hours 3 minutes' },
    { day: 'May 11', hours: 7.5 },
    { day: 'May 12', hours: 8.0 },
  ],
  performance: {
    score: 85,
    trend: { value: '2.0%', isPositive: true },
    segments: [
      { color: '#0B3B91', flex: 5 },
      { color: '#C026D3', flex: 3 },
      { color: '#22C55E', flex: 2 },
    ],
    metrics: [
      { label: 'Attendance Consistency', value: '92%', color: '#0B3B91', trend: { value: '2.0% Vs last month', isPositive: true } },
      { label: 'Report Submission Rate', value: '81%', color: '#C026D3', trend: { value: '2.0% Vs last month', isPositive: true } },
      { label: 'Average Work Duration', value: '8h 32m', color: '#22C55E', trend: { value: '2.0% Vs last month', isPositive: true } },
    ],
  },
  recent_attendance_sessions: [
    { id: 1, date: '2026-05-10', sign_in: '08:02 AM', sign_out: '05:02 PM', duration: '09h 00m', status: 'active' },
    { id: 2, date: '2026-05-09', sign_in: '08:10 AM', sign_out: '05:05 PM', duration: '08h 55m', status: 'completed' },
    { id: 3, date: '2026-05-08', sign_in: '08:45 AM', sign_out: '05:30 PM', duration: '08h 45m', status: 'late' },
    { id: 4, date: '2026-05-07', sign_in: '08:00 AM', sign_out: '05:00 PM', duration: '09h 00m', status: 'completed' },
    { id: 5, date: '2026-05-06', sign_in: '—', sign_out: '—', duration: '—', status: 'absent' },
    { id: 6, date: '2026-05-05', sign_in: '08:05 AM', sign_out: '05:10 PM', duration: '09h 05m', status: 'completed' },
    { id: 7, date: '2026-05-04', sign_in: '08:10 AM', sign_out: '05:05 PM', duration: '08h 55m', status: 'completed' },
  ],
}
