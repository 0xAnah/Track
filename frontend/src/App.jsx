import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

/*Hero Section*/
import Home from './pages/home/Home'


/* AUTH — eagerly loaded (entry points) */
// import LandingSignup from './pages/auth/LandingSignup'
import Login from './pages/auth/Login'
import ProtectedRoute from './pages/auth/ProtectedRoute'


/*  auth pages */
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))
const EmailVerified = lazy(() => import('./pages/auth/EmailVerified'))
const SecureAccount = lazy(() => import('./pages/auth/SecureAccount'))

/* ONBOARDING — lazy */
const WorkspaceSetup = lazy(() => import('./pages/onboarding/WorkspaceSetup'))
const WorkforceImport = lazy(() => import('./pages/onboarding/WorkforceImport'))
const ManualWorkforce = lazy(() => import('./pages/onboarding/ManualWorkforce'))
const TrackingConfiguration = lazy(() => import('./pages/onboarding/TrackingConfiguration'))
const WorkspaceSuccess = lazy(() => import('./pages/onboarding/WorkspaceSuccess'))

/* DASHBOARD — lazy */
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const WorkSessionsPage = lazy(() => import('./pages/work-sessions/WorkSessionsPage'))
const DailyReportsPage = lazy(() => import('./pages/dashboard/DailyReportsPage'))
const PerformancePage = lazy(() => import('./pages/dashboard/PerformancePage'))
const NotificationsPage = lazy(() => import('./pages/dashboard/NotificationsPage'))
const PaymentsPage = lazy(() => import('./pages/dashboard/PaymentsPage'))
const LeavePage = lazy(() => import('./pages/dashboard/LeavePage'))
const WorkersPage = lazy(() => import('./pages/dashboard/WorkersPage'))
const WorkerCredentialsPage = lazy(() => import('./pages/dashboard/WorkerCredentialsPage'))
const LeaveRequestsPage = lazy(() => import('./pages/dashboard/LeaveRequestsPage'))
const ReportsPage = lazy(() => import('./pages/dashboard/ReportsPage'))
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'))
const HelpPage = lazy(() => import('./pages/dashboard/HelpPage'))
const HRDashboard = lazy(() => import('./pages/dashboard/HRDashboard'))
const HRPayrollPage = lazy(() => import('./pages/dashboard/HRPayrollPage'))

import DashboardLayout from './components/layouts/DashboardLayout'

function PageLoader() {
  return (
    <div className="flex h-40 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#0B3B91]" />
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
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
          <Route path="/HRDashboard" element={<HRDashboard />} />
          <Route path="/hr-payments" element={<HRPayrollPage />} />
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
    </Suspense>
  )
}

export default App
