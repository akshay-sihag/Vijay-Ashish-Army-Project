import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "user" || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      vehicleAssignment: {
        include: { vehicle: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { password: _, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "user" || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, age, gender, unit } = body;

    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (age) data.age = parseInt(age);
    if (gender) data.gender = gender;
    if (unit) data.unit = unit;

    const user = await prisma.user.update({
      where: { id: session.userId },
      data,
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
