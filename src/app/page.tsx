"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"admin" | "user">("user");
  const [adminPassword, setAdminPassword] = useState("");
  const [username, setUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUserLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: userPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Vehicle Management
        </h1>

        {/* Tab Selector */}
        <div className="flex mb-6 bg-gray-200 rounded-xl p-1">
          <button
            onClick={() => {
              setActiveTab("user");
              setError("");
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "user"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Driver Login
          </button>
          <button
            onClick={() => {
              setActiveTab("admin");
              setError("");
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === "admin"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        {/* Admin Login Form */}
        {activeTab === "admin" && (
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </form>
        )}

        {/* User Login Form */}
        {activeTab === "user" && (
          <form onSubmit={handleUserLogin} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-lg font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
