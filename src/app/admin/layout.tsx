import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex flex-col">
      <AdminNav />
      <main className="max-w-7xl mx-auto p-4 md:p-6 flex-1 w-full">{children}</main>
      <footer className="border-t border-gray-200 bg-white/60 backdrop-blur-sm py-4 mt-8">
        <p className="text-center text-sm text-gray-400">
          &copy; 2026 Vijay Ashish. App Designed &amp; Developed by{" "}
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
