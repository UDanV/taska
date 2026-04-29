"use client";

import { Button, Chip, Input } from "@heroui/react";
import { SelectItemUI, SelectUI } from "@/app/shared/components/ui/select";
import { ROLE_LABELS, getUserSpecializationLabel } from "@/app/lib/auth/roles";
import { TASK_STATUS_LABELS, TEAM_COLOR_OPTIONS } from "@/app/lib/workspace/constants";
import type { ManagerItem, TeamDraft, TeamItem, TeamUserItem } from "../../model/types";

type TeamsManagementTeamCardProps = {
  team: TeamItem;
  draft: TeamDraft;
  canEditTeams: boolean;
  managers: ManagerItem[];
  teamUsers: TeamUserItem[];
  isDirty: boolean;
  isSaving: boolean;
  onSave: (teamId: string) => void | Promise<void>;
  onDraftChange: <K extends keyof TeamDraft>(teamId: string, key: K, value: TeamDraft[K]) => void;
};

function getManagerLabel(manager: ManagerItem) {
  return manager.name || manager.email || "Без имени";
}

export default function TeamsManagementTeamCard({
  team,
  draft,
  canEditTeams,
  managers,
  teamUsers,
  isDirty,
  isSaving,
  onSave,
  onDraftChange,
}: TeamsManagementTeamCardProps) {
  return (
    <article className="rounded-[26px] border border-border bg-muted/30 p-5">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: draft.color }} />
              <h2 className="text-lg font-semibold">{team.name}</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              PM: {team.pm.name || team.pm.email || "Не указан"} | {team.tasksCount} задач,{" "}
              {team.membersCount} участников
            </p>
          </div>

          {canEditTeams ? (
            <Button
              color="primary"
              className="rounded-xl"
              isDisabled={!isDirty}
              isLoading={isSaving}
              onPress={() => void onSave(team.id)}
            >
              Сохранить
            </Button>
          ) : null}
        </div>

        {canEditTeams ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Название команды"
              labelPlacement="outside"
              value={draft.name}
              onValueChange={(value) => onDraftChange(team.id, "name", value)}
            />

            <div>
              <p className="mb-2 text-sm font-medium">Цвет команды</p>
              <div className="flex flex-wrap gap-2">
                {TEAM_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 ${
                      draft.color === color ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onDraftChange(team.id, "color", color)}
                    aria-label={`Цвет ${color}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">PM команды</p>
              <SelectUI
                selectedKeys={draft.pmId ? [draft.pmId] : []}
                placeholder="Выберите PM"
                onChange={(event) => onDraftChange(team.id, "pmId", event.target.value)}
              >
                {managers.map((manager) => (
                  <SelectItemUI key={manager.id}>{getManagerLabel(manager)}</SelectItemUI>
                ))}
              </SelectUI>
            </div>
          </div>
        ) : null}

        {canEditTeams ? (
          <section className="rounded-3xl bg-background p-4">
            <h3 className="font-medium">Состав команды</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Выберите пользователей, которых нужно добавить в эту команду.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {teamUsers.map((candidate) => {
                const isMember = draft.memberIds.includes(candidate.id);
                const isOwner = team.members.some(
                  (member) => member.user.id === candidate.id && member.teamRole === "OWNER",
                );

                return (
                  <Button
                    key={candidate.id}
                    size="sm"
                    variant={isMember ? "solid" : "bordered"}
                    color={isMember ? "primary" : "default"}
                    className="rounded-xl"
                    isDisabled={isOwner}
                    onPress={() =>
                      onDraftChange(
                        team.id,
                        "memberIds",
                        isMember
                          ? draft.memberIds.filter((memberId) => memberId !== candidate.id)
                          : [...draft.memberIds, candidate.id],
                      )
                    }
                  >
                    {candidate.name || candidate.email || "Без имени"}
                  </Button>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-3xl bg-background p-4">
            <h3 className="font-medium">Участники</h3>
            {team.members.length > 0 ? (
              <div className="mt-3 space-y-3">
                {team.members.map((member) => (
                  <div key={member.id} className="rounded-2xl bg-muted px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {member.user.name || member.user.email || "Без имени"}
                      </p>
                      <Chip size="sm" variant="flat" className="rounded-xl">
                        {ROLE_LABELS[member.user.role]}
                      </Chip>
                      <Chip size="sm" variant="flat" className="rounded-xl">
                        {getUserSpecializationLabel(member.user.specialization) ?? "Без метки"}
                      </Chip>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Роль в команде: {member.teamRole === "OWNER" ? "Владелец" : "Участник"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Пока нет участников.</p>
            )}
          </section>

          <section className="rounded-3xl bg-background p-4">
            <h3 className="font-medium">Задачи команды</h3>
            {team.tasks.length > 0 ? (
              <div className="mt-3 space-y-3">
                {team.tasks.map((task) => (
                  <div key={task.id} className="rounded-2xl bg-muted px-3 py-2.5">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Статус: {TASK_STATUS_LABELS[task.status]} | Приоритет:{" "}
                      {task.priority.toLowerCase()} | Исполнитель: {task.assignee?.name || "Не назначен"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Для этой команды ещё нет задач.</p>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}
