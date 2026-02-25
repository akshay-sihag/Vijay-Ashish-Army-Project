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
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 md:px-6 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-700">Vijay Ashish</span>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span className="text-gray-500 hidden sm:inline font-medium text-sm">Admin</span>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-base ${
                pathname === link.href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-base ml-1"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
