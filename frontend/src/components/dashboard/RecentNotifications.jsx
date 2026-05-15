const notifications = [
  {
    title: 'Work session started',
    time: '08:02 AM',
    color: 'bg-[#0B3B91]',
  },
  {
    title: 'Daily report reminder',
    time: 'Yesterday',
    color: 'bg-[#F59E0B]',
  },
  {
    title: 'HR announcement',
    time: '2d ago',
    color: 'bg-[#22C55E]',
  },
];

const RecentNotifications = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-full">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-black">Recent Notifications</h2>
        <button className="text-xs font-semibold text-[#0B3B91] transition hover:text-[#082d70]">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between gap-3 rounded-[18px] border border-[#EEF2FF] bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-3">
              <div className={`mt-1 h-3 w-3 rounded-full ${item.color}`} />
              <div>
                <p className="text-sm font-medium text-black">{item.title}</p>
                <p className="mt-1 text-xs text-gray-500">{item.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentNotifications