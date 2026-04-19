import { NextResponse } from "next/server";
import { hasCapability } from "@/app/lib/auth/roles";
import { getCurrentUser } from "@/app/lib/auth/session";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  if (!hasCapability(user.role, "canManageUsers")) {
    return NextResponse.json(
      { error: "Управление пользователями доступно только root" },
      { status: 403 },
    );
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      specialization: true,
      createdAt: true,
      password: true,
    },
  });

  return NextResponse.json({
    users: users.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      image: item.image,
      role: item.role,
      specialization: item.specialization,
      createdAt: item.createdAt,
      hasPassword: Boolean(item.password),
    })),
  });
}
