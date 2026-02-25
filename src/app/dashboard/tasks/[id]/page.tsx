"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { STATUS_OPTIONS, SOLUTION_OPTIONS, SPARES_OPTIONS, PRIORITY_OPTIONS } from "@/lib/types";

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
}

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [formData, setFormData] = useState({
    date: "",
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

  const fetchTask = useCallback(async () => {
    const res = await fetch(`/api/user/tasks/${taskId}`);
    if (res.ok) {
      const data: Task = await res.json();
      setTask(data);
      // Convert UTC date to local datetime-local format
      const taskDate = new Date(data.date);
      taskDate.setMinutes(taskDate.getMinutes() - taskDate.getTimezoneOffset());
      const dateLocal = taskDate.toISOString().slice(0, 16);
      setFormData({
        date: dateLocal,
        assignedLocation: data.assignedLocation,
        currentLocation: data.currentLocation,
        task: data.task,
        action: data.action,
        status: data.status,
        priority: data.priority || "Low",
        problem: data.problem,
        solution: data.solution,
        spares: data.spares,
      });
    }
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      const res = await fetch(`/api/user/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMsg("Task updated successfully!");
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        const data = await res.json();
        setMsg(data.error || "Failed to update task");
      }
    } catch {
      setMsg("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-xl text-gray-500">Loading...</div>;
  }

  if (!task) {
    return <div className="text-center py-12 text-xl text-red-500">Task not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
      >
        &larr; Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-6">Edit Task</h1>

      {msg && (
        <div
          className={`px-4 py-3 rounded-xl mb-4 ${
            msg.includes("success")
              ? "bg-green-50 border-2 border-green-200 text-green-700"
              : "bg-red-50 border-2 border-red-200 text-red-700"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Prefilled read-only */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl mb-6">
          <div>
            <label className="block font-semibold mb-1 text-gray-500">Vehicle Number</label>
            <input
              type="text"
              value={task.vehicleNumber}
              disabled
              className="bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-500">Type of Vehicle</label>
            <input
              type="text"
              value={task.typeOfVehicle}
              disabled
              className="bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-500">Driver Name</label>
            <input
              type="text"
              value={task.driverName}
              disabled
              className="bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Editable fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Assigned Location</label>
              <input
                type="text"
                value={formData.assignedLocation}
                onChange={(e) => setFormData({ ...formData, assignedLocation: e.target.value })}
                placeholder="Enter assigned location"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Current Location</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                placeholder="Enter current location"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Task</label>
              <input
                type="text"
                value={formData.task}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                placeholder="Describe the task"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Action</label>
              <input
                type="text"
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                placeholder="Describe the action taken"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                placeholder="Describe any problem"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Solution</label>
              <select
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              >
                {SOLUTION_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Spares</label>
              <select
                value={formData.spares}
                onChange={(e) => setFormData({ ...formData, spares: e.target.value })}
              >
                {SPARES_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-lg px-8"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 text-lg px-8"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
