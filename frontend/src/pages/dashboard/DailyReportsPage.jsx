import { useState, useMemo, useCallback } from 'react'
import { Plus } from 'lucide-react'
import {
  File01Icon,
  Edit02Icon,
  Alert02Icon,
  CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons'
import { MetricCard } from '../../components/layouts/MetricCard'
import { METRIC_GROUP } from '../../lib/layout'
import { PageHeader } from '../../components/layouts/PageHeader'
import DailyReportsTable from '../../components/dashboard/reports/DailyReportsTable'
import SubmitLogModal from '../../components/dashboard/modals/SubmitLogModal'
import ReportDetailModal from '../../components/dashboard/modals/ReportDetailModal'
import { dailyReportsMetrics, dailyReports } from '@data/daily-reports'

const METRIC_ICONS = [File01Icon, Edit02Icon, Alert02Icon, CheckmarkCircle01Icon]
const STORAGE_KEY = 'track:submitted-reports'

function getStoredReports() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function DailyReportsPage() {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [version, setVersion] = useState(0)

  const allReports = useMemo(() => {
    const stored = getStoredReports()
    return [...stored, ...dailyReports]
  }, [version])

  const metrics = useMemo(() => {
    const stored = getStoredReports()
    const submitted = stored.length + dailyReports.filter(r => r.status === 'submitted' || r.status === 'completed').length
    const draft = dailyReports.filter(r => r.status === 'draft').length
    const missing = dailyReports.filter(r => r.status === 'missing').length
    const total = submitted + draft + missing
    const consistency = total > 0 ? Math.round((submitted / total) * 100) : 0

    return [
      { label: 'Reports Submitted', value: String(submitted), iconColor: '#0B3B91', trend: { value: '+20%', isPositive: true } },
      { label: 'Draft Reports', value: String(draft), iconColor: '#6B7280', trend: { value: '+20%', isPositive: true } },
      { label: 'Missing Reports', value: String(missing), iconColor: '#F59E0B', trend: { value: '+2.0%', isPositive: false } },
      { label: 'Reporting Consistency', value: `${consistency}%`, iconColor: '#16A34A', trend: { value: '+2.0%', isPositive: true } },
    ]
  }, [version])

  const handleSubmitSuccess = useCallback((report) => {
    setVersion(v => v + 1)
    setIsSubmitModalOpen(false)
  }, [])

  const addButton = (
    <button
      type="button"
      onClick={() => setIsSubmitModalOpen(true)}
      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#0B3B91] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#082d70]"
    >
      <Plus size={16} />
      Add Report
    </button>
  )

  return (
    <div className="space-y-2">
      <PageHeader title="Daily Reports" action={addButton} />

      <div className={METRIC_GROUP}>
        <div className="metric-card-grid">
          {metrics.map((metric, i) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              icon={METRIC_ICONS[i] ?? File01Icon}
              iconColor={metric.iconColor}
            />
          ))}
        </div>
      </div>

      <DailyReportsTable
        reports={allReports}
        onViewReport={(report) => setSelectedReport(report)}
      />

      <SubmitLogModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleSubmitSuccess}
      />

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  )
}
