"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Admin {
  id: string;
  name: string;
  username: string;
  createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", password: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAdmins = useCallback(async () => {
    const res = await fetch("/api/admin/admins");
    if (res.ok) {
      const data = await res.json();
      setAdmins(data);
    }
    setLoading(false);
  }, []);

  const fetchSession = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      setIsSuperAdmin(!!data.superAdmin);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    fetchSession();
  }, [fetchAdmins, fetchSession]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create admin");
        return;
      }

      setFormData({ name: "", username: "", password: "" });
      setShowForm(false);
      fetchAdmins();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete admin "${name}"?`)) {
      return;
    }

    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAdmins();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete admin");
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading admins...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manage Admins</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          {showForm ? "Cancel" : "Add Admin"}
        </button>
      </div>

      {/* Add Admin Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">New Admin</h2>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins Table */}
      {admins.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-lg mb-1">No admins created yet</p>
          <p className="text-sm">Click &quot;Add Admin&quot; to create the first admin account.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="font-semibold text-slate-700">{admin.name}</td>
                  <td className="text-gray-500">{admin.username}</td>
                  <td className="text-gray-400 text-sm">
                    {new Date(admin.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/admins/${admin.id}`}
                        className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 text-sm transition-colors"
                      >
                        Edit
                      </Link>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(admin.id, admin.name)}
                          className="px-3 py-2 bg-red-50 text-red-500 rounded-lg font-medium hover:bg-red-100 text-sm transition-colors"
                        >
                          Delete
                        </button>
                      )}
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
