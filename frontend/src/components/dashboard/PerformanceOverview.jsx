const PerformanceOverview = () => {
  const metrics = [
    { label: 'Attendance Consistency', value: 92, color: 'bg-[#0B3B91]' },
    { label: 'Report Submission Rate', value: 81, color: 'bg-[#9333EA]' },
    { label: 'Average Work Duration', value: 88, color: 'bg-[#22C55E]' },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Performance Overview</p>
          <h2 className="mt-3 text-3xl font-semibold text-black">85%</h2>
        </div>
        <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#166534]">
          +2.0% Vs last month
        </span>
      </div>

      <p className="mt-5 text-sm text-gray-500">Quarterly performance summary</p>

      <div className="mt-6 space-y-4">
        {metrics.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span>{item.label}</span>
              <span className="font-semibold">{item.value}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#E7EDF8]">
              <div
                className={`${item.color} h-full rounded-full`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceOverview;