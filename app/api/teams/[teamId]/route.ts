import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hasCapability } from "@/app/lib/auth/roles";
import { getCurrentUser } from "@/app/lib/auth/session";
import { prisma } from "@/app/lib/prisma";
import { updateTeamSchema } from "@/app/lib/validation/workspace.schema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { teamId } = await params;

  try {
    const body = await req.json();
    const data = updateTeamSchema.parse(body);
    const { memberIds, ...teamData } = data;

    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        id: true,
        pmId: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Команда не найдена" }, { status: 404 });
    }

    const canFullEdit = hasCapability(user.role, "canCreateTeam");
    const canEditMembersOnly =
      hasCapability(user.role, "canManageTeamMembers") && team.pmId === user.id;

    if (!canFullEdit) {
      if (!canEditMembersOnly) {
        return NextResponse.json(
          { error: "Недостаточно прав для редактирования команды" },
          { status: 403 },
        );
      }

      const triesMetaChange =
        teamData.name !== undefined ||
        teamData.color !== undefined ||
        teamData.pmId !== undefined;

      if (triesMetaChange) {
        return NextResponse.json(
          { error: "Менеджер может менять только состав команды" },
          { status: 403 },
        );
      }

      if (memberIds === undefined) {
        return NextResponse.json(
          { error: "Укажите состав команды" },
          { status: 400 },
        );
      }
    }

    if (teamData.pmId) {
      const pmUser = await prisma.user.findFirst({
        where: {
          id: teamData.pmId,
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
    }

    if (memberIds) {
      const uniqueMemberIds = Array.from(new Set(memberIds));
      const existingMembers = await prisma.user.findMany({
        where: {
          id: {
            in: uniqueMemberIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingMembers.length !== uniqueMemberIds.length) {
        return NextResponse.json(
          { error: "Некоторые выбранные участники не найдены" },
          { status: 400 },
        );
      }
    }

    const updatedTeam = await prisma.$transaction(async (tx) => {
      if (Object.keys(teamData).length > 0) {
        await tx.team.update({
          where: {
            id: teamId,
          },
          data: teamData,
          select: {
            id: true,
          },
        });
      }

      const finalPmId = teamData.pmId ?? team.pmId;

      if (memberIds) {
        const uniqueMemberIds = Array.from(new Set(memberIds));
        const existingTeamMembers = await tx.teamMember.findMany({
          where: {
            teamId,
          },
          select: {
            userId: true,
            role: true,
          },
        });

        const ownerIds = existingTeamMembers
          .filter((member) => member.role === "OWNER")
          .map((member) => member.userId);

        const requiredMemberIds = new Set<string>([
          ...uniqueMemberIds,
          finalPmId,
          ...ownerIds,
        ]);

        await tx.teamMember.deleteMany({
          where: {
            teamId,
            role: "MEMBER",
            userId: {
              notIn: Array.from(requiredMemberIds),
            },
          },
        });

        const existingMemberIdSet = new Set(
          existingTeamMembers.map((member) => member.userId),
        );
        const membersToCreate = Array.from(requiredMemberIds)
          .filter((memberId) => !existingMemberIdSet.has(memberId))
          .map((memberId) => ({
            teamId,
            userId: memberId,
            role: "MEMBER" as const,
          }));

        if (membersToCreate.length > 0) {
          await tx.teamMember.createMany({
            data: membersToCreate,
          });
        }
      } else {
        const existingMembership = await tx.teamMember.findUnique({
          where: {
            teamId_userId: {
              teamId,
              userId: finalPmId,
            },
          },
          select: {
            id: true,
          },
        });

        if (!existingMembership) {
          await tx.teamMember.create({
            data: {
              teamId,
              userId: finalPmId,
              role: "MEMBER",
            },
          });
        }
      }

      return tx.team.findUniqueOrThrow({
        where: {
          id: teamId,
        },
        select: {
          id: true,
          name: true,
          color: true,
          pmId: true,
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
    });

    return NextResponse.json({
      team: {
        id: updatedTeam.id,
        name: updatedTeam.name,
        color: updatedTeam.color,
        membersCount: updatedTeam._count.members,
        tasksCount: updatedTeam._count.tasks,
        pm: updatedTeam.pm,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Неверные данные команды" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Не удалось обновить команду" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  if (!hasCapability(user.role, "canCreateTeam")) {
    return NextResponse.json(
      { error: "Недостаточно прав для удаления команды" },
      { status: 403 },
    );
  }

  const { teamId } = await params;

  try {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        id: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Команда не найдена" }, { status: 404 });
    }

    await prisma.team.delete({
      where: {
        id: teamId,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Не удалось удалить команду" },
      { status: 400 },
    );
  }
}
