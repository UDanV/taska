import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hasCapability } from "@/app/lib/auth/roles";
import { getCurrentUser } from "@/app/lib/auth/session";
import { prisma } from "@/app/lib/prisma";
import { createTaskSchema } from "@/app/lib/validation/workspace.schema";

function getTaskScope(userId: string, role: string) {
  if (role === "ROOT") {
    return {};
  }

  return {
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
  specialization: string,
  teamId: string,
) {
  if (!assigneeId) {
    return { assigneeId: null };
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

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: assignee.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (!membership) {
    return {
      error: "Исполнитель не состоит в выбранной команде",
      status: 400 as const,
    };
  }

  return { assigneeId: assignee.id };
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: getTaskScope(user.id, user.role),
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      photos: true,
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

  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  if (!hasCapability(user.role, "canManageTasks")) {
    return NextResponse.json(
      { error: "Недостаточно прав для создания задач" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const data = createTaskSchema.parse(body);

    const team = await prisma.team.findFirst({
      where:
        user.role === "ROOT"
          ? {
              id: data.teamId,
            }
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

    if (!team) {
      return NextResponse.json(
        { error: "Команда не найдена или недоступна" },
        { status: 404 },
      );
    }

    const assigneeValidation = await validateAssignee(
      data.assigneeId,
      data.specialization,
      data.teamId,
    );

    if ("error" in assigneeValidation) {
      return NextResponse.json(
        { error: assigneeValidation.error },
        { status: assigneeValidation.status },
      );
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        photos: data.photos,
        status: data.status,
        priority: data.priority,
        specialization: data.specialization,
        teamId: data.teamId,
        createdById: user.id,
        assigneeId: assigneeValidation.assigneeId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        photos: true,
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

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Неверные данные задачи" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Не удалось создать задачу" },
      { status: 400 },
    );
  }
}
