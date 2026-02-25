import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = await prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
    },
  });

  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  return NextResponse.json(admin);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, username, password } = body;

    const data: Record<string, string> = {};
    if (name) data.name = name;
    if (username) {
      // Check uniqueness
      const existing = await prisma.admin.findUnique({ where: { username } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return NextResponse.json({ error: "Username already taken by a driver" }, { status: 400 });
      }
      data.username = username;
    }
    if (password) data.password = hashPassword(password);

    const updated = await prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only superadmin can delete admins
  if (!session.superAdmin) {
    return NextResponse.json({ error: "Only the super admin can delete admins" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 });
  }
}
