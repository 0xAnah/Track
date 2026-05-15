import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar' // keep your real sidebar

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR (ALWAYS STAYS) */}
      <Sidebar />

      {/* PAGE CONTENT */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

    </div>
  )
}