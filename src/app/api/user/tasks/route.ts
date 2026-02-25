import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "user" || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const dateStr = searchParams.get("date");

  const where: Record<string, unknown> = { userId: session.userId };

  if (dateStr) {
    const date = new Date(dateStr + "T00:00:00.000Z");
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    where.date = { gte: date, lt: nextDate };
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "user" || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    if (!user.vehicleAssignment) {
      return NextResponse.json(
        { error: "No vehicle assigned. Please contact admin." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { date, assignedLocation, currentLocation, task, action, status, priority, problem, solution, spares } = body;

    if (!date) {
      return NextResponse.json({ error: "Date & Time is required" }, { status: 400 });
    }

    const taskDate = new Date(date);

    const newTask = await prisma.task.create({
      data: {
        userId: session.userId,
        vehicleNumber: user.vehicleAssignment.vehicle.vehicleNumber,
        typeOfVehicle: user.vehicleAssignment.vehicle.typeOfVehicle,
        driverName: user.name,
        assignedLocation: assignedLocation || "",
        currentLocation: currentLocation || "",
        task: task || "",
        action: action || "",
        status: status || "NA",
        priority: priority || "Low",
        problem: problem || "",
        solution: solution || "NA",
        spares: spares || "NA",
        date: taskDate,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
