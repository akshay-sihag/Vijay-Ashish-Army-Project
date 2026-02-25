"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"admin" | "user">("user");
  const [adminUsername, setAdminUsername] = useState("");
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
        body: JSON.stringify({ loginType: "admin", username: adminUsername, password: adminPassword }),
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
        body: JSON.stringify({ loginType: "user", username, password: userPassword }),
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">
            Vijay Ashish
          </h1>
          <p className="text-gray-500 mt-1">Army Fleet Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {/* Tab Selector */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => {
                setActiveTab("user");
                setError("");
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "user"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
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
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Admin Login
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-center text-base">
              {error}
            </div>
          )}

          {/* Admin Login Form */}
          {activeTab === "admin" && (
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Logging in..." : "Login as Admin"}
              </button>
            </form>
          )}

          {/* User Login Form */}
          {activeTab === "user" && (
            <form onSubmit={handleUserLogin} className="space-y-5">
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">
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
                <label className="block text-base font-semibold mb-2 text-gray-700">
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
                className="w-full bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-400">
        <p>&copy; 2026 Vijay Ashish. App Designed &amp; Developed by{" "}
          <a
            href="https://github.com/akshay-sihag"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-600 hover:underline transition-colors"
          >
            Akshay Sihag
          </a>
        </p>
      </footer>
    </div>
  );
}
