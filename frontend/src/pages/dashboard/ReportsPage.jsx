import { useState, useEffect } from 'react'
import { FileText, RefreshCw, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../services/api'

export default function ReportsPage() {
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`/reports/monthly/?month=${currentMonth}&year=${currentYear}`)
      setReport(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setReport(null)
      } else {
        console.error('Failed to fetch report:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [currentMonth, currentYear])

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await api.post('/reports/generate/', { month: currentMonth, year: currentYear })
      alert('Report generation triggered! Please refresh in a few moments.')
    } catch (err) {
      alert('Failed to generate report.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Workforce Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Review end-of-month performance and flagged activities</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-gray-200 rounded-md shadow-sm">
            <button onClick={handlePrevMonth} className="p-2 text-gray-500 hover:bg-gray-50 transition">
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 text-sm font-medium w-32 text-center">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <button onClick={handleNextMonth} disabled={currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear()} className="p-2 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50">
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-[#0B3B91] hover:bg-[#082d70] text-white px-5 py-2.5 rounded-md font-medium transition shadow-md disabled:opacity-50"
          >
            <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
            Generate Report
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading report data...</div>
      ) : !report ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            There is no generated report for {monthNames[currentMonth - 1]} {currentYear}. You can manually trigger generation using the button above.
          </p>
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Average Score</h3>
              <p className="text-3xl font-bold text-[#0B3B91]">{report.average_score}%</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Reports</h3>
              <p className="text-3xl font-bold text-gray-900">{report.total_reports_submitted}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Leaves Approved</h3>
              <p className="text-3xl font-bold text-gray-900">{report.total_leaves_approved}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Salary Disbursed</h3>
              <p className="text-3xl font-bold text-green-600">₦{parseFloat(report.total_salary_disbursed || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* FLAGGED WORKERS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Flagged Workers
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Worker</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Reason</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!report.flagged_workers || report.flagged_workers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No workers were flagged this month. Great job team!
                      </td>
                    </tr>
                  ) : (
                    report.flagged_workers.map(fw => (
                      <tr key={fw.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{fw.worker_name}</td>
                        <td className="px-6 py-4 text-red-600 font-medium">{fw.score}%</td>
                        <td className="px-6 py-4 text-gray-600">{fw.reason}</td>
                        <td className="px-6 py-4">
                          {fw.review_completed ? (
                            <span className="flex items-center gap-1 text-green-700 text-xs font-medium bg-green-100 px-2.5 py-1 rounded-full w-max">
                              <CheckCircle size={14} /> Reviewed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-700 text-xs font-medium bg-red-100 px-2.5 py-1 rounded-full w-max">
                              Pending Review
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
