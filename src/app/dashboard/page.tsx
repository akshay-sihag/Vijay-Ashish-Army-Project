"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { STATUS_OPTIONS, SOLUTION_OPTIONS, SPARES_OPTIONS, PRIORITY_OPTIONS, GENDER_OPTIONS } from "@/lib/types";

interface VehicleInfo {
  vehicleNumber: string;
  typeOfVehicle: string;
}

interface Profile {
  id: string;
  name: string;
  username: string;
  age: number;
  gender: string;
  unit: string;
  vehicleAssignment?: {
    vehicle: VehicleInfo;
  } | null;
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
  updatedAt: string;
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

function getCurrentDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
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

export default function UserDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", age: "", gender: "Male", unit: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Task form
  const [taskForm, setTaskForm] = useState({
    date: getCurrentDateTime(),
    assignedLocation: "",
    currentLocation: "",
    task: "",
    action: "",
    status: "NA",
    priority: "Low",
    problem: "",
    solution: "NA",
    spares: "NA",
  });
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskMsg, setTaskMsg] = useState("");

  // Task history with date navigation
  const today = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/user/profile");
    if (res.ok) {
      const data: Profile = await res.json();
      setProfile(data);
      setProfileForm({
        name: data.name,
        age: String(data.age),
        gender: data.gender,
        unit: data.unit,
      });
    }
    setLoading(false);
  }, []);

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    const res = await fetch(`/api/user/tasks?date=${selectedDate}`);
    if (res.ok) {
      const data: Task[] = await res.json();
      setTasks(data);
    }
    setTasksLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  const isToday = selectedDate === today;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      if (res.ok) {
        setProfileMsg("Profile updated successfully.");
        setEditingProfile(false);
        fetchProfile();
      } else {
        const data = await res.json();
        setProfileMsg(data.error || "Failed to update profile");
      }
    } catch {
      setProfileMsg("Something went wrong");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleSubmitTask(e: React.FormEvent) {
    e.preventDefault();
    setTaskSaving(true);
    setTaskMsg("");

    try {
      const res = await fetch("/api/user/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setTaskMsg(data.error || "Failed to submit task");
        return;
      }

      setTaskMsg("Task submitted successfully!");
      setTaskForm({
        date: getCurrentDateTime(),
        assignedLocation: "",
        currentLocation: "",
        task: "",
        action: "",
        status: "NA",
        priority: "Low",
        problem: "",
        solution: "NA",
        spares: "NA",
      });
      fetchTasks();
    } catch {
      setTaskMsg("Something went wrong");
    } finally {
      setTaskSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-center py-16 text-red-400">Could not load profile.</div>;
  }

  const vehicle = profile.vehicleAssignment?.vehicle;

  return (
    <div className="space-y-6">
      {/* Section 1: Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">My Profile</h2>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 text-sm transition-colors"
          >
            {editingProfile ? "Cancel" : "Edit"}
          </button>
        </div>

        {profileMsg && (
          <div
            className={`px-4 py-3 rounded-xl mb-4 text-sm ${
              profileMsg.includes("success")
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {profileMsg}
          </div>
        )}

        {editingProfile ? (
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Age</label>
              <input
                type="number"
                value={profileForm.age}
                onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Gender</label>
              <select
                value={profileForm.gender}
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Unit</label>
              <input
                type="text"
                value={profileForm.unit}
                onChange={(e) => setProfileForm({ ...profileForm, unit: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {profileSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Name</p>
              <p className="font-semibold text-slate-700">{profile.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Age</p>
              <p className="font-semibold text-slate-700">{profile.age}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Gender</p>
              <p className="font-semibold text-slate-700">{profile.gender}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Unit</p>
              <p className="font-semibold text-slate-700">{profile.unit}</p>
            </div>
            {vehicle && (
              <>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Vehicle Number</p>
                  <p className="font-semibold text-indigo-600">{vehicle.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Vehicle Type</p>
                  <p className="font-semibold text-slate-700">{vehicle.typeOfVehicle}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Section 2: New Task Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Submit Daily Task</h2>

        {!vehicle && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl mb-4 text-sm">
            No vehicle assigned to you yet. Please contact your admin.
          </div>
        )}

        {taskMsg && (
          <div
            className={`px-4 py-3 rounded-xl mb-4 text-sm ${
              taskMsg.includes("success")
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {taskMsg}
          </div>
        )}

        <form onSubmit={handleSubmitTask} className="space-y-4">
          {/* Prefilled (read-only) fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block font-medium mb-1 text-xs text-gray-400 uppercase tracking-wider">Vehicle Number</label>
              <input
                type="text"
                value={vehicle?.vehicleNumber || "Not assigned"}
                disabled
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-xs text-gray-400 uppercase tracking-wider">Type of Vehicle</label>
              <input
                type="text"
                value={vehicle?.typeOfVehicle || "Not assigned"}
                disabled
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-xs text-gray-400 uppercase tracking-wider">Driver Name</label>
              <input
                type="text"
                value={profile.name}
                disabled
              />
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-medium mb-1 text-sm text-gray-600">Date & Time *</label>
              <input
                type="datetime-local"
                value={taskForm.date}
                onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Assigned Location</label>
              <input
                type="text"
                value={taskForm.assignedLocation}
                onChange={(e) => setTaskForm({ ...taskForm, assignedLocation: e.target.value })}
                placeholder="Enter assigned location"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Current Location</label>
              <input
                type="text"
                value={taskForm.currentLocation}
                onChange={(e) => setTaskForm({ ...taskForm, currentLocation: e.target.value })}
                placeholder="Enter current location"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Task</label>
              <input
                type="text"
                value={taskForm.task}
                onChange={(e) => setTaskForm({ ...taskForm, task: e.target.value })}
                placeholder="Describe the task"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Action</label>
              <input
                type="text"
                value={taskForm.action}
                onChange={(e) => setTaskForm({ ...taskForm, action: e.target.value })}
                placeholder="Describe the action taken"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Problem</label>
              <input
                type="text"
                value={taskForm.problem}
                onChange={(e) => setTaskForm({ ...taskForm, problem: e.target.value })}
                placeholder="Describe any problem"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Solution</label>
              <select
                value={taskForm.solution}
                onChange={(e) => setTaskForm({ ...taskForm, solution: e.target.value })}
              >
                {SOLUTION_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Spares</label>
              <select
                value={taskForm.spares}
                onChange={(e) => setTaskForm({ ...taskForm, spares: e.target.value })}
              >
                {SPARES_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={taskSaving || !vehicle}
            className="bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-8"
          >
            {taskSaving ? "Submitting..." : "Submit Task"}
          </button>
        </form>
      </div>

      {/* Section 3: Task History with Date Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Task History</h2>

        {/* Date Navigation */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={goToPreviousDay}
            className="px-3 py-2 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            &larr; Prev
          </button>
          <div className="text-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="font-semibold rounded-xl px-3 py-2"
            />
            <p className="text-sm text-gray-400 mt-1">{displayDate(selectedDate)}</p>
          </div>
          <button
            onClick={goToNextDay}
            disabled={isToday}
            className="px-3 py-2 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next &rarr;
          </button>
        </div>

        {tasksLoading ? (
          <p className="text-gray-400 text-center py-10">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No tasks for this date.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="border border-gray-100 rounded-xl p-4 hover:bg-indigo-50/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-indigo-600">{t.vehicleNumber}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-600">{t.task || "No task description"}</span>
                  </div>
                  <Link
                    href={`/dashboard/tasks/${t.id}`}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 text-sm whitespace-nowrap transition-colors"
                  >
                    Edit
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Status:</span>
                    <span
                      className={`font-semibold ${
                        t.status === "Working"
                          ? "text-emerald-600"
                          : t.status === "Not Working"
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityColor(t.priority || "Low")}`}
                  >
                    {t.priority || "Low"}
                  </span>
                  <div>
                    <span className="text-gray-400">Location: </span>
                    <span className="text-slate-600">{t.currentLocation || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Solution: </span>
                    <span className="text-slate-600">{t.solution}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Spares: </span>
                    <span className="text-slate-600">{t.spares}</span>
                  </div>
                </div>
                {t.date && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(t.date).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-gray-400 text-center mt-4 text-xs">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} found
        </p>
      </div>
    </div>
  );
}
