"use client";

import { useState, useEffect, useCallback } from "react";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  typeOfVehicle: string;
  vehicleAssignment?: {
    user: { id: string; name: string };
  } | null;
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ vehicleNumber: "", typeOfVehicle: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ vehicleNumber: "", typeOfVehicle: "" });

  const fetchVehicles = useCallback(async () => {
    const res = await fetch("/api/admin/vehicles");
    if (res.ok) {
      const data = await res.json();
      setVehicles(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create vehicle");
        return;
      }

      setFormData({ vehicleNumber: "", typeOfVehicle: "" });
      setShowForm(false);
      fetchVehicles();
    } catch {
      setFormError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(id: string) {
    const res = await fetch(`/api/admin/vehicles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });

    if (res.ok) {
      setEditingId(null);
      fetchVehicles();
    }
  }

  async function handleDelete(id: string, vehicleNumber: string) {
    if (!confirm(`Are you sure you want to delete vehicle "${vehicleNumber}"?`)) {
      return;
    }

    const res = await fetch(`/api/admin/vehicles/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchVehicles();
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading vehicles...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manage Vehicles</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          {showForm ? "Cancel" : "Add Vehicle"}
        </button>
      </div>

      {/* Add Vehicle Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">New Vehicle</h2>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Vehicle Number</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-600">Type of Vehicle</label>
              <input
                type="text"
                value={formData.typeOfVehicle}
                onChange={(e) => setFormData({ ...formData, typeOfVehicle: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Creating..." : "Create Vehicle"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles Table */}
      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-lg mb-1">No vehicles yet</p>
          <p className="text-sm">Click &quot;Add Vehicle&quot; to add the first vehicle.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Type of Vehicle</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td>
                    {editingId === vehicle.id ? (
                      <input
                        type="text"
                        value={editData.vehicleNumber}
                        onChange={(e) => setEditData({ ...editData, vehicleNumber: e.target.value })}
                        className="w-full"
                      />
                    ) : (
                      <span className="font-semibold text-slate-700">{vehicle.vehicleNumber}</span>
                    )}
                  </td>
                  <td>
                    {editingId === vehicle.id ? (
                      <input
                        type="text"
                        value={editData.typeOfVehicle}
                        onChange={(e) => setEditData({ ...editData, typeOfVehicle: e.target.value })}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-slate-600">{vehicle.typeOfVehicle}</span>
                    )}
                  </td>
                  <td>
                    {vehicle.vehicleAssignment ? (
                      <span className="text-emerald-600 font-semibold">
                        {vehicle.vehicleAssignment.user.name}
                      </span>
                    ) : (
                      <span className="text-gray-300">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {editingId === vehicle.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(vehicle.id)}
                            className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 text-sm transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-2 bg-gray-50 text-gray-500 rounded-lg font-medium hover:bg-gray-100 text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(vehicle.id);
                              setEditData({
                                vehicleNumber: vehicle.vehicleNumber,
                                typeOfVehicle: vehicle.typeOfVehicle,
                              });
                            }}
                            className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id, vehicle.vehicleNumber)}
                            className="px-3 py-2 bg-red-50 text-red-500 rounded-lg font-medium hover:bg-red-100 text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </>
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
