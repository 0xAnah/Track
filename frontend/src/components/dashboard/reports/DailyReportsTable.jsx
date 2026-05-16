import { useState } from 'react'
import { Search, SlidersHorizontal, Calendar, ChevronDown, Upload, Eye, Download, Trash2, Pencil } from 'lucide-react'
import ActionMenu from '../../ui/ActionMenu'

const STATUS_STYLES = {
  submitted: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  draft:     'bg-gray-100 text-gray-600',
  missing:   'bg-amber-100 text-amber-700',
}

const STATUS_LABELS = {
  submitted: 'Submitted',
  completed: 'Completed',
  draft:     'Draft',
  missing:   'Missing',
}

function formatRowDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getActions(status, onView) {
  if (status === 'draft') {
    return [
      { label: 'Continue Editing', icon: Pencil, onClick: () => {} },
      { label: 'Delete', icon: Trash2, danger: true, onClick: () => {} },
    ]
  }
  if (status === 'missing') {
    return []
  }
  return [
    { label: 'View Report', icon: Eye, onClick: onView },
    { label: 'Download Report', icon: Download, onClick: () => {} },
    { label: 'Delete', icon: Trash2, danger: true, onClick: () => {} },
  ]
}

export default function DailyReportsTable({ reports = [], monthLabel = 'May 2026', onViewReport }) {
  const [search, setSearch] = useState('')

  const filtered = reports.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.title.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      (STATUS_LABELS[r.status] || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0B3B91]"
            />
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <SlidersHorizontal size={14} className="text-gray-500" />
            Filter
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Calendar size={14} className="text-gray-500" />
            {monthLabel}
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Export PDF
            <Upload size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Task Title</th>
              <th className="pb-3 pr-4 font-medium">Department</th>
              <th className="pb-3 pr-4 font-medium">Submission Time</th>
              <th className="pb-3 pr-4 font-medium">Last Updated</th>
              <th className="pb-3 pr-4 font-medium">Session Status</th>
              <th className="pb-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-500">
                  No reports found.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const status = row.status || 'completed'
                const actions = getActions(status, () => onViewReport?.(row))
                return (
                  <tr
                    key={row.id}
                    onClick={() => onViewReport?.(row)}
                    className="cursor-pointer border-b border-gray-50 last:border-0 transition hover:bg-gray-50/60"
                  >
                    <td className="py-3.5 pr-4 font-medium text-gray-900 whitespace-nowrap">{formatRowDate(row.date)}</td>
                    <td className="py-3.5 pr-4 text-gray-700">{row.title}</td>
                    <td className="py-3.5 pr-4 text-gray-600">{row.department}</td>
                    <td className="py-3.5 pr-4 text-gray-600">{row.submissionTime ?? '—'}</td>
                    <td className="py-3.5 pr-4 text-gray-600">{row.lastUpdated ?? '—'}</td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[status] || STATUS_STYLES.completed
                        }`}
                      >
                        {STATUS_LABELS[status] || status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {actions.length > 0 && (
                        <span onClick={e => e.stopPropagation()}>
                          <ActionMenu items={actions} />
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
