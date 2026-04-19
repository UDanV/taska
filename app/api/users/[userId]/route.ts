import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hasCapability } from "@/app/lib/auth/roles";
import { getCurrentUser } from "@/app/lib/auth/session";
import { prisma } from "@/app/lib/prisma";
import { updateUserManagementSchema } from "@/app/lib/validation/user-management.schema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  if (!hasCapability(currentUser.role, "canManageUsers")) {
    return NextResponse.json(
      { error: "Управление пользователями доступно только root" },
      { status: 403 },
    );
  }

  try {
    const { userId } = await params;
    const body = await req.json();
    const data = updateUserManagementSchema.parse(body);

    if (currentUser.id === userId && data.role !== "ROOT") {
      return NextResponse.json(
        { error: "Нельзя снять у себя права root" },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: data.role,
        specialization: data.specialization,
      },
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        specialization: user.specialization,
        createdAt: user.createdAt,
        hasPassword: Boolean(user.password),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Неверные данные пользователя" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Не удалось обновить пользователя" },
      { status: 400 },
    );
  }
}
