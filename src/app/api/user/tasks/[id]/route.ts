import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "user" || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });

  if (!task || task.userId !== session.userId) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "user" || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const { assignedLocation, currentLocation, task, action, status, problem, solution, spares } = body;

    const data: Record<string, string> = {};
    if (assignedLocation !== undefined) data.assignedLocation = assignedLocation;
    if (currentLocation !== undefined) data.currentLocation = currentLocation;
    if (task !== undefined) data.task = task;
    if (action !== undefined) data.action = action;
    if (status !== undefined) data.status = status;
    if (problem !== undefined) data.problem = problem;
    if (solution !== undefined) data.solution = solution;
    if (spares !== undefined) data.spares = spares;

    const updated = await prisma.task.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
