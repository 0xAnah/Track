import { mockWorkerUser, mockHrUser } from '@data/auth'
import { workerDashboard } from '@data/dashboard-worker'

const STORAGE_USER_KEY = 'track_mock_user'

function cloneWorkerDashboard() {
  return JSON.parse(JSON.stringify(workerDashboard))
}

let workerDashboardState = cloneWorkerDashboard()

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_USER_KEY)
}

export function getCurrentUser() {
  return getStoredUser() || mockWorkerUser
}

export function resolveUserFromLogin(identifier = '') {
  const value = identifier.toLowerCase()
  const user = value.includes('hr') || value.includes('admin') ? { ...mockHrUser } : { ...mockWorkerUser }
  setStoredUser(user)
  return user
}

export function getWorkerDashboardData() {
  return JSON.parse(JSON.stringify(workerDashboardState))
}

export function signInWorkSession() {
  workerDashboardState.today_session = {
    status: 'signed_in',
    sign_in_time: new Date().toISOString(),
    sign_out_time: null,
  }
  return getWorkerDashboardData()
}

export function signOutWorkSession() {
  workerDashboardState.today_session = {
    ...workerDashboardState.today_session,
    status: 'signed_out',
    sign_out_time: new Date().toISOString(),
  }
  return getWorkerDashboardData()
}

export function resetMockState() {
  workerDashboardState = cloneWorkerDashboard()
}
