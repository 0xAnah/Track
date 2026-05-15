import { useState } from 'react'
import api from '../../services/api'

const EMPTY_TASK = { title: '', description: '', initiated_by: '', handed_to: '', start_time: '', end_time: '' }

export default function SubmitLogModal({ isOpen, onClose, onSuccess }) {
  const [tasks, setTasks] = useState([{ ...EMPTY_TASK }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const today = new Date().toISOString().split('T')[0]
  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const handleTaskChange = (index, field, value) => {
    setTasks(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addTask = () => {
    setTasks(prev => [...prev, { ...EMPTY_TASK }])
  }

  const removeTask = (index) => {
    setTasks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/logs/submit/', { date: today, tasks })
      setTasks([{ ...EMPTY_TASK }])
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.tasks?.[0]?.end_time?.[0] || 'Failed to submit log. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Submit Daily Log</h2>
            <p className="text-sm text-gray-500 mt-1">{todayDisplay}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        {error && (
          <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {tasks.map((task, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Task {index + 1} of {tasks.length}
                </span>
                {tasks.length > 1 && (
                  <button type="button" onClick={() => removeTask(index)} className="text-red-500 text-xs font-medium hover:underline">
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={task.title}
                  onChange={e => handleTaskChange(index, 'title', e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#0B3B91] transition"
                  placeholder="e.g. Built Login Page"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={task.description}
                  onChange={e => handleTaskChange(index, 'description', e.target.value)}
                  rows="3"
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#0B3B91] transition"
                  placeholder="Detailed description of the work done..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Initiated By</label>
                  <input
                    type="text"
                    value={task.initiated_by}
                    onChange={e => handleTaskChange(index, 'initiated_by', e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#0B3B91] transition"
                    placeholder="Who assigned this?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Handed To</label>
                  <input
                    type="text"
                    value={task.handed_to}
                    onChange={e => handleTaskChange(index, 'handed_to', e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#0B3B91] transition"
                    placeholder="Who received the output?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="time"
                    value={task.start_time}
                    onChange={e => handleTaskChange(index, 'start_time', e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#0B3B91] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="time"
                    value={task.end_time}
                    onChange={e => handleTaskChange(index, 'end_time', e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#0B3B91] transition"
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addTask} className="text-blue-600 text-sm font-medium hover:underline">
            + Add Another Task
          </button>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#0B3B91] text-white rounded-xl hover:bg-[#082d70] font-medium disabled:opacity-50 transition shadow-sm"
            >
              {loading ? 'Submitting...' : 'Submit Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
