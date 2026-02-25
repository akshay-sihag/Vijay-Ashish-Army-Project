import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, vehicleId } = body;

    if (!userId || !vehicleId) {
      return NextResponse.json({ error: "userId and vehicleId are required" }, { status: 400 });
    }

    // Remove any existing assignments for this user or vehicle
    await prisma.vehicleAssignment.deleteMany({
      where: {
        OR: [{ userId }, { vehicleId }],
      },
    });

    // Create new assignment
    const assignment = await prisma.vehicleAssignment.create({
      data: { userId, vehicleId },
      include: { vehicle: true, user: { select: { name: true } } },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to assign vehicle" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await prisma.vehicleAssignment.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove assignment" }, { status: 500 });
  }
}
