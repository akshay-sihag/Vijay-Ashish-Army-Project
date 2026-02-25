"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

interface Admin {
  id: string;
  name: string;
  username: string;
}

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id as string;

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  const fetchAdmin = useCallback(async () => {
    const res = await fetch(`/api/admin/admins/${adminId}`);
    if (res.ok) {
      const data: Admin = await res.json();
      setAdmin(data);
      setFormData({
        name: data.name,
        username: data.username,
        password: "",
      });
    }
    setLoading(false);
  }, [adminId]);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const body: Record<string, string> = {
        name: formData.name,
        username: formData.username,
      };
      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(`/api/admin/admins/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update admin");
        return;
      }

      setSuccess("Admin details saved.");
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading...</div>;
  }

  if (!admin) {
    return <div className="text-center py-16 text-red-400">Admin not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/admin/admins")}
        className="mb-4 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
      >
        &larr; Back to Admins
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Admin: {admin.name}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Admin Details</h2>
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
          <div className="md:col-span-2">
            <label className="block font-medium mb-1 text-sm text-gray-600">New Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Leave blank to keep current"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
