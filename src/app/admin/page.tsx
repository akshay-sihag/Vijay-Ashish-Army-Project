"use client";

import { useState, useEffect, useCallback } from "react";

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
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
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

export default function AdminDashboard() {
  const today = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

      {/* Tasks Table */}
      {loading ? (
        <div className="text-center py-12 text-xl text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
          <p className="text-xl mb-2">No tasks for this date</p>
          <p>Try navigating to a different date.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="text-base">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Vehicle No.</th>
                <th>Type</th>
                <th>Assigned Loc.</th>
                <th>Current Loc.</th>
                <th>Task</th>
                <th>Action</th>
                <th>Status</th>
                <th>Problem</th>
                <th>Solution</th>
                <th>Spares</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="font-semibold whitespace-nowrap">{t.driverName}</td>
                  <td className="font-semibold text-blue-600 whitespace-nowrap">
                    {t.vehicleNumber}
                  </td>
                  <td className="whitespace-nowrap">{t.typeOfVehicle}</td>
                  <td>{t.assignedLocation || "-"}</td>
                  <td>{t.currentLocation || "-"}</td>
                  <td>{t.task || "-"}</td>
                  <td>{t.action || "-"}</td>
                  <td>
                    <span
                      className={`font-semibold ${
                        t.status === "Working"
                          ? "text-green-600"
                          : t.status === "Not Working"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>{t.problem || "-"}</td>
                  <td>{t.solution}</td>
                  <td>{t.spares}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-gray-400 text-center mt-4">
        {tasks.length} task{tasks.length !== 1 ? "s" : ""} found
      </p>
    </div>
  );
}
