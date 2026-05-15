import { Routes, Route } from 'react-router-dom'

/* ================================================= */
/* AUTH PAGES */
/* ================================================= */

import LandingSignup from './pages/auth/LandingSignup'
import Login from './pages/auth/Login'
import VerifyEmail from './pages/auth/VerifyEmail'
import EmailVerified from './pages/auth/EmailVerified'
import SecureAccount from './pages/auth/SecureAccount'
import ProtectedRoute from './pages/auth/ProtectedRoute'

/* ================================================= */
/* ONBOARDING PAGES */
/* ================================================= */

import WorkspaceSetup from './pages/onboarding/WorkspaceSetup'
import WorkforceImport from './pages/onboarding/WorkforceImport'
import ManualWorkforce from './pages/onboarding/ManualWorkforce'
import TrackingConfiguration from './pages/onboarding/TrackingConfiguration'
import WorkspaceSuccess from './pages/onboarding/WorkspaceSuccess'

/* ================================================= */
/* DASHBOARD PAGES */
/* ================================================= */

import DashboardPage from './pages/dashboard/DashboardPage'
import WorkSessionsPage from './pages/work-sessions/WorkSessionsPage'
import WorkersPage from './pages/dashboard/WorkersPage'
import WorkerCredentialsPage from './pages/dashboard/WorkerCredentialsPage'
import LeavePage from './pages/dashboard/LeavePage'
import LeaveRequestsPage from './pages/dashboard/LeaveRequestsPage'
import PaymentsPage from './pages/dashboard/PaymentsPage'
import ReportsPage from './pages/dashboard/ReportsPage'

/* ================================================= */
/* LAYOUT */
/* ================================================= */

import DashboardLayout from './components/layout/DashboardLayout'

function App() {
  return (

    <Routes>

      {/* ================================================= */}
      {/* AUTH FLOW */}
      {/* ================================================= */}

      {/* LANDING PAGE */}
      <Route
        path="/"
        element={<LandingSignup />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      {/* VERIFY EMAIL */}
      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />

      {/* EMAIL VERIFIED */}
      <Route
        path="/email-verified"
        element={<EmailVerified />}
      />

      {/* SECURE ACCOUNT */}
      <Route
        path="/secure-account"
        element={<SecureAccount />}
      />

      {/* ================================================= */}
      {/* ONBOARDING FLOW */}
      {/* ================================================= */}

      {/* STEP 1 — WORKSPACE SETUP */}
      <Route
        path="/workspace-setup"
        element={<WorkspaceSetup />}
      />

      {/* STEP 2 — IMPORT WORKFORCE */}
      <Route
        path="/workforce-import"
        element={<WorkforceImport />}
      />

      {/* STEP 2B — MANUAL WORKFORCE */}
      <Route
        path="/manual-workforce"
        element={<ManualWorkforce />}
      />

      {/* STEP 3 — TRACKING CONFIG */}
      <Route
        path="/tracking-configuration"
        element={<TrackingConfiguration />}
      />

      {/* STEP 4 — SUCCESS */}
      <Route
        path="/workspace-success"
        element={<WorkspaceSuccess />}
      />

      {/* ================================================= */}
      {/* DASHBOARD ROUTES */}
      {/* ================================================= */}

      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        {/* WORK SESSIONS (Worker) */}
        <Route
          path="/work-sessions"
          element={<WorkSessionsPage />}
        />

        {/* LEAVE (Worker) */}
        <Route
          path="/leave"
          element={<LeavePage />}
        />

        {/* WORKERS (HR) */}
        <Route
          path="/workers"
          element={<WorkersPage />}
        />

        {/* WORKER CREDENTIALS (HR) */}
        <Route
          path="/worker-credentials"
          element={<WorkerCredentialsPage />}
        />

        {/* LEAVE REQUESTS (HR) */}
        <Route
          path="/leave-requests"
          element={<LeaveRequestsPage />}
        />

        {/* PAYMENTS (Shared view) */}
        <Route
          path="/payments"
          element={<PaymentsPage />}
        />

        {/* REPORTS (HR) */}
        <Route
          path="/reports"
          element={<ReportsPage />}
        />

      </Route>

    </Routes>
  )
}

export default App
