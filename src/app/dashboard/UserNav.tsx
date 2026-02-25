"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserNav({ name }: { name: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            AVM
          </Link>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 font-semibold">{name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-colors text-base"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
