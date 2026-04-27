"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  ChartBar,
  ChartPie,
  CheckCircle2,
  Flag,
  LoaderCircle,
  Plus,
  SlidersHorizontal,
  Table,
  Users,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { toast } from "sonner";
import {
  type UserSpecialization,
} from "@/app/lib/auth/roles";
import { useDashboardPreferences } from "@/app/shared/providers/dashboard-preferences";
import {
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  TEAM_COLOR_OPTIONS,
  type TaskPriority,
  type TaskStatus,
} from "@/app/lib/workspace/constants";
import TaskEditorModal, {
  createEmptyTaskForm,
  type TaskModalAssigneeItem,
  type TaskModalFormState,
} from "@/app/feature/tasks/task-editor-modal";
import { UnifiedSelect, UnifiedSelectItem } from "@/app/feature/tasks/ui/unified-select";

type TeamColor = (typeof TEAM_COLOR_OPTIONS)[number];

type TeamItem = {
  id: string;
  name: string;
  color: string;
  membersCount: number;
  tasksCount: number;
};

type TeamManagerItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: "ROOT" | "PM" | "EMPLOYEE";
};

type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  specialization: UserSpecialization | null;
  updatedAt: string;
  team: {
    id: string;
    name: string;
    color: string;
  };
  createdBy: {
    id: string;
    name: string | null;
  };
  assignee: {
    id: string;
    name: string | null;
    specialization: UserSpecialization | null;
  } | null;
};

type TaskAssigneeItem = TaskModalAssigneeItem;

type TaskFormState = TaskModalFormState;

export default function DashboardPage() {
  const { visibleSections } = useDashboardPreferences();
  const hasVisibleSections = Object.values(visibleSections).some(Boolean);

  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskAssignees, setTaskAssignees] = useState<TaskAssigneeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const [teamManagers, setTeamManagers] = useState<TeamManagerItem[]>([]);
  const [teamForm, setTeamForm] = useState<{
    name: string;
    color: TeamColor;
    pmId: string;
  }>({
    name: "",
    color: TEAM_COLOR_OPTIONS[0],
    pmId: "",
  });
  const [taskForm, setTaskForm] = useState<TaskFormState>(createEmptyTaskForm());
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [teamsRes, tasksRes, assigneesRes] = await Promise.all([
        fetch("/api/teams", { cache: "no-store" }),
        fetch("/api/tasks", { cache: "no-store" }),
        fetch("/api/task-assignees", { cache: "no-store" }),
      ]);

      const teamsData = await teamsRes.json();
      const tasksData = await tasksRes.json();
      const assigneesData = await assigneesRes.json();

      if (!teamsRes.ok) {
        throw new Error(teamsData.error || "Не удалось загрузить команды");
      }

      if (!tasksRes.ok) {
        throw new Error(tasksData.error || "Не удалось загрузить задачи");
      }

      if (!assigneesRes.ok) {
        throw new Error(assigneesData.error || "Не удалось загрузить исполнителей");
      }

      setTeams(teamsData.teams ?? []);
      setTasks(tasksData.tasks ?? []);
      setTaskAssignees(assigneesData.users ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить рабочее пространство",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTeamManagers = useCallback(async () => {
    try {
      const res = await fetch("/api/team-managers", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setTeamManagers([]);
        return;
      }

      const managers = data.managers ?? [];
      setTeamManagers(managers);
      setTeamForm((current) => ({
        ...current,
        pmId: current.pmId || managers[0]?.id || "",
      }));
    } catch {
      setTeamManagers([]);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    void loadTeamManagers();
  }, [loadTeamManagers]);

  useEffect(() => {
    const openTeamModal = () => {
      setTeamForm({
        name: "",
        color: TEAM_COLOR_OPTIONS[0],
        pmId: teamManagers[0]?.id ?? "",
      });
      setIsCreateTeamOpen(true);
    };

    const openTaskModal = () => {
      if (teams.length === 0) {
        openTeamModal();
        return;
      }

      setEditingTask(null);
      setTaskForm(createEmptyTaskForm(teams[0]?.id));
      setIsTaskModalOpen(true);
    };

    const refreshWorkspace = () => {
      void loadWorkspace();
    };

    window.addEventListener("taska:create-team", openTeamModal);
    window.addEventListener("taska:create-task", openTaskModal);
    window.addEventListener("taska:workspace-updated", refreshWorkspace);

    return () => {
      window.removeEventListener("taska:create-team", openTeamModal);
      window.removeEventListener("taska:create-task", openTaskModal);
      window.removeEventListener("taska:workspace-updated", refreshWorkspace);
    };
  }, [loadWorkspace, teamManagers, teams]);

  const activeTasks = tasks.filter((task) => task.status !== "DONE");
  const reviewTasksCount = tasks.filter((task) => task.status === "REVIEW").length;
  const doneTasksCount = tasks.filter((task) => task.status === "DONE").length;
  const highPriorityCount = tasks.filter((task) => task.priority === "HIGH").length;
  const focusTasks = activeTasks.slice(0, 3);

  const handleCreateTeam = async () => {
    setSavingTeam(true);

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamForm),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Не удалось создать команду");
      }

      toast.success("Команда создана");
      setIsCreateTeamOpen(false);
      setTeamForm({
        name: "",
        color: TEAM_COLOR_OPTIONS[0],
        pmId: teamManagers[0]?.id ?? "",
      });
      setTaskForm((current) => ({
        ...current,
        teamId: current.teamId || result.team.id,
      }));
      window.dispatchEvent(new Event("taska:workspace-updated"));
    } catch (teamError) {
      toast.error(
        teamError instanceof Error
          ? teamError.message
          : "Не удалось создать команду",
      );
    } finally {
      setSavingTeam(false);
    }
  };

  const handleCreateTask = async () => {
    setSavingTask(true);

    try {
      const endpoint = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskForm),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Не удалось сохранить задачу");
      }

      toast.success(editingTask ? "Задача обновлена" : "Задача создана");
      setIsTaskModalOpen(false);
      setEditingTask(null);
      setTaskForm(createEmptyTaskForm(teams[0]?.id));
      window.dispatchEvent(new Event("taska:workspace-updated"));
    } catch (taskError) {
      toast.error(
        taskError instanceof Error
          ? taskError.message
          : "Не удалось сохранить задачу",
      );
    } finally {
      setSavingTask(false);
    }
  };

  const openTaskCreateModal = () => {
    if (teams.length === 0) {
      setIsCreateTeamOpen(true);
      return;
    }

    setEditingTask(null);
    setTaskForm(createEmptyTaskForm(teams[0]?.id));
    setIsTaskModalOpen(true);
  };

  return (
    <>
      <div className="space-y-8 p-4 md:p-6 xl:p-8">
        {!hasVisibleSections ? (
          <section className="rounded-[28px] border border-dashed border-border bg-card p-10 text-center shadow-sm">
            <div className="mx-auto max-w-xl">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <SlidersHorizontal size={22} />
              </div>
              <h1 className="mt-5 text-2xl font-semibold">
                Все блоки dashboard скрыты
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Включи нужные секции заново на странице настроек, чтобы собрать
                рабочее пространство под свой формат работы.
              </p>
              <Button
                as={Link}
                href="/dashboard/settings"
                color="primary"
                className="mt-6 rounded-xl"
              >
                Открыть настройки
              </Button>
            </div>
          </section>
        ) : null}

        {(visibleSections.overview || visibleSections.focus) && (
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            {visibleSections.overview ? (
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <ChartBar size={18} className="text-primary" />
                  <h2 className="font-semibold text-lg tracking-tight">Дашборд</h2>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-3xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Активных задач</p>
                    <p className="mt-2 text-3xl font-semibold">{activeTasks.length}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Всё, что ещё не переведено в готово
                    </p>
                  </div>
                  <div className="rounded-3xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Команд в работе</p>
                    <p className="mt-2 text-3xl font-semibold">{teams.length}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Начните с первой команды, если список пуст
                    </p>
                  </div>
                  <div className="rounded-3xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Закрыто задач</p>
                    <p className="mt-2 text-3xl font-semibold">{doneTasksCount}</p>
                    <p className="mt-2 text-sm text-primary">
                      Высокий приоритет сейчас у {highPriorityCount} задач
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {visibleSections.focus ? (
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <h2 className="font-semibold text-lg tracking-tight">
                    Фокус на сегодня
                  </h2>
                </div>

                <div className="mt-5 space-y-3">
                  {focusTasks.length > 0 ? (
                    focusTasks.map((task) => (
                      <div key={task.id} className="rounded-3xl bg-muted p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Команда: {task.team.name}
                            </p>
                          </div>
                          <Chip
                            variant="flat"
                            color={TASK_PRIORITY_COLORS[task.priority]}
                            className="rounded-xl"
                          >
                            {TASK_PRIORITY_LABELS[task.priority]}
                          </Chip>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl bg-muted p-4">
                      <p className="font-medium">Фокус появится после создания задач</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Добавьте первую команду и задачу, чтобы собрать рабочий
                        день прямо на дашборде.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        )}

        {(visibleSections.board ||
          visibleSections.projects ||
          visibleSections.insights) && (
          <section className="grid gap-4 2xl:grid-cols-[1.6fr_0.8fr]">
            {visibleSections.board ? (
              <div
                id="task-board"
                className="rounded-[28px] border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <Table size={18} className="text-primary" />
                    <h2 className="font-semibold text-lg tracking-tight">
                      Рабочее пространство задач
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      as={Link}
                      href="/dashboard/tasks"
                      variant="light"
                      className="rounded-xl"
                      startContent={<Table size={16} />}
                    >
                      Список задач
                    </Button>
                    <Button
                      color="primary"
                      className="rounded-xl"
                      startContent={<Plus size={16} />}
                      onPress={openTaskCreateModal}
                    >
                      Новая задача
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
                    <LoaderCircle className="mx-auto animate-spin text-primary" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Загружаем команды и задачи...
                    </p>
                  </div>
                ) : error ? (
                  <div className="mt-6 rounded-[26px] border border-dashed border-danger/30 bg-danger/5 p-8 text-center">
                    <p className="text-base font-medium">{error}</p>
                    <Button
                      variant="light"
                      className="mt-4 rounded-xl"
                      onPress={() => void loadWorkspace()}
                    >
                      Повторить загрузку
                    </Button>
                  </div>
                ) : teams.length === 0 ? (
                  <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
                    <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Users size={22} />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">
                      Пока здесь пусто
                    </h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                      Создайте свою первую команду, чтобы открыть отдельное
                      пространство задач и собирать аналитику на dashboard.
                    </p>
                    <Button
                      color="primary"
                      className="mt-5 rounded-xl"
                      startContent={<Plus size={16} />}
                      onPress={() => setIsCreateTeamOpen(true)}
                    >
                      Создать первую команду
                    </Button>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
                    <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Flag size={22} />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">
                      Задач пока нет
                    </h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                      Команда уже готова. Добавьте первую задачу, а дальше
                      работайте с ней в отдельной странице `Задачи`.
                    </p>
                    <Button
                      color="primary"
                      className="mt-5 rounded-xl"
                      startContent={<Plus size={16} />}
                      onPress={openTaskCreateModal}
                    >
                      Создать первую задачу
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">Всего задач</p>
                        <p className="mt-2 text-3xl font-semibold">{tasks.length}</p>
                      </div>
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">Активно сейчас</p>
                        <p className="mt-2 text-3xl font-semibold">{activeTasks.length}</p>
                      </div>
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">На проверке</p>
                        <p className="mt-2 text-3xl font-semibold">{reviewTasksCount}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {(visibleSections.projects || visibleSections.insights) && (
              <div className="space-y-4">
                {visibleSections.projects ? (
                  <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-primary" />
                      <h2 className="text-lg font-semibold">Команды</h2>
                    </div>

                    <div className="mt-5 space-y-4">
                      {teams.length > 0 ? (
                        teams.map((team) => (
                          <div key={team.id} className="rounded-3xl bg-muted p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: team.color }}
                                />
                                <div>
                                  <p className="font-medium">{team.name}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {team.tasksCount} задач, {team.membersCount}{" "}
                                    участников
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-semibold">
                                {team.tasksCount}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-3xl bg-muted p-4">
                          <p className="font-medium">Команд пока нет</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Создайте первую команду, чтобы начать распределять
                            задачи и доступы.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                ) : null}

                {visibleSections.insights ? (
                  <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <ChartPie size={18} className="text-primary" />
                      <h2 className="font-semibold text-lg tracking-tight">
                        Быстрые инсайты
                      </h2>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          На проверке сейчас
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {reviewTasksCount} задач
                        </p>
                      </div>
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          Высокий приоритет
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {highPriorityCount} задач
                        </p>
                      </div>
                      <div className="rounded-3xl bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          Уже закрыто
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {doneTasksCount} задач
                        </p>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>
            )}
          </section>
        )}
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
                  value={teamForm.name}
                  onValueChange={(value) =>
                    setTeamForm((current) => ({ ...current, name: value }))
                  }
                />

                <div>
                  <p className="mb-2 text-sm font-medium">Цвет команды</p>
                  <div className="flex flex-wrap gap-3">
                    {TEAM_COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-10 w-10 rounded-full border-2 transition ${
                          teamForm.color === color
                            ? "border-foreground scale-105"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setTeamForm((current) => ({ ...current, color }))
                        }
                        aria-label={`Выбрать цвет ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">PM команды</p>
                  <UnifiedSelect
                    selectedKeys={teamForm.pmId ? [teamForm.pmId] : []}
                    onChange={(event) =>
                      setTeamForm((current) => ({
                        ...current,
                        pmId: event.target.value,
                      }))
                    }
                    placeholder="Выберите PM"
                  >
                    {teamManagers.map((manager) => (
                      <UnifiedSelectItem key={manager.id}>
                        {manager.name || manager.email || "Без имени"}
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
                  isDisabled={!teamForm.pmId}
                  onPress={() => void handleCreateTeam()}
                >
                  Создать команду
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <TaskEditorModal
        isOpen={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        isEditing={Boolean(editingTask)}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        teams={teams.map((team) => ({ id: team.id, name: team.name }))}
        taskAssignees={taskAssignees}
        isSaving={savingTask}
        onSubmit={handleCreateTask}
      />
    </>
  );
}