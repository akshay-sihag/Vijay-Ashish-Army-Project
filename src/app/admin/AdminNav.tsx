"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/vehicles", label: "Vehicles" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">AVM</span>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="text-gray-500 hidden sm:inline">Admin</span>
        </div>

        <div className="flex items-center gap-1 md:gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors text-base ${
                pathname === link.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-colors text-base ml-2"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
