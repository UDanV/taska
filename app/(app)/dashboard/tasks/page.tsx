"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Flag,
  LoaderCircle,
  MoreHorizontal,
  PenSquare,
  Plus,
  Search,
  Table,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from "@heroui/react";
import { toast } from "sonner";
import {
  USER_SPECIALIZATION_LABELS,
  USER_SPECIALIZATIONS,
  type UserSpecialization,
} from "@/app/lib/auth/roles";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TEAM_COLOR_OPTIONS,
  type TaskPriority,
  type TaskStatus,
} from "@/app/lib/workspace/constants";

type TeamColor = (typeof TEAM_COLOR_OPTIONS)[number];
type TaskViewMode = "list" | "kanban" | "scrum" | "calendar";

type TeamItem = {
  id: string;
  name: string;
  color: string;
  membersCount: number;
  tasksCount: number;
};

type TaskAssigneeItem = {
  id: string;
  name: string | null;
  email: string | null;
  specialization: UserSpecialization;
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

type TaskFormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  specialization: UserSpecialization | "";
  teamId: string;
  assigneeId: string;
};

const viewOptions: Array<{
  id: TaskViewMode;
  label: string;
  icon: typeof Table;
}> = [
    { id: "list", label: "Список", icon: Table },
    { id: "kanban", label: "Канбан", icon: Columns3 },
    { id: "scrum", label: "Скрам", icon: Flag },
    { id: "calendar", label: "Календарь", icon: Calendar },
  ];

function getEmptyTaskForm(teamId?: string): TaskFormState {
  return {
    title: "",
    description: "",
    status: "TODO" as TaskStatus,
    priority: "MEDIUM" as TaskPriority,
    specialization: "",
    teamId: teamId ?? "",
    assigneeId: "",
  };
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function isSameMonth(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  );
}

function getMonthLabel(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function addDays(base: Date, amount: number) {
  const next = new Date(base);
  next.setDate(base.getDate() + amount);
  return next;
}

export default function TasksPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskAssignees, setTaskAssignees] = useState<TaskAssigneeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<TaskViewMode>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const [teamForm, setTeamForm] = useState<{ name: string; color: TeamColor }>({
    name: "",
    color: TEAM_COLOR_OPTIONS[0],
  });
  const [taskForm, setTaskForm] = useState<TaskFormState>(getEmptyTaskForm());
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

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

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    const openTeamModal = () => {
      setTeamForm({ name: "", color: TEAM_COLOR_OPTIONS[0] });
      setIsCreateTeamOpen(true);
    };

    const openTaskModal = () => {
      if (teams.length === 0) {
        openTeamModal();
        return;
      }

      setEditingTask(null);
      setTaskForm(getEmptyTaskForm(teams[0]?.id));
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
  }, [loadWorkspace, teams]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (teamFilter !== "all" && task.team.id !== teamFilter) {
          return false;
        }

        if (statusFilter !== "ALL" && task.status !== statusFilter) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return [
          task.title,
          task.description ?? "",
          task.team.name,
          task.assignee?.name ?? "",
          task.specialization
            ? USER_SPECIALIZATION_LABELS[task.specialization]
            : "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      );
  }, [searchQuery, statusFilter, tasks, teamFilter]);

  const boardColumns = useMemo(
    () =>
      TASK_STATUSES.map((status) => ({
        id: status,
        title: TASK_STATUS_LABELS[status],
        tasks: filteredTasks.filter((task) => task.status === status),
      })),
    [filteredTasks],
  );

  const scrumColumns = useMemo(
    () => [
      {
        id: "backlog",
        title: "Бэклог",
        description: "Идеи и задачи, которые ждут следующего спринта.",
        tasks: filteredTasks.filter((task) => task.status === "TODO"),
      },
      {
        id: "sprint",
        title: "Текущий спринт",
        description: "В работе и на проверке прямо сейчас.",
        tasks: filteredTasks.filter(
          (task) => task.status === "IN_PROGRESS" || task.status === "REVIEW",
        ),
      },
      {
        id: "increment",
        title: "Инкремент",
        description: "Уже завершённые и готовые задачи.",
        tasks: filteredTasks.filter((task) => task.status === "DONE"),
      },
    ],
    [filteredTasks],
  );

  const compatibleAssignees = useMemo(() => {
    if (!taskForm.specialization) {
      return [];
    }

    return taskAssignees.filter(
      (assignee) => assignee.specialization === taskForm.specialization,
    );
  }, [taskAssignees, taskForm.specialization]);

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, TaskItem[]>();

    filteredTasks.forEach((task) => {
      const key = getDateKey(task.updatedAt);
      const bucket = grouped.get(key);

      if (bucket) {
        bucket.push(task);
        return;
      }

      grouped.set(key, [task]);
    });

    return grouped;
  }, [filteredTasks]);

  const calendarDays = useMemo(() => {
    const monthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const gridStart = addDays(monthStart, -firstWeekday);

    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(gridStart, index);
      return {
        date,
        key: getDateKey(date),
        inCurrentMonth: isSameMonth(date, calendarDate),
        tasks: tasksByDate.get(getDateKey(date)) ?? [],
      };
    });
  }, [calendarDate, tasksByDate]);

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
      setTeamForm({ name: "", color: TEAM_COLOR_OPTIONS[0] });
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
      setTaskForm(getEmptyTaskForm(teams[0]?.id));
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

  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      specialization: task.specialization ?? "",
      teamId: task.team.id,
      assigneeId: task.assignee?.id ?? "",
    });
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm("Удалить эту задачу?");

    if (!confirmed) {
      return;
    }

    setDeletingTaskId(taskId);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Не удалось удалить задачу");
      }

      toast.success("Задача удалена");
      window.dispatchEvent(new Event("taska:workspace-updated"));
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Не удалось удалить задачу",
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  const openTaskCreateModal = () => {
    if (teams.length === 0) {
      setIsCreateTeamOpen(true);
      return;
    }

    setEditingTask(null);
    setTaskForm(getEmptyTaskForm(teams[0]?.id));
    setIsTaskModalOpen(true);
  };

  const emptyStateTitle =
    filteredTasks.length === 0 && tasks.length > 0
      ? "По текущим фильтрам ничего не найдено"
      : "Задач пока нет";

  const emptyStateDescription =
    filteredTasks.length === 0 && tasks.length > 0
      ? "Попробуйте сбросить фильтры или выбрать другой формат отображения."
      : "Добавьте первую задачу, и она сразу появится в списке, на доске и в календаре.";

  const renderTaskCard = (
    task: TaskItem,
    options?: { compact?: boolean; actionMode?: "inline" | "dropdown" | "hidden" },
  ) => {
    const compact = options?.compact ?? false;
    const actionMode = options?.actionMode ?? "inline";

    return (
    <article
      key={task.id}
      className={`rounded-3xl border border-border bg-background shadow-sm ${compact ? "p-3" : "p-4"
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: task.team.color }}
            />
            <p className="truncate text-sm text-muted-foreground">{task.team.name}</p>
          </div>

          <p className={`mt-2 font-medium ${compact ? "text-sm" : ""}`}>{task.title}</p>

          {task.description ? (
            <p
              className={`mt-2 text-muted-foreground ${compact ? "line-clamp-2 text-xs" : "text-sm leading-6"}`}
            >
              {task.description}
            </p>
          ) : null}
        </div>

        {actionMode === "inline" ? (
          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="rounded-xl"
              onPress={() => handleEditTask(task)}
            >
              <PenSquare size={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              className="rounded-xl"
              isLoading={deletingTaskId === task.id}
              onPress={() => void handleDeleteTask(task.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ) : null}

        {actionMode === "dropdown" ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="rounded-xl"
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label={`Действия для задачи ${task.title}`}>
              <DropdownItem
                key="edit"
                startContent={<PenSquare size={16} />}
                onPress={() => handleEditTask(task)}
              >
                Редактировать
              </DropdownItem>
              <DropdownItem
                key="delete"
                color="danger"
                className="text-danger"
                startContent={<Trash2 size={16} />}
                onPress={() => void handleDeleteTask(task.id)}
              >
                Удалить
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : null}
      </div>

      <div
        className={`mt-4 flex flex-wrap items-center gap-2 ${compact ? "" : "justify-between"}`}
      >
        <Chip
          color={TASK_PRIORITY_COLORS[task.priority]}
          variant="flat"
          className="rounded-xl"
        >
          {TASK_PRIORITY_LABELS[task.priority]}
        </Chip>
        <Chip variant="flat" className="rounded-xl">
          {TASK_STATUS_LABELS[task.status]}
        </Chip>
        <Chip variant="flat" className="rounded-xl">
          {task.specialization
            ? USER_SPECIALIZATION_LABELS[task.specialization]
            : "Без метки"}
        </Chip>
        {task.assignee?.name ? (
          <span className="text-xs text-muted-foreground">
            Исполнитель: {task.assignee.name}
          </span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          Обновлено {formatUpdatedAt(task.updatedAt)}
        </span>
      </div>
    </article>
    );
  };

  return (
    <>
      <div className="space-y-8 p-4 md:p-6 xl:p-8">
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Table size={18} className="text-primary" />
                <h1 className="text-xl font-semibold tracking-tight">Мои задачи</h1>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Выбирайте удобный формат работы: список, канбан, scrum или
                календарь. Все режимы работают с одним и тем же набором задач.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="light"
                className="rounded-xl"
                startContent={<Users size={16} />}
                onPress={() => setIsCreateTeamOpen(true)}
              >
                Новая команда
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

          <div className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_220px_220px]">
            <Input
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Поиск по названию, описанию, команде, метке или исполнителю"
              startContent={<Search size={16} className="text-muted-foreground" />}
              classNames={{
                inputWrapper: "h-11 rounded-xl border border-border bg-background shadow-none",
              }}
            />

            <select
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
            >
              <option value="all">Все команды</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <select
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "ALL" | TaskStatus)}
            >
              <option value="ALL">Все статусы</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {viewOptions.map((option) => {
              const Icon = option.icon;
              const isActive = viewMode === option.id;

              return (
                <Button
                  key={option.id}
                  variant={isActive ? "solid" : "light"}
                  color={isActive ? "primary" : "default"}
                  className="rounded-xl"
                  startContent={<Icon size={16} />}
                  onPress={() => setViewMode(option.id)}
                >
                  {option.label}
                </Button>
              );
            })}
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
              <h3 className="mt-4 text-xl font-semibold">Пока нет команд</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Создайте первую команду, чтобы открыть рабочее пространство задач
                и переключаться между всеми форматами отображения.
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
          ) : filteredTasks.length === 0 ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Flag size={22} />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{emptyStateTitle}</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {emptyStateDescription}
              </p>
              {tasks.length === 0 ? (
                <Button
                  color="primary"
                  className="mt-5 rounded-xl"
                  startContent={<Plus size={16} />}
                  onPress={openTaskCreateModal}
                >
                  Создать первую задачу
                </Button>
              ) : (
                <Button
                  variant="light"
                  className="mt-5 rounded-xl"
                  onPress={() => {
                    setSearchQuery("");
                    setTeamFilter("all");
                    setStatusFilter("ALL");
                  }}
                >
                  Сбросить фильтры
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-6">
              {viewMode === "list" ? (
                <div className="space-y-3">
                  {filteredTasks.map((task) => renderTaskCard(task))}
                </div>
              ) : null}

              {viewMode === "kanban" ? (
                <div className="grid gap-4 xl:grid-cols-4">
                  {boardColumns.map((column) => (
                    <div key={column.id} className="rounded-[26px] bg-muted p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{column.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {column.tasks.length} карточек
                          </p>
                        </div>
                        <Chip variant="flat" className="rounded-xl">
                          {column.tasks.length}
                        </Chip>
                      </div>

                      <div className="mt-4 space-y-3">
                        {column.tasks.length > 0 ? (
                          column.tasks.map((task) =>
                            renderTaskCard(task, { actionMode: "dropdown" }),
                          )
                        ) : (
                          <div className="rounded-3xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
                            В этой колонке пока нет задач.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {viewMode === "scrum" ? (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-3xl bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Бэклог</p>
                      <p className="mt-2 text-3xl font-semibold">
                        {scrumColumns[0].tasks.length}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Всё, что готовится к следующему спринту.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Активный спринт</p>
                      <p className="mt-2 text-3xl font-semibold">
                        {scrumColumns[1].tasks.length}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Задачи в работе и на проверке.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Инкремент</p>
                      <p className="mt-2 text-3xl font-semibold">
                        {scrumColumns[2].tasks.length}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Уже завершённые результаты спринта.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-3">
                    {scrumColumns.map((column) => (
                      <div key={column.id} className="rounded-[26px] bg-muted p-4">
                        <div>
                          <h3 className="font-semibold">{column.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {column.description}
                          </p>
                        </div>

                        <div className="mt-4 space-y-3">
                          {column.tasks.length > 0 ? (
                            column.tasks.map((task) => renderTaskCard(task))
                          ) : (
                            <div className="rounded-3xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
                              Пока без задач.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {viewMode === "calendar" ? (
                <div className="rounded-[26px] border border-border bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {getMonthLabel(calendarDate)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Календарь построен по дате последнего обновления задач.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        variant="light"
                        className="rounded-xl"
                        onPress={() =>
                          setCalendarDate(
                            (current) =>
                              new Date(current.getFullYear(), current.getMonth() - 1, 1),
                          )
                        }
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="light"
                        className="rounded-xl"
                        onPress={() => setCalendarDate(new Date())}
                      >
                        Сегодня
                      </Button>
                      <Button
                        isIconOnly
                        variant="light"
                        className="rounded-xl"
                        onPress={() =>
                          setCalendarDate(
                            (current) =>
                              new Date(current.getFullYear(), current.getMonth() + 1, 1),
                          )
                        }
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                      <div key={day} className="rounded-2xl px-2 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-7">
                    {calendarDays.map((day) => (
                      <div
                        key={day.key}
                        className={`rounded-3xl border p-3 ${day.inCurrentMonth
                          ? "border-border bg-background"
                          : "border-transparent bg-background/50"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm font-medium ${day.inCurrentMonth ? "text-foreground" : "text-muted-foreground"
                              }`}
                          >
                            {day.date.getDate()}
                          </span>
                          {day.tasks.length > 0 ? (
                            <Chip size="sm" variant="flat" className="rounded-xl">
                              {day.tasks.length}
                            </Chip>
                          ) : null}
                        </div>

                        <div className="mt-3 space-y-2">
                          {day.tasks
                            .slice(0, 3)
                            .map((task) =>
                              renderTaskCard(task, {
                                compact: true,
                                actionMode: "hidden",
                              }),
                            )}
                          {day.tasks.length > 3 ? (
                            <div className="rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                              Ещё {day.tasks.length - 3} задач
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
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
                        className={`h-10 w-10 rounded-full border-2 transition ${teamForm.color === color
                          ? "scale-105 border-foreground"
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
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="rounded-xl" onPress={onClose}>
                  Отмена
                </Button>
                <Button
                  color="primary"
                  className="rounded-xl"
                  isLoading={savingTeam}
                  onPress={() => void handleCreateTeam()}
                >
                  Создать команду
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <ModalContent className="rounded-[28px]">
          {(onClose) => (
            <>
              <ModalHeader>
                {editingTask ? "Редактировать задачу" : "Новая задача"}
              </ModalHeader>
              <ModalBody className="space-y-4 pb-2">
                <Input
                  label="Название"
                  labelPlacement="outside"
                  placeholder="Что нужно сделать?"
                  value={taskForm.title}
                  onValueChange={(value) =>
                    setTaskForm((current) => ({ ...current, title: value }))
                  }
                />

                <div>
                  <p className="mb-2 text-sm font-medium">Описание</p>
                  <Textarea
                    placeholder="Коротко опишите задачу"
                    value={taskForm.description}
                    onValueChange={(value) =>
                      setTaskForm((current) => ({
                        ...current,
                        description: value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="mb-2 text-sm font-medium">Команда</p>
                    <Select
                      className="h-11 w-full rounded-xl border border-border px-3 text-sm outline-none transition focus:border-primary"
                      value={taskForm.teamId}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          teamId: event.target.value,
                        }))
                      }
                    >
                      {teams.map((team) => (
                        <SelectItem key={team.id}>{team.name}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Статус</p>
                    <Select
                      className="h-11 w-full rounded-xl border border-border px-3 text-sm outline-none transition focus:border-primary"
                      value={taskForm.status}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          status: event.target.value as TaskStatus,
                        }))
                      }
                    >
                      {TASK_STATUSES.map((status) => (
                        <SelectItem key={status}>{TASK_STATUS_LABELS[status] as TaskStatus}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Приоритет</p>
                    <Select
                      className="h-11 w-full rounded-xl border border-border px-3 text-sm outline-none transition focus:border-primary"
                      value={taskForm.priority}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          priority: event.target.value as TaskPriority,
                        }))
                      }
                    >
                      {TASK_PRIORITIES.map((priority) => (
                        <SelectItem key={priority}>{TASK_PRIORITY_LABELS[priority as TaskPriority]}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium">Метка задачи</p>
                    <Select
                      className="h-11 w-full rounded-xl border border-border px-3 text-sm outline-none transition focus:border-primary"
                      value={taskForm.specialization}
                      placeholder="Выберите специализацию"
                      onChange={(event) => {
                        const nextSpecialization = event.target.value as
                          | UserSpecialization
                          | "";

                        setTaskForm((current) => {
                          const nextAssignee = taskAssignees.find(
                            (assignee: TaskAssigneeItem) =>
                              assignee.id === current.assigneeId,
                          );

                          return {
                            ...current,
                            specialization: nextSpecialization,
                            assigneeId:
                              nextAssignee?.specialization === nextSpecialization
                                ? current.assigneeId
                                : "",
                          };
                        });
                      }}
                    >
                      {USER_SPECIALIZATIONS.map((specialization) => (
                        <SelectItem key={specialization}>
                          {USER_SPECIALIZATION_LABELS[specialization]}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Исполнитель</p>
                    <Select
                      className="h-11 w-full rounded-xl border border-border px-3 text-sm outline-none transition focus:border-primary"
                      value={taskForm.assigneeId}
                      placeholder={
                        taskForm.specialization
                          ? "Выберите исполнителя"
                          : "Сначала выберите метку"
                      }
                      isDisabled={!taskForm.specialization}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          assigneeId: event.target.value,
                        }))
                      }
                    >
                      {compatibleAssignees.map((assignee: TaskAssigneeItem) => (
                        <SelectItem key={assignee.id}>
                          {assignee.name || assignee.email || "Без имени"}
                        </SelectItem>
                      ))}
                    </Select>
                    {taskForm.specialization ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Доступны только пользователи с меткой{" "}
                        {USER_SPECIALIZATION_LABELS[
                          taskForm.specialization as UserSpecialization
                        ]}
                        .
                      </p>
                    ) : null}
                    {taskForm.assigneeId ? (
                      <Button
                        variant="light"
                        className="mt-2 h-8 rounded-xl px-3 text-xs"
                        onPress={() =>
                          setTaskForm((current) => ({
                            ...current,
                            assigneeId: "",
                          }))
                        }
                      >
                        Снять исполнителя
                      </Button>
                    ) : null}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="rounded-xl" onPress={onClose}>
                  Отмена
                </Button>
                <Button
                  color="primary"
                  className="rounded-xl"
                  isLoading={savingTask}
                  onPress={() => void handleCreateTask()}
                >
                  {editingTask ? "Сохранить изменения" : "Создать задачу"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
