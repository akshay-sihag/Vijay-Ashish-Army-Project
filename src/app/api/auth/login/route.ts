import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loginType, username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Admin login
    if (loginType === "admin") {
      // Check superadmin (env vars)
      const envUsername = process.env.ADMIN_USERNAME;
      const envPassword = process.env.ADMIN_PASSWORD;

      if (envUsername && envPassword && username === envUsername && password === envPassword) {
        await createSession({ role: "admin", superAdmin: true, name: "Super Admin" });
        return NextResponse.json({ role: "admin" });
      }

      // Check Admin table
      const admin = await prisma.admin.findUnique({ where: { username } });
      if (admin && verifyPassword(password, admin.password)) {
        await createSession({ role: "admin", userId: admin.id, name: admin.name });
        return NextResponse.json({ role: "admin", name: admin.name });
      }

      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Driver login
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    await createSession({ role: "user", userId: user.id, name: user.name });
    return NextResponse.json({ role: "user", name: user.name });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
