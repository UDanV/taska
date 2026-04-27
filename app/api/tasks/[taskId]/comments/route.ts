import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser } from "@/app/lib/auth/session";
import { prisma } from "@/app/lib/prisma";
import { createTaskCommentSchema } from "@/app/lib/validation/workspace.schema";

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { taskId } = await params;

  const task = await prisma.task.findFirst({
    where: getTaskScope(user.id, user.role, taskId),
    select: { id: true },
  });

  if (!task) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { taskId } = await params;

  const task = await prisma.task.findFirst({
    where: getTaskScope(user.id, user.role, taskId),
    select: { id: true },
  });

  if (!task) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = createTaskCommentSchema.parse(body);

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId: user.id,
        body: data.body,
      },
      select: {
        id: true,
        body: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Неверные данные комментария" },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Не удалось добавить комментарий" }, { status: 400 });
  }
}
