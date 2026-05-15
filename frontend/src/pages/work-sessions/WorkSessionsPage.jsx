import { useEffect, useState } from "react";
import {
  Clock3,
  Pencil,
  CalendarDays,
  LogOut,
  Menu,
} from "lucide-react";

export default function WorkSessionsPage() {
  /* ... (Keep all existing state and logic exactly as they are) ... */
  const [showModal, setShowModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(13620);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTimelineDate, setCurrentTimelineDate] = useState("12 May 2026");

  useEffect(() => {
    if (!isSessionActive) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const formatTime = (s) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${hrs}h ${mins}m ${sec}s`;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleEndSession = () => {
    if (!reportSubmitted) { setShowModal(true); return; }
    completeSession();
  };

  const completeSession = () => {
    setIsSessionActive(false);
    setTimeline((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: "ended",
        title: "Work session ended",
        description: "Your work session was ended successfully.",
        time: getCurrentTime(),
        date: currentTimelineDate,
      },
    ]);
    setShowModal(false);
  };

  const [timeline, setTimeline] = useState([
    { id: 1, type: "started", title: "Work session started", description: "Your work session has started successfully.", time: "09:00 AM", date: "12 May 2026" },
    { id: 2, type: "update", title: "Daily report updated", description: "You updated your work progress report.", time: "11:30 AM", date: "12 May 2026" },
    { id: 3, type: "break", title: "Break started", description: "You started a short work break.", time: "01:00 PM", date: "12 May 2026" },
  ]);

  const filteredTimeline = timeline.filter((item) => item.date === currentTimelineDate);

  const kpis = [
    { title: "Total Sessions", value: 48, trend: "+2.0%" },
    { title: "Completed Sessions", value: 44, trend: "+3.5%" },
    { title: "Total Hours Worked", value: 162, trend: "+1.2%" },
    { title: "Avg Session Duration", value: "3h 22m", trend: "+0.8%" },
  ];

  const sessions = [
    { date: "2026-05-10", start: "09:00", end: "17:00", duration: "8h", status: "Completed" },
    { date: "2026-05-09", start: "09:15", end: "16:40", duration: "7h 25m", status: "Late" },
    { date: "2026-05-08", start: "—", end: "—", duration: "0h", status: "Absent" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">Main / Work Sessions</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Work Sessions</h1>
          <button
            onClick={handleEndSession}
            className="w-full sm:w-auto bg-[#0052CC] hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition font-medium"
          >
            End Work Session
          </button>
        </div>
      </div>

      {/* ================= KPI ROW ================= */}
      {/* Changed to grid-cols-1 on mobile, grid-cols-2 on tablet, grid-cols-4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0"></div>
              <p className="text-sm text-gray-500 truncate">{kpi.title}</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{kpi.value}</h2>
            <span className="text-xs font-medium text-green-600">{kpi.trend} vs last month</span>
          </div>
        ))}
      </div>

      {/* ================= MAIN GRID ================= */}
      {/* Changed from col-span-2 to stacked (grid-cols-1) on mobile/tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= LEFT SECTION (HISTORY) ================= */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-4 md:p-6 order-2 lg:order-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-semibold">Work Session History</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select className="flex-1 sm:flex-none border border-[#E2E8F0] px-3 py-2 rounded-lg text-sm bg-white">
                <option>This Month</option>
              </select>
              <button className="flex-1 sm:flex-none bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">
                Export PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full text-sm">
                <thead className="border-b text-gray-500 bg-white">
                  <tr>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-center py-3 px-2">Start</th>
                    <th className="text-center py-3 px-2">End</th>
                    <th className="text-center py-3 px-2 hidden sm:table-cell">Duration</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, i) => (
                    <tr key={i} className="border-b last:border-none hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium">{session.date}</td>
                      <td className="text-center py-4 px-2">{session.start}</td>
                      <td className="text-center py-4 px-2">{session.end}</td>
                      <td className="text-center py-4 px-2 hidden sm:table-cell">{session.duration}</td>
                      <td className="text-center py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium 
                          ${session.status === "Completed" ? "bg-green-100 text-green-700" : ""}
                          ${session.status === "Late" ? "bg-orange-100 text-orange-700" : ""}
                          ${session.status === "Absent" ? "bg-red-100 text-red-700" : ""}
                        `}>
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <div className="space-y-6 order-1 lg:order-2">
          {/* SESSION DETAILS */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Session Details</h3>
              <div className={`flex items-center gap-2 text-xs font-bold ${isSessionActive ? "text-green-600" : "text-gray-500"}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${isSessionActive ? "bg-green-500" : "bg-gray-400"}`}></span>
                {isSessionActive ? "Active" : "Ended"}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">Started At: 09:00 AM</p>
            <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight">{formatTime(seconds)}</h2>
            
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-gray-400 mb-1 uppercase tracking-wider font-bold">Location</p>
                <p className="font-bold text-gray-700">Office</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1 uppercase tracking-wider font-bold">Device</p>
                <p className="font-bold text-gray-700 truncate">Win - Chrome</p>
              </div>
            </div>

            <button
              onClick={handleEndSession}
              disabled={!isSessionActive}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <LogOut size={18} /> End Work Session
            </button>
          </div>

          {/* SESSION TIMELINE */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Timeline</h3>
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  <CalendarDays size={14} /> {currentTimelineDate}
                </button>
                {showCalendar && (
                  <div className="absolute top-10 right-0 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl p-2 w-[160px] z-50">
                    {["12 May 2026", "11 May 2026", "10 May 2026"].map((date, i) => (
                      <button
                        key={i}
                        onClick={() => { setCurrentTimelineDate(date); setShowCalendar(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-xs transition"
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative ml-2">
              {filteredTimeline.map((item, i) => (
                <div key={item.id} className="flex gap-4 relative pb-8 last:pb-0">
                  <div className="relative flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center z-10 border border-blue-100">
                      {item.type === "started" && <Clock3 size={14} className="text-[#0052CC]" />}
                      {item.type === "update" && <Pencil size={14} className="text-[#0052CC]" />}
                      {item.type === "ended" && <LogOut size={14} className="text-[#0052CC]" />}
                      {item.type === "break" && <Clock3 size={14} className="text-[#0052CC]" />}
                    </div>
                    {i !== filteredTimeline.length - 1 && (
                      <div className="absolute top-8 w-[1px] h-full bg-gray-100"></div>
                    )}
                  </div>
                  <div className="flex-1 flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-800 truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-[400px] rounded-2xl p-6 shadow-2xl scale-in-center">
            <h2 className="text-xl font-bold mb-2">Daily Report Required</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Submit your work activity report for today before ending your session.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="order-2 sm:order-1 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => { setReportSubmitted(true); completeSession(); }}
                className="order-1 sm:order-2 px-4 py-2 rounded-xl bg-[#0052CC] hover:bg-blue-700 text-white transition font-bold text-sm"
              >
                Submit & End
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}