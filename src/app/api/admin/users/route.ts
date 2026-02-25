import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    include: {
      vehicleAssignment: {
        include: { vehicle: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Strip password from response
  const safeUsers = users.map(({ password: _, ...user }) => user);
  return NextResponse.json(safeUsers);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, username, password, age, gender, unit } = body;

    if (!name || !username || !password || !age || !gender || !unit) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashPassword(password),
        age: parseInt(age),
        gender,
        unit,
      },
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
