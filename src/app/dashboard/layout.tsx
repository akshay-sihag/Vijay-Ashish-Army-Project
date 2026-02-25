import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import UserNav from "./UserNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "user") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav name={session.name || "Driver"} />
      <main className="max-w-4xl mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
