import { useState } from 'react'
import { X, FileText, Clock, User, CalendarDays, CheckCircle, AlertCircle, Edit } from 'lucide-react'

const STATUS_STYLES = {
  submitted: { icon: Clock, class: 'bg-blue-100 text-blue-700' },
  completed: { icon: CheckCircle, class: 'bg-green-100 text-green-700' },
  draft: { icon: Edit, class: 'bg-gray-100 text-gray-600' },
  missing: { icon: AlertCircle, class: 'bg-amber-100 text-amber-700' },
}

const STATUS_LABELS = {
  submitted: 'Submitted', completed: 'Completed', draft: 'Draft', missing: 'Missing',
}

export default function ReportDetailModal({ report, onClose }) {
  if (!report) return null

  const StatusBadge = STATUS_STYLES[report.status] || STATUS_STYLES.completed
  const StatusIcon = StatusBadge.icon

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-8 sm:pt-16">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <div className="rounded-t-2xl border-b border-gray-100 bg-gradient-to-r from-[#0B3B91] to-[#1a56db] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{report.title}</h2>
              <p className="mt-0.5 text-sm text-white/70">
                {report.department} • {report.date}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${StatusBadge.class}`}>
              <StatusIcon size={13} />
              {STATUS_LABELS[report.status] || report.status}
            </span>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <User size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Submitted By</p>
                <p className="text-sm font-medium text-gray-900">{report.submitted_by || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <CalendarDays size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Submission Time</p>
                <p className="text-sm font-medium text-gray-900">{report.submissionTime || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <Clock size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">{report.lastUpdated || '—'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Description</h3>
            <p className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {report.description}
            </p>
          </div>

          {report.tasks && report.tasks.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Tasks ({report.tasks.length})
              </h3>
              <div className="space-y-3">
                {report.tasks.map((task, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B3B91]/10 text-xs font-bold text-[#0B3B91]">
                          {i + 1}
                        </span>
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      </div>
                      <span className="whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                        {task.start_time} – {task.end_time}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{task.description}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                      {task.initiated_by && (
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-gray-700">From:</span> {task.initiated_by}
                        </span>
                      )}
                      {task.handed_to && (
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium text-gray-700">To:</span> {task.handed_to}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.status === 'missing' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700">
              No tasks were recorded for this report.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
