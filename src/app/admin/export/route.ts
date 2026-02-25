import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

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
    orderBy: { date: "desc" },
  });

  const data = tasks.map((t) => ({
    Date: new Date(t.date).toLocaleDateString("en-IN"),
    "Driver Name": t.driverName,
    Unit: t.user.unit,
    "Vehicle Number": t.vehicleNumber,
    "Type of Vehicle": t.typeOfVehicle,
    "Assigned Location": t.assignedLocation,
    "Current Location": t.currentLocation,
    Task: t.task,
    Action: t.action,
    Status: t.status,
    Problem: t.problem,
    Solution: t.solution,
    Spares: t.spares,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 12 }, // Date
    { wch: 20 }, // Driver Name
    { wch: 12 }, // Unit
    { wch: 15 }, // Vehicle Number
    { wch: 15 }, // Type
    { wch: 20 }, // Assigned Location
    { wch: 20 }, // Current Location
    { wch: 25 }, // Task
    { wch: 25 }, // Action
    { wch: 14 }, // Status
    { wch: 25 }, // Problem
    { wch: 14 }, // Solution
    { wch: 14 }, // Spares
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const filename = dateStr ? `tasks-${dateStr}.xlsx` : "tasks-all.xlsx";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
