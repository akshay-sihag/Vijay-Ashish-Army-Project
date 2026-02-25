import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Admin login: password only (no username)
    if (!username) {
      if (password === process.env.ADMIN_PASSWORD) {
        await createSession({ role: "admin" });
        return NextResponse.json({ role: "admin" });
      }
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // User login: username + password
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
