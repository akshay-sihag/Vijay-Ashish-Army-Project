import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const dateStr = searchParams.get("date");

  const where: Record<string, unknown> = {};

  if (dateStr) {
    const date = new Date(dateStr + "T00:00:00.000Z");
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    where.date = { gte: date, lt: nextDate };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      user: { select: { name: true, username: true, unit: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}
