import { Routes, Route } from 'react-router-dom'

/* AUTH */
import LandingSignup from './pages/auth/LandingSignup'
import Login from './pages/auth/Login'
import VerifyEmail from './pages/auth/VerifyEmail'
import EmailVerified from './pages/auth/EmailVerified'
import SecureAccount from './pages/auth/SecureAccount'
import ProtectedRoute from './pages/auth/ProtectedRoute'

/* ONBOARDING */
import WorkspaceSetup from './pages/onboarding/WorkspaceSetup'
import WorkforceImport from './pages/onboarding/WorkforceImport'
import ManualWorkforce from './pages/onboarding/ManualWorkforce'
import TrackingConfiguration from './pages/onboarding/TrackingConfiguration'
import WorkspaceSuccess from './pages/onboarding/WorkspaceSuccess'

/* DASHBOARD */
import DashboardPage from './pages/dashboard/DashboardPage'
import WorkSessionsPage from './pages/work-sessions/WorkSessionsPage'
import WorkersPage from './pages/dashboard/WorkersPage'
import WorkerCredentialsPage from './pages/dashboard/WorkerCredentialsPage'
import LeavePage from './pages/dashboard/LeavePage'
import LeaveRequestsPage from './pages/dashboard/LeaveRequestsPage'
import PaymentsPage from './pages/dashboard/PaymentsPage'
import ReportsPage from './pages/dashboard/ReportsPage'
import DailyReportsPage from './pages/dashboard/DailyReportsPage'
import PerformancePage from './pages/dashboard/PerformancePage'
import NotificationsPage from './pages/dashboard/NotificationsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import HelpPage from './pages/dashboard/HelpPage'

import DashboardLayout from './components/layouts/DashboardLayout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingSignup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/email-verified" element={<EmailVerified />} />
      <Route path="/secure-account" element={<SecureAccount />} />

      <Route path="/workspace-setup" element={<WorkspaceSetup />} />
      <Route path="/workforce-import" element={<WorkforceImport />} />
      <Route path="/manual-workforce" element={<ManualWorkforce />} />
      <Route path="/tracking-configuration" element={<TrackingConfiguration />} />
      <Route path="/workspace-success" element={<WorkspaceSuccess />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/work-sessions" element={<WorkSessionsPage />} />
        <Route path="/daily-reports" element={<DailyReportsPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/workers" element={<WorkersPage />} />
        <Route path="/worker-credentials" element={<WorkerCredentialsPage />} />
        <Route path="/leave-requests" element={<LeaveRequestsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>
    </Routes>
  )
}

export default App
