import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser } from "@/app/lib/auth/session";
import { hasCapability } from "@/app/lib/auth/roles";
import { prisma } from "@/app/lib/prisma";
import { createTeamSchema } from "@/app/lib/validation/workspace.schema";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    where:
      user.role === "ROOT"
        ? undefined
        : {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
      color: true,
      _count: {
        select: {
          members: true,
          tasks: true,
        },
      },
    },
  });

  return NextResponse.json({
    teams: teams.map((team) => ({
      id: team.id,
      name: team.name,
      color: team.color,
      membersCount: team._count.members,
      tasksCount: team._count.tasks,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  if (!hasCapability(user.role, "canCreateTeam")) {
    return NextResponse.json(
      { error: "Создание команд доступно только root" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const data = createTeamSchema.parse(body);

    const team = await prisma.team.create({
      data: {
        name: data.name,
        color: data.color,
        createdById: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        team: {
          id: team.id,
          name: team.name,
          color: team.color,
          membersCount: team._count.members,
          tasksCount: team._count.tasks,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Неверные данные команды" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Не удалось создать команду" },
      { status: 400 },
    );
  }
}
