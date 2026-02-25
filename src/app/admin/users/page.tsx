"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GENDER_OPTIONS } from "@/lib/types";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  typeOfVehicle: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  age: number;
  gender: string;
  unit: string;
  vehicleAssignment?: {
    vehicle: Vehicle;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    age: "",
    gender: "Male",
    unit: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create user");
        return;
      }

      setFormData({ name: "", username: "", password: "", age: "", gender: "Male", unit: "" });
      setShowForm(false);
      fetchUsers();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all their tasks.`)) {
      return;
    }

    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchUsers();
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading users...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">New User</h2>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                min="18"
                max="100"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-lg mb-1">No users yet</p>
          <p className="text-sm">Click &quot;Add User&quot; to create the first driver account.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Unit</th>
                <th>Vehicle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="font-semibold text-slate-700">{user.name}</td>
                  <td className="text-gray-500">{user.username}</td>
                  <td className="text-slate-600">{user.age}</td>
                  <td className="text-slate-600">{user.gender}</td>
                  <td className="text-slate-600">{user.unit}</td>
                  <td>
                    {user.vehicleAssignment ? (
                      <span className="text-emerald-600 font-semibold">
                        {user.vehicleAssignment.vehicle.vehicleNumber}
                      </span>
                    ) : (
                      <span className="text-gray-300">Not assigned</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 text-sm transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="px-3 py-2 bg-red-50 text-red-500 rounded-lg font-medium hover:bg-red-100 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
