"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { GENDER_OPTIONS } from "@/lib/types";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  typeOfVehicle: string;
  vehicleAssignment?: { user: { id: string; name: string } } | null;
}

interface User {
  id: string;
  name: string;
  username: string;
  age: number;
  gender: string;
  unit: string;
  vehicleAssignment?: {
    vehicleId: string;
    vehicle: { vehicleNumber: string; typeOfVehicle: string };
  } | null;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    age: "",
    gender: "Male",
    unit: "",
  });
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const fetchData = useCallback(async () => {
    const [userRes, vehiclesRes] = await Promise.all([
      fetch(`/api/admin/users/${userId}`),
      fetch("/api/admin/vehicles"),
    ]);

    if (userRes.ok) {
      const userData: User = await userRes.json();
      setUser(userData);
      setFormData({
        name: userData.name,
        username: userData.username,
        password: "",
        age: String(userData.age),
        gender: userData.gender,
        unit: userData.unit,
      });
      setSelectedVehicleId(userData.vehicleAssignment?.vehicleId || "");
    }

    if (vehiclesRes.ok) {
      const vehicleData: Vehicle[] = await vehiclesRes.json();
      setVehicles(vehicleData);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const body: Record<string, string> = {
        name: formData.name,
        username: formData.username,
        age: formData.age,
        gender: formData.gender,
        unit: formData.unit,
      };
      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update user");
        return;
      }

      setSuccess("User details saved.");
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignVehicle() {
    setError("");
    setSuccess("");

    if (!selectedVehicleId) {
      // Remove assignment
      const res = await fetch("/api/admin/assignments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setSuccess("Vehicle assignment removed.");
        fetchData();
      }
      return;
    }

    const res = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, vehicleId: selectedVehicleId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to assign vehicle");
      return;
    }

    setSuccess("Vehicle assigned successfully.");
    fetchData();
  }

  if (loading) {
    return <div className="text-center py-12 text-xl text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-12 text-xl text-red-500">User not found</div>;
  }

  // Available vehicles: unassigned OR currently assigned to this user
  const availableVehicles = vehicles.filter(
    (v) =>
      !v.vehicleAssignment ||
      v.vehicleAssignment.user.id === userId
  );

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/admin/users")}
        className="mb-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
      >
        &larr; Back to Users
      </button>

      <h1 className="text-2xl font-bold mb-6">Edit User: {user.name}</h1>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
          {success}
        </div>
      )}

      {/* User Details Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">User Details</h2>
        <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">New Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Leave blank to keep current"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Age</label>
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
            <label className="block font-semibold mb-1">Gender</label>
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
            <label className="block font-semibold mb-1">Unit</label>
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
              className="bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>

      {/* Vehicle Assignment */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Vehicle Assignment</h2>
        {user.vehicleAssignment && (
          <p className="mb-4 text-lg">
            Currently assigned:{" "}
            <span className="font-bold text-green-700">
              {user.vehicleAssignment.vehicle.vehicleNumber}
            </span>{" "}
            ({user.vehicleAssignment.vehicle.typeOfVehicle})
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Select Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              <option value="">-- No Vehicle --</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleNumber} ({v.typeOfVehicle})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAssignVehicle}
              className="bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              {selectedVehicleId ? "Assign Vehicle" : "Remove Assignment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
