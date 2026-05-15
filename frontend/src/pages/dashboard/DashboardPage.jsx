import { useAuth } from '../../context/AuthContext'
import HRDashboard from './HRDashboard'
import WorkerDashboard from './WorkerDashboard'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  if (user.role === 'hr') {
    return <HRDashboard />
  }

  return <WorkerDashboard />
}