"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { LoaderCircle, Plus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { ROLE_LABELS, USER_SPECIALIZATION_LABELS, type AppRole, type UserSpecialization } from "@/app/lib/auth/roles";
import { TASK_STATUS_LABELS, TEAM_COLOR_OPTIONS } from "@/app/lib/workspace/constants";
import { UnifiedSelect, UnifiedSelectItem } from "@/app/feature/tasks/ui/unified-select";

type TeamColor = (typeof TEAM_COLOR_OPTIONS)[number];

type ManagerItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: AppRole;
};

type TeamMemberItem = {
  id: string;
  teamRole: "OWNER" | "MEMBER";
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: AppRole;
    specialization: UserSpecialization | null;
  };
};

type TeamTaskItem = {
  id: string;
  title: string;
  status: keyof typeof TASK_STATUS_LABELS;
  priority: "LOW" | "MEDIUM" | "HIGH";
  updatedAt: string;
  assignee: {
    id: string;
    name: string | null;
  } | null;
};

type TeamItem = {
  id: string;
  name: string;
  color: string;
  membersCount: number;
  tasksCount: number;
  pm: {
    id: string;
    name: string | null;
    email: string | null;
    role: AppRole;
  };
  members: TeamMemberItem[];
  tasks: TeamTaskItem[];
};

type TeamDraft = {
  name: string;
  color: string;
  pmId: string;
  memberIds: string[];
};

type TeamCreateForm = {
  name: string;
  color: TeamColor;
  pmId: string;
};

type TeamUserItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: AppRole;
  specialization: UserSpecialization | null;
};

function getEmptyCreateForm(pmId: string): TeamCreateForm {
  return {
    name: "",
    color: TEAM_COLOR_OPTIONS[0],
    pmId,
  };
}

function getManagerLabel(manager: ManagerItem) {
  return manager.name || manager.email || "Без имени";
}

function normalizeIds(ids: string[]) {
  return Array.from(new Set(ids)).sort();
}

function areSameIds(left: string[], right: string[]) {
  const normalizedLeft = normalizeIds(left);
  const normalizedRight = normalizeIds(right);

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every((value, index) => value === normalizedRight[index]);
}

export default function TeamsManagementPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [managers, setManagers] = useState<ManagerItem[]>([]);
  const [teamUsers, setTeamUsers] = useState<TeamUserItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, TeamDraft>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEditTeams, setCanEditTeams] = useState(false);
  const [savingTeamId, setSavingTeamId] = useState<string | null>(null);

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [createForm, setCreateForm] = useState<TeamCreateForm>(getEmptyCreateForm(""));

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [teamsRes, managersRes, usersRes] = await Promise.all([
        fetch("/api/teams?includeDetails=1", { cache: "no-store" }),
        fetch("/api/team-managers", { cache: "no-store" }),
        fetch("/api/users", { cache: "no-store" }),
      ]);

      const teamsData = await teamsRes.json();
      const managersData = await managersRes.json();
      const usersData = await usersRes.json();

      if (!teamsRes.ok) {
        throw new Error(teamsData.error || "Не удалось загрузить команды");
      }

      const nextTeams = teamsData.teams ?? [];
      setTeams(nextTeams);
      setDrafts(
        nextTeams.reduce((acc: Record<string, TeamDraft>, team: TeamItem) => {
          acc[team.id] = {
            name: team.name,
            color: team.color,
            pmId: team.pm.id,
            memberIds: team.members.map((member) => member.user.id),
          };
          return acc;
        }, {}),
      );

      if (managersRes.ok) {
        const nextManagers = managersData.managers ?? [];
        setManagers(nextManagers);
        setCanEditTeams(true);
        setTeamUsers(usersRes.ok ? (usersData.users ?? []) : []);
        setCreateForm((current) =>
          current.pmId ? current : getEmptyCreateForm(nextManagers[0]?.id ?? ""),
        );
      } else {
        setManagers([]);
        setTeamUsers([]);
        setCanEditTeams(false);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Не удалось загрузить команды",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const openCreateTeam = () => {
      if (!canEditTeams) {
        return;
      }

      setCreateForm(getEmptyCreateForm(managers[0]?.id ?? ""));
      setIsCreateTeamOpen(true);
    };

    const refreshWorkspace = () => {
      void loadData();
    };

    window.addEventListener("taska:create-team", openCreateTeam);
    window.addEventListener("taska:workspace-updated", refreshWorkspace);

    return () => {
      window.removeEventListener("taska:create-team", openCreateTeam);
      window.removeEventListener("taska:workspace-updated", refreshWorkspace);
    };
  }, [canEditTeams, loadData, managers]);

  const membersTotal = useMemo(
    () => teams.reduce((sum, team) => sum + team.membersCount, 0),
    [teams],
  );

  const tasksTotal = useMemo(
    () => teams.reduce((sum, team) => sum + team.tasksCount, 0),
    [teams],
  );

  const handleDraftChange = <K extends keyof TeamDraft>(
    teamId: string,
    key: K,
    value: TeamDraft[K],
  ) => {
    setDrafts((current) => ({
      ...current,
      [teamId]: {
        ...current[teamId],
        [key]: value,
      },
    }));
  };

  const handleSaveTeam = async (teamId: string) => {
    const draft = drafts[teamId];

    if (!draft) {
      return;
    }

    setSavingTeamId(teamId);

    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Не удалось обновить команду");
      }

      setTeams((current) =>
        current.map((team) =>
          team.id === teamId
            ? {
                ...team,
                ...result.team,
              }
            : team,
        ),
      );
      setDrafts((current) => ({
        ...current,
        [teamId]: {
          name: result.team.name,
          color: result.team.color,
          pmId: result.team.pm.id,
          memberIds:
            current[teamId]?.memberIds ??
            teams.find((team) => team.id === teamId)?.members.map((member) => member.user.id) ??
            [],
        },
      }));
      toast.success("Команда обновлена");
      window.dispatchEvent(new Event("taska:workspace-updated"));
      await loadData();
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : "Не удалось обновить команду",
      );
    } finally {
      setSavingTeamId(null);
    }
  };

  const handleCreateTeam = async () => {
    setSavingTeam(true);

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Не удалось создать команду");
      }

      toast.success("Команда создана");
      setIsCreateTeamOpen(false);
      setCreateForm(getEmptyCreateForm(managers[0]?.id ?? ""));
      window.dispatchEvent(new Event("taska:workspace-updated"));
      void loadData();
    } catch (createError) {
      toast.error(
        createError instanceof Error ? createError.message : "Не удалось создать команду",
      );
    } finally {
      setSavingTeam(false);
    }
  };

  return (
    <>
      <div className="space-y-8 p-4 md:p-6 xl:p-8">
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <UsersRound size={18} className="text-primary" />
              <h1 className="text-lg font-semibold">Команды</h1>
            </div>

            {canEditTeams ? (
              <Button
                color="primary"
                className="rounded-xl"
                startContent={<Plus size={16} />}
                onPress={() => {
                  setCreateForm(getEmptyCreateForm(managers[0]?.id ?? ""));
                  setIsCreateTeamOpen(true);
                }}
              >
                Создать команду
              </Button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Всего команд</p>
              <p className="mt-2 text-3xl font-semibold">{teams.length}</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Участников в командах</p>
              <p className="mt-2 text-3xl font-semibold">{membersTotal}</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Задач в командах</p>
              <p className="mt-2 text-3xl font-semibold">{tasksTotal}</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
              <LoaderCircle className="mx-auto animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Загружаем команды...</p>
            </div>
          ) : error ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-danger/30 bg-danger/5 p-8 text-center">
              <p className="text-base font-medium">{error}</p>
              <Button variant="light" className="mt-4 rounded-xl" onPress={() => void loadData()}>
                Повторить загрузку
              </Button>
            </div>
          ) : teams.length === 0 ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-base font-medium">Команд пока нет</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Создайте первую команду и сразу назначьте для неё PM.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {teams.map((team) => {
                const draft = drafts[team.id] ?? {
                  name: team.name,
                  color: team.color,
                  pmId: team.pm.id,
                  memberIds: team.members.map((member) => member.user.id),
                };
                const isDirty =
                  draft.name !== team.name ||
                  draft.color !== team.color ||
                  draft.pmId !== team.pm.id ||
                  !areSameIds(
                    draft.memberIds,
                    team.members.map((member) => member.user.id),
                  );

                return (
                  <article
                    key={team.id}
                    className="rounded-[26px] border border-border bg-muted/30 p-5"
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: draft.color }}
                            />
                            <h2 className="text-lg font-semibold">{team.name}</h2>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            PM: {team.pm.name || team.pm.email || "Не указан"} |{" "}
                            {team.tasksCount} задач, {team.membersCount} участников
                          </p>
                        </div>

                        {canEditTeams ? (
                          <Button
                            color="primary"
                            className="rounded-xl"
                            isDisabled={!isDirty}
                            isLoading={savingTeamId === team.id}
                            onPress={() => void handleSaveTeam(team.id)}
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
                            onValueChange={(value) =>
                              handleDraftChange(team.id, "name", value)
                            }
                          />

                          <div>
                            <p className="mb-2 text-sm font-medium">Цвет команды</p>
                            <div className="flex flex-wrap gap-2">
                              {TEAM_COLOR_OPTIONS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={`h-8 w-8 rounded-full border-2 ${
                                    draft.color === color
                                      ? "border-foreground"
                                      : "border-transparent"
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => handleDraftChange(team.id, "color", color)}
                                  aria-label={`Цвет ${color}`}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-sm font-medium">PM команды</p>
                            <UnifiedSelect
                              selectedKeys={[draft.pmId]}
                              onChange={(event) =>
                                handleDraftChange(team.id, "pmId", event.target.value)
                              }
                            >
                              {managers.map((manager) => (
                                <UnifiedSelectItem key={manager.id}>
                                  {getManagerLabel(manager)}
                                </UnifiedSelectItem>
                              ))}
                            </UnifiedSelect>
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
                                (member) =>
                                  member.user.id === candidate.id &&
                                  member.teamRole === "OWNER",
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
                                    handleDraftChange(
                                      team.id,
                                      "memberIds",
                                      isMember
                                        ? draft.memberIds.filter(
                                            (memberId) => memberId !== candidate.id,
                                          )
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
                                <div
                                  key={member.id}
                                  className="rounded-2xl bg-muted px-3 py-2.5"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-medium">
                                      {member.user.name ||
                                        member.user.email ||
                                        "Без имени"}
                                    </p>
                                    <Chip size="sm" variant="flat" className="rounded-xl">
                                      {ROLE_LABELS[member.user.role]}
                                    </Chip>
                                    <Chip size="sm" variant="flat" className="rounded-xl">
                                      {member.user.specialization
                                        ? USER_SPECIALIZATION_LABELS[member.user.specialization]
                                        : "Без метки"}
                                    </Chip>
                                  </div>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Роль в команде:{" "}
                                    {member.teamRole === "OWNER"
                                      ? "Владелец"
                                      : "Участник"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-muted-foreground">
                              Пока нет участников.
                            </p>
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
                                    {task.priority.toLowerCase()} | Исполнитель:{" "}
                                    {task.assignee?.name || "Не назначен"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-muted-foreground">
                              Для этой команды ещё нет задач.
                            </p>
                          )}
                        </section>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Modal isOpen={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
        <ModalContent className="rounded-[28px]">
          {(onClose) => (
            <>
              <ModalHeader>Создать команду</ModalHeader>
              <ModalBody className="space-y-4 pb-2">
                <Input
                  label="Название команды"
                  labelPlacement="outside"
                  placeholder="Например, Product"
                  value={createForm.name}
                  onValueChange={(value) =>
                    setCreateForm((current) => ({ ...current, name: value }))
                  }
                />

                <div>
                  <p className="mb-2 text-sm font-medium">Цвет команды</p>
                  <div className="flex flex-wrap gap-3">
                    {TEAM_COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-10 w-10 rounded-full border-2 ${
                          createForm.color === color
                            ? "scale-105 border-foreground"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setCreateForm((current) => ({
                            ...current,
                            color,
                          }))
                        }
                        aria-label={`Цвет ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">PM команды</p>
                  <UnifiedSelect
                    selectedKeys={createForm.pmId ? [createForm.pmId] : []}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        pmId: event.target.value,
                      }))
                    }
                    placeholder="Выберите PM"
                  >
                    {managers.map((manager) => (
                      <UnifiedSelectItem key={manager.id}>
                        {getManagerLabel(manager)}
                      </UnifiedSelectItem>
                    ))}
                  </UnifiedSelect>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="rounded-xl" onPress={onClose}>
                  Отмена
                </Button>
                <Button
                  color="primary"
                  className="rounded-xl"
                  isLoading={savingTeam}
                  isDisabled={!createForm.pmId}
                  onPress={() => void handleCreateTeam()}
                >
                  Создать команду
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
