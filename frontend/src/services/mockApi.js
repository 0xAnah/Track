import { mockTokens } from '@data/auth'
import { hrDashboard } from '@data/dashboard-hr'
import { workers, workerCredentials } from '@data/workers'
import { myLeaveRequests, pendingLeaveRequests } from '@data/leave'
import {
  workerPaymentStatus,
  advanceHistory,
  teamPayments,
  banks,
} from '@data/payments'
import { monthlyReport } from '@data/reports'
import {
  getCurrentUser,
  getWorkerDashboardData,
  signInWorkSession,
  signOutWorkSession,
  resolveUserFromLogin,
} from './mockStore'

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

function ok(data, status = 200) {
  return { data, status, statusText: 'OK', headers: {}, config: {} }
}

export async function handleMockRequest(method, url, body) {
  await delay()
  const path = url.replace(/^\//, '')
  const user = getCurrentUser()

  if (method === 'POST' && path === 'auth/login/') {
    const loggedIn = resolveUserFromLogin(body?.username || body?.email || '')
    return ok({ access: mockTokens.access, refresh: mockTokens.refresh, user: loggedIn })
  }

  if (method === 'POST' && path.startsWith('auth/')) {
    return ok({ detail: 'ok' })
  }

  if (method === 'GET' && path === 'users/me/') {
    return ok(user)
  }

  if (method === 'GET' && path === 'users/dashboard/') {
    return ok(user.role === 'hr' ? hrDashboard : getWorkerDashboardData())
  }

  if (method === 'POST' && path === 'attendance/sign-in/') {
    signInWorkSession()
    return ok({ detail: 'signed in' })
  }

  if (method === 'POST' && path === 'attendance/sign-out/') {
    signOutWorkSession()
    return ok({ detail: 'signed out' })
  }

  if (method === 'GET' && path === 'users/workers/') {
    return ok(workers)
  }

  if (method === 'GET' && path === 'users/workers/invite-credentials/') {
    return ok(workerCredentials)
  }

  if (method === 'GET' && path === 'users/workers/invite-credentials/export/') {
    return ok(new Blob(['mock,csv'], { type: 'text/csv' }))
  }

  if (method === 'GET' && path === 'users/banks/') {
    return ok(banks)
  }

  if (method === 'GET' && path === 'leave/my-requests/') {
    return ok(myLeaveRequests)
  }

  if (method === 'GET' && path === 'leave/pending/') {
    return ok(pendingLeaveRequests)
  }

  if (method === 'POST' && path === 'leave/request/') {
    return ok({ id: Date.now(), ...body, status: 'pending' })
  }

  if (method === 'GET' && path === 'payments/my-status/') {
    return ok(workerPaymentStatus)
  }

  if (method === 'GET' && path === 'payments/advance/history/') {
    return ok(advanceHistory)
  }

  if (method === 'GET' && path === 'payments/team/') {
    return ok(teamPayments)
  }

  if (method === 'POST' && path.startsWith('payments/')) {
    return ok({ detail: 'ok' })
  }

  if (method === 'GET' && path.startsWith('reports/monthly')) {
    return ok(monthlyReport)
  }

  if (method === 'POST' && path === 'reports/generate/') {
    return ok(monthlyReport)
  }

  if (method === 'POST' && path === 'logs/submit/') {
    const dash = getWorkerDashboardData()
    dash.today_log_submitted = true
    return ok({ detail: 'submitted' })
  }

  if (method === 'POST' && path.startsWith('users/workers/')) {
    return ok({ detail: 'invited' })
  }

  console.warn(`[mockApi] Unhandled ${method} ${path}`)
  return ok({ detail: 'mock ok' })
}
