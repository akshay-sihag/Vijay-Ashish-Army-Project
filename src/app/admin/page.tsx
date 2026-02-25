"use client";

import { useState, useEffect, useCallback } from "react";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/types";

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
      return "bg-red-100 text-red-700 border-red-200";
    case "Medium":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-green-100 text-green-700 border-green-200";
  }
}

function statusColor(status: string) {
  switch (status) {
    case "Working":
      return "text-green-600";
    case "Not Working":
      return "text-red-600";
    default:
      return "text-gray-500";
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
      <h1 className="text-2xl font-bold mb-6">Task Dashboard</h1>

      {/* Date Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousDay}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 text-lg"
          >
            &larr; Prev
          </button>
          <div className="text-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="text-lg font-semibold border-2 border-gray-200 rounded-lg px-3 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">{displayDate(selectedDate)}</p>
          </div>
          <button
            onClick={goToNextDay}
            disabled={isToday}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-lg"
          >
            Next &rarr;
          </button>
        </div>

        <button
          onClick={handleExport}
          className="bg-green-600 text-white rounded-xl hover:bg-green-700"
        >
          Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-gray-600">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-base"
          >
            <option value="All">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-gray-600">Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-base"
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
            className="text-blue-600 font-semibold hover:underline text-base"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="text-center py-12 text-xl text-gray-500">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
          <p className="text-xl mb-2">
            {tasks.length === 0 ? "No tasks for this date" : "No tasks match the selected filters"}
          </p>
          <p>{tasks.length === 0 ? "Try navigating to a different date." : "Try changing or clearing the filters."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="text-base">
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
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="font-semibold whitespace-nowrap">{t.driverName}</td>
                  <td className="font-semibold text-blue-600 whitespace-nowrap">
                    {t.vehicleNumber}
                  </td>
                  <td>
                    <span className={`font-semibold ${statusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${priorityColor(t.priority || "Low")}`}
                    >
                      {t.priority || "Low"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedTask(t)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 text-base"
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

      <p className="text-gray-400 text-center mt-4">
        {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}
      </p>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">{selectedTask.driverName}</h2>
                <p className="text-gray-500">{selectedTask.user.unit}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2"
              >
                &times;
              </button>
            </div>

            {/* Vehicle Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-500 text-sm uppercase mb-2">Vehicle</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Vehicle Number</p>
                  <p className="font-semibold text-blue-600">{selectedTask.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Type</p>
                  <p className="font-semibold">{selectedTask.typeOfVehicle}</p>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-500 text-sm uppercase mb-2">Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Assigned Location</p>
                  <p className="font-semibold">{selectedTask.assignedLocation || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Current Location</p>
                  <p className="font-semibold">{selectedTask.currentLocation || "-"}</p>
                </div>
              </div>
            </div>

            {/* Task Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-500 text-sm uppercase mb-2">Task Details</h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className={`font-semibold ${statusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Priority</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold border ${priorityColor(selectedTask.priority || "Low")}`}
                  >
                    {selectedTask.priority || "Low"}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm">Task</p>
                  <p className="font-semibold">{selectedTask.task || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Action</p>
                  <p className="font-semibold">{selectedTask.action || "-"}</p>
                </div>
              </div>
            </div>

            {/* Issue Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-500 text-sm uppercase mb-2">Issues & Resolution</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm">Problem</p>
                  <p className="font-semibold">{selectedTask.problem || "-"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Solution</p>
                    <p className="font-semibold">{selectedTask.solution}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Spares</p>
                    <p className="font-semibold">{selectedTask.spares}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold"
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
