import { NextResponse } from "next/server";
import { hasCapability } from "@/app/lib/auth/roles";
import { getCurrentUser } from "@/app/lib/auth/session";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  if (!hasCapability(user.role, "canManageTasks")) {
    return NextResponse.json(
      { error: "Назначение исполнителей недоступно" },
      { status: 403 },
    );
  }

  const users = await prisma.user.findMany({
    where: {
      specialization: {
        not: null,
      },
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      specialization: true,
    },
  });

  return NextResponse.json({ users });
}
