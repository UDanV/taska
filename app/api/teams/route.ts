import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser } from "@/app/lib/auth/session";
import { hasCapability } from "@/app/lib/auth/roles";
import { prisma } from "@/app/lib/prisma";
import { createTeamSchema } from "@/app/lib/validation/workspace.schema";

function getTeamScope(userId: string, role: string) {
  if (role === "ROOT") {
    return undefined;
  }

  return {
    members: {
      some: {
        userId,
      },
    },
  };
}

export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeDetails = searchParams.get("includeDetails") === "1";

  if (includeDetails) {
    const teams = await prisma.team.findMany({
      where: getTeamScope(user.id, user.role),
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        name: true,
        color: true,
        pm: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        members: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                specialization: true,
              },
            },
          },
        },
        tasks: {
          orderBy: {
            updatedAt: "desc",
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            updatedAt: true,
            assignee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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
        pm: team.pm,
        members: team.members.map((member) => ({
          id: member.id,
          teamRole: member.role,
          user: member.user,
        })),
        tasks: team.tasks,
      })),
    });
  }

  const teams = await prisma.team.findMany({
    where: getTeamScope(user.id, user.role),
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
      color: true,
      pm: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
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
      pm: team.pm,
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
    const requestedMemberIds = Array.from(new Set(data.memberIds ?? []));

    const pmUser = await prisma.user.findFirst({
      where: {
        id: data.pmId,
        role: {
          in: ["PM", "ROOT"],
        },
      },
      select: {
        id: true,
      },
    });

    if (!pmUser) {
      return NextResponse.json(
        { error: "Выберите пользователя с ролью PM" },
        { status: 400 },
      );
    }

    if (requestedMemberIds.length > 0) {
      const existingMembers = await prisma.user.findMany({
        where: {
          id: {
            in: requestedMemberIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingMembers.length !== requestedMemberIds.length) {
        return NextResponse.json(
          { error: "Некоторые выбранные участники не найдены" },
          { status: 400 },
        );
      }
    }

    const memberIds = Array.from(
      new Set([user.id, data.pmId, ...requestedMemberIds]),
    );

    const team = await prisma.team.create({
      data: {
        name: data.name,
        color: data.color,
        pmId: data.pmId,
        createdById: user.id,
        members: {
          createMany: {
            data: memberIds.map((memberId) => ({
              userId: memberId,
              role: memberId === user.id ? "OWNER" : ("MEMBER" as const),
            })),
          },
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
        pm: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
          pm: team.pm,
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
