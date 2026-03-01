"use client";

import { useState, useEffect, useCallback } from "react";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/types";
export function startListening(onResult: (text: string) => void) {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-IN";

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.start();
}

interface Task {
  id: string;
  vehicleNumber: string;
  typeOfVehicle: string;
  driverName: string;
  assignedLocation: string;
  currentLocation: string;
  task: string;
  action: string;
  status: string;
  priority: string;
  problem: string;
  solution: string;
  spares: string;
  date: string;
  user: {
    name: string;
    username: string;
    unit: string;
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function displayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function priorityColor(priority: string) {
  switch (priority) {
    case "High":
      return "bg-red-50 text-red-700 border-red-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
}

function statusColor(status: string) {
  switch (status) {
    case "Working":
      return "text-emerald-600";
    case "Not Working":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

export default function AdminDashboard() {
  const today = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/tasks?date=${selectedDate}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function goToPreviousDay() {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() - 1);
    setSelectedDate(formatDate(date));
  }

  function goToNextDay() {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() + 1);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    if (date <= todayDate) {
      setSelectedDate(formatDate(date));
    }
  }

  function handleExport() {
    window.open(`/admin/export?date=${selectedDate}`, "_blank");
  }

  const isToday = selectedDate === today;

  // Apply filters
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (filterPriority !== "All" && (t.priority || "Low") !== filterPriority) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Task Dashboard</h1>

      {/* Date Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousDay}
            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            &larr; Prev
          </button>
          <div className="text-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="text-base font-semibold rounded-xl px-3 py-2"
            />
            <p className="text-sm text-gray-400 mt-1">{displayDate(selectedDate)}</p>
          </div>
          <button
            onClick={goToNextDay}
            disabled={isToday}
            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next &rarr;
          </button>
        </div>

        <button
          onClick={handleExport}
          className="bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-500 text-sm">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl px-3 py-2 text-base"
          >
            <option value="All">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-500 text-sm">Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-xl px-3 py-2 text-base"
          >
            <option value="All">All</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        {(filterStatus !== "All" || filterPriority !== "All") && (
          <button
            onClick={() => { setFilterStatus("All"); setFilterPriority("All"); }}
            className="text-indigo-600 font-medium hover:underline text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-lg mb-1">
            {tasks.length === 0 ? "No tasks for this date" : "No tasks match the selected filters"}
          </p>
          <p className="text-sm">{tasks.length === 0 ? "Try navigating to a different date." : "Try changing or clearing the filters."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Vehicle No.</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="font-semibold whitespace-nowrap text-slate-700">{t.driverName}</td>
                  <td className="font-semibold text-indigo-600 whitespace-nowrap">
                    {t.vehicleNumber}
                  </td>
                  <td>
                    <span className={`font-semibold ${statusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityColor(t.priority || "Low")}`}
                    >
                      {t.priority || "Low"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedTask(t)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 text-sm transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-gray-400 text-center mt-4 text-sm">
        {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}
      </p>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedTask.driverName}</h2>
                <p className="text-gray-400 text-sm">{selectedTask.user.unit}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-300 hover:text-gray-500 text-2xl leading-none px-2 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Date/Time */}
            <div className="bg-indigo-50/50 rounded-xl p-4 mb-4 border border-indigo-100">
              <h3 className="font-bold text-indigo-400 text-xs uppercase tracking-wider mb-1">Date & Time</h3>
              <p className="font-semibold text-slate-700">
                {new Date(selectedTask.date).toLocaleString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Vehicle Info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Vehicle</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Vehicle Number</p>
                  <p className="font-semibold text-indigo-600">{selectedTask.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Type</p>
                  <p className="font-semibold text-slate-700">{selectedTask.typeOfVehicle}</p>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Assigned Location</p>
                  <p className="font-semibold text-slate-700">{selectedTask.assignedLocation || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Current Location</p>
                  <p className="font-semibold text-slate-700">{selectedTask.currentLocation || "-"}</p>
                </div>
              </div>
            </div>

            {/* Task Info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Task Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-gray-400 text-xs">Status</p>
                  <p className={`font-semibold ${statusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Priority</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityColor(selectedTask.priority || "Low")}`}
                  >
                    {selectedTask.priority || "Low"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs">Task</p>
                  <p className="font-semibold text-slate-700">{selectedTask.task || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Action</p>
                  <p className="font-semibold text-slate-700">{selectedTask.action || "-"}</p>
                </div>
              </div>
            </div>

            {/* Issue Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Issues & Resolution</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs">Problem</p>
                  <p className="font-semibold text-slate-700">{selectedTask.problem || "-"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs">Solution</p>
                    <p className="font-semibold text-slate-700">{selectedTask.solution}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Spares</p>
                    <p className="font-semibold text-slate-700">{selectedTask.spares}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
