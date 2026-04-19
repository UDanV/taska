import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hasCapability } from "@/app/lib/auth/roles";
import { getCurrentUser } from "@/app/lib/auth/session";
import { prisma } from "@/app/lib/prisma";
import { updateTaskSchema } from "@/app/lib/validation/workspace.schema";

function getTaskScope(userId: string, role: string, taskId: string) {
  if (role === "ROOT") {
    return {
      id: taskId,
    };
  }

  return {
    id: taskId,
    OR: [
      {
        team: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      {
        createdById: userId,
      },
      {
        assigneeId: userId,
      },
    ],
  };
}

async function validateAssignee(
  assigneeId: string | null,
  specialization: string | null,
) {
  if (!assigneeId) {
    return { assigneeId: null };
  }

  if (!specialization) {
    return {
      error: "Сначала укажите метку задачи, а затем исполнителя",
      status: 400 as const,
    };
  }

  const assignee = await prisma.user.findUnique({
    where: { id: assigneeId },
    select: {
      id: true,
      specialization: true,
    },
  });

  if (!assignee) {
    return { error: "Исполнитель не найден", status: 404 as const };
  }

  if (!assignee.specialization) {
    return {
      error: "У выбранного исполнителя не указана специализация",
      status: 400 as const,
    };
  }

  if (assignee.specialization !== specialization) {
    return {
      error: "Специализация исполнителя не совпадает с меткой задачи",
      status: 400 as const,
    };
  }

  return { assigneeId: assignee.id };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  if (!hasCapability(user.role, "canManageTasks")) {
    return NextResponse.json(
      { error: "Недостаточно прав для редактирования задач" },
      { status: 403 },
    );
  }

  const { taskId } = await params;

  try {
    const body = await req.json();
    const data = updateTaskSchema.parse(body);

    const existingTask = await prisma.task.findFirst({
      where: getTaskScope(user.id, user.role, taskId),
      select: {
        id: true,
        specialization: true,
        assigneeId: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    if (data.teamId) {
      const targetTeam = await prisma.team.findFirst({
        where:
          user.role === "ROOT"
            ? { id: data.teamId }
            : {
                id: data.teamId,
                members: {
                  some: {
                    userId: user.id,
                  },
                },
              },
        select: {
          id: true,
        },
      });

      if (!targetTeam) {
        return NextResponse.json(
          { error: "Новая команда недоступна" },
          { status: 404 },
        );
      }
    }

    const nextSpecialization = data.specialization ?? existingTask.specialization;
    const nextAssigneeId =
      data.assigneeId !== undefined ? data.assigneeId : existingTask.assigneeId;

    const assigneeValidation = await validateAssignee(
      nextAssigneeId,
      nextSpecialization,
    );

    if ("error" in assigneeValidation) {
      return NextResponse.json(
        { error: assigneeValidation.error },
        { status: assigneeValidation.status },
      );
    }

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...data,
        assigneeId: assigneeValidation.assigneeId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        specialization: true,
        updatedAt: true,
        team: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Неверные данные задачи" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Не удалось обновить задачу" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  if (!hasCapability(user.role, "canManageTasks")) {
    return NextResponse.json(
      { error: "Недостаточно прав для удаления задач" },
      { status: 403 },
    );
  }

  const { taskId } = await params;

  const existingTask = await prisma.task.findFirst({
    where: getTaskScope(user.id, user.role, taskId),
    select: {
      id: true,
    },
  });

  if (!existingTask) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return NextResponse.json({ success: true });
}