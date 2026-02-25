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

export default function UserDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", age: "", gender: "Male", unit: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Task form
  const [taskForm, setTaskForm] = useState({
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

  const fetchData = useCallback(async () => {
    const [profileRes, tasksRes] = await Promise.all([
      fetch("/api/user/profile"),
      fetch("/api/user/tasks"),
    ]);

    if (profileRes.ok) {
      const data: Profile = await profileRes.json();
      setProfile(data);
      setProfileForm({
        name: data.name,
        age: String(data.age),
        gender: data.gender,
        unit: data.unit,
      });
    }

    if (tasksRes.ok) {
      const data: Task[] = await tasksRes.json();
      setTasks(data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        fetchData();
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
      fetchData();
    } catch {
      setTaskMsg("Something went wrong");
    } finally {
      setTaskSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-xl text-gray-500">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-center py-12 text-xl text-red-500">Could not load profile.</div>;
  }

  const vehicle = profile.vehicleAssignment?.vehicle;

  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    const dateKey = new Date(t.date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push(t);
  });

  return (
    <div className="space-y-6">
      {/* Section 1: Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Profile</h2>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 text-base"
          >
            {editingProfile ? "Cancel" : "Edit"}
          </button>
        </div>

        {profileMsg && (
          <div
            className={`px-4 py-3 rounded-xl mb-4 ${
              profileMsg.includes("success")
                ? "bg-green-50 border-2 border-green-200 text-green-700"
                : "bg-red-50 border-2 border-red-200 text-red-700"
            }`}
          >
            {profileMsg}
          </div>
        )}

        {editingProfile ? (
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Age</label>
              <input
                type="number"
                value={profileForm.age}
                onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Gender</label>
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
              <label className="block font-semibold mb-1">Unit</label>
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
                className="bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {profileSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-semibold text-lg">{profile.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Age</p>
              <p className="font-semibold text-lg">{profile.age}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Gender</p>
              <p className="font-semibold text-lg">{profile.gender}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Unit</p>
              <p className="font-semibold text-lg">{profile.unit}</p>
            </div>
            {vehicle && (
              <>
                <div>
                  <p className="text-gray-500 text-sm">Vehicle Number</p>
                  <p className="font-semibold text-lg text-blue-600">{vehicle.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Vehicle Type</p>
                  <p className="font-semibold text-lg">{vehicle.typeOfVehicle}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Section 2: New Task Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Submit Daily Task</h2>

        {!vehicle && (
          <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl mb-4">
            No vehicle assigned to you yet. Please contact your admin.
          </div>
        )}

        {taskMsg && (
          <div
            className={`px-4 py-3 rounded-xl mb-4 ${
              taskMsg.includes("success")
                ? "bg-green-50 border-2 border-green-200 text-green-700"
                : "bg-red-50 border-2 border-red-200 text-red-700"
            }`}
          >
            {taskMsg}
          </div>
        )}

        <form onSubmit={handleSubmitTask} className="space-y-4">
          {/* Prefilled (read-only) fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
            <div>
              <label className="block font-semibold mb-1 text-gray-500">Vehicle Number</label>
              <input
                type="text"
                value={vehicle?.vehicleNumber || "Not assigned"}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-500">Type of Vehicle</label>
              <input
                type="text"
                value={vehicle?.typeOfVehicle || "Not assigned"}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-500">Driver Name</label>
              <input
                type="text"
                value={profile.name}
                disabled
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Assigned Location</label>
              <input
                type="text"
                value={taskForm.assignedLocation}
                onChange={(e) => setTaskForm({ ...taskForm, assignedLocation: e.target.value })}
                placeholder="Enter assigned location"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Current Location</label>
              <input
                type="text"
                value={taskForm.currentLocation}
                onChange={(e) => setTaskForm({ ...taskForm, currentLocation: e.target.value })}
                placeholder="Enter current location"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Task</label>
              <input
                type="text"
                value={taskForm.task}
                onChange={(e) => setTaskForm({ ...taskForm, task: e.target.value })}
                placeholder="Describe the task"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Action</label>
              <input
                type="text"
                value={taskForm.action}
                onChange={(e) => setTaskForm({ ...taskForm, action: e.target.value })}
                placeholder="Describe the action taken"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Status</label>
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
              <label className="block font-semibold mb-1">Priority</label>
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
              <label className="block font-semibold mb-1">Problem</label>
              <input
                type="text"
                value={taskForm.problem}
                onChange={(e) => setTaskForm({ ...taskForm, problem: e.target.value })}
                placeholder="Describe any problem"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Solution</label>
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
              <label className="block font-semibold mb-1">Spares</label>
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
            className="bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg px-8"
          >
            {taskSaving ? "Submitting..." : "Submit Task"}
          </button>
        </form>
      </div>

      {/* Section 3: Task History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Task History</h2>

        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks submitted yet.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByDate).map(([date, dateTasks]) => (
              <div key={date}>
                <h3 className="text-lg font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  {date}
                </h3>
                <div className="space-y-3">
                  {dateTasks.map((t) => (
                    <div
                      key={t.id}
                      className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-bold text-blue-600">{t.vehicleNumber}</span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span className="text-gray-600">{t.task || "No task description"}</span>
                        </div>
                        <Link
                          href={`/dashboard/tasks/${t.id}`}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 text-base whitespace-nowrap"
                        >
                          Edit
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Status: </span>
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
                        </div>
                        <div>
                          <span className="text-gray-500">Priority: </span>
                          <span
                            className={`font-semibold ${
                              t.priority === "High"
                                ? "text-red-600"
                                : t.priority === "Medium"
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {t.priority || "Low"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Location: </span>
                          <span>{t.currentLocation || "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Solution: </span>
                          <span>{t.solution}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Spares: </span>
                          <span>{t.spares}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
