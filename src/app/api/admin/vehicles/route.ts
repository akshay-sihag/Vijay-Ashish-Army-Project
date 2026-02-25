import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vehicles = await prisma.vehicle.findMany({
    include: {
      vehicleAssignment: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vehicles);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { vehicleNumber, typeOfVehicle } = body;

    if (!vehicleNumber || !typeOfVehicle) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.vehicle.findUnique({ where: { vehicleNumber } });
    if (existing) {
      return NextResponse.json({ error: "Vehicle number already exists" }, { status: 409 });
    }

    const vehicle = await prisma.vehicle.create({
      data: { vehicleNumber, typeOfVehicle },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
