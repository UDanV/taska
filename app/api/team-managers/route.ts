import { NextResponse } from "next/server";
import { hasCapability } from "@/app/lib/auth/roles";
import { getCurrentUser } from "@/app/lib/auth/session";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  if (!hasCapability(user.role, "canCreateTeam")) {
    return NextResponse.json(
      { error: "Недостаточно прав для выбора PM" },
      { status: 403 },
    );
  }

  const managers = await prisma.user.findMany({
    where: {
      role: {
        in: ["PM", "ROOT"],
      },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json({ managers });
}
