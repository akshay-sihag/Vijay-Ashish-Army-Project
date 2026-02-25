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
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 md:px-6 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-xl font-bold text-indigo-700">
            Vijay Ashish
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600 font-medium">{name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 rounded-lg font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-base"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
