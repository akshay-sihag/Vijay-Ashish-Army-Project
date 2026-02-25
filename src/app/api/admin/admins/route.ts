import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
    },
  });

  return NextResponse.json(admins);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, username, password } = body;

    if (!name || !username || !password) {
      return NextResponse.json({ error: "Name, username, and password are required" }, { status: 400 });
    }

    // Check for duplicate username across both Admin and User tables
    const existingAdmin = await prisma.admin.findUnique({ where: { username } });
    if (existingAdmin) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: "Username already taken by a driver" }, { status: 400 });
    }

    const admin = await prisma.admin.create({
      data: {
        name,
        username,
        password: hashPassword(password),
      },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
      },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
