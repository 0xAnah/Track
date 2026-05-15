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
import { dailyReportsMetrics, dailyReports } from '@data/daily-reports'

const METRIC_ICONS = [File01Icon, Edit02Icon, Alert02Icon, CheckmarkCircle01Icon]

export default function DailyReportsPage() {
  const addButton = (
    <button
      type="button"
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
          {dailyReportsMetrics.map((metric, i) => (
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

      <DailyReportsTable reports={dailyReports} />
    </div>
  )
}
