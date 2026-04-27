"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Flag,
  ImagePlus,
  LoaderCircle,
  MoreHorizontal,
  PenSquare,
  Plus,
  Search,
  Table,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import {
  Checkbox,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { toast } from "sonner";
import {
  hasCapability,
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
import TaskEditorModal, {
  createEmptyTaskForm,
  type TaskModalAssigneeItem,
  type TaskModalFormState,
} from "@/app/feature/tasks/task-editor-modal";
import { UnifiedSelect, UnifiedSelectItem } from "@/app/feature/tasks/ui/unified-select";

type TeamColor = (typeof TEAM_COLOR_OPTIONS)[number];
type TaskViewMode = "list" | "kanban" | "scrum" | "calendar";

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

type TaskAssigneeItem = TaskModalAssigneeItem;

type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  photos: string[];
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

type TaskCommentItem = {
  id: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

type TaskFormState = TaskModalFormState;

type TaskPatchPayload = Partial<{
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  specialization: UserSpecialization;
  teamId: string;
  assigneeId: string | null;
  photos: string[];
}>;

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

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCommentAt(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Не удалось прочитать файл"));
    };

    reader.onerror = () => {
      reject(new Error("Не удалось прочитать файл"));
    };

    reader.readAsDataURL(file);
  });
}

export default function TasksPage() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskAssignees, setTaskAssignees] = useState<TaskAssigneeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<TaskViewMode>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [specializationFilter, setSpecializationFilter] = useState<
    "ALL" | UserSpecialization
  >("ALL");
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [taskComments, setTaskComments] = useState<TaskCommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [postingComment, setPostingComment] = useState(false);

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
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const canManageTasks = hasCapability(session?.user?.role, "canManageTasks");
  const currentUserId = session?.user?.id ?? null;

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
      setTasks(
        (tasksData.tasks ?? []).map((task: TaskItem) => ({
          ...task,
          photos: Array.isArray(task.photos) ? task.photos : [],
        })),
      );
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
    if (!isTaskDrawerOpen || !selectedTaskId) {
      setTaskComments([]);
      setCommentDraft("");
      return;
    }

    let cancelled = false;
    setCommentsLoading(true);

    void (async () => {
      try {
        const res = await fetch(`/api/tasks/${selectedTaskId}/comments`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (cancelled) {
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "Не удалось загрузить комментарии");
        }

        setTaskComments(data.comments ?? []);
      } catch (loadCommentsError) {
        if (!cancelled) {
          setTaskComments([]);
          toast.error(
            loadCommentsError instanceof Error
              ? loadCommentsError.message
              : "Не удалось загрузить комментарии",
          );
        }
      } finally {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isTaskDrawerOpen, selectedTaskId]);

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

        if (
          specializationFilter !== "ALL" &&
          task.specialization !== specializationFilter
        ) {
          return false;
        }

        if (assignedToMeOnly) {
          return task.assignee?.id === currentUserId;
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
  }, [
    assignedToMeOnly,
    currentUserId,
    searchQuery,
    specializationFilter,
    statusFilter,
    tasks,
    teamFilter,
  ]);

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

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );

  const patchTask = useCallback(async (taskId: string, payload: TaskPatchPayload) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Не удалось обновить задачу");
    }

    return {
      ...result.task,
      photos: Array.isArray(result.task?.photos) ? result.task.photos : [],
    } as TaskItem;
  }, []);

  const upsertTask = useCallback((nextTask: TaskItem) => {
    setTasks((current) =>
      current.map((task) => (task.id === nextTask.id ? nextTask : task)),
    );
  }, []);

  const handleOpenTaskDrawer = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDrawerOpen(true);
  }, []);

  const handleTaskStatusDrop = useCallback(
    async (taskId: string, status: TaskStatus) => {
      const sourceTask = tasks.find((task) => task.id === taskId);

      if (!sourceTask || sourceTask.status === status) {
        return;
      }

      if (
        !canManageTasks &&
        (sourceTask.assignee?.id !== currentUserId ||
          (status !== "REVIEW" && status !== "DONE"))
      ) {
        toast.error("Вы можете переводить только свои задачи в 'На проверке' или 'Готово'");
        return;
      }

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task,
        ),
      );

      try {
        const updatedTask = await patchTask(taskId, { status });
        upsertTask(updatedTask);
      } catch (statusError) {
        setTasks((current) =>
          current.map((task) =>
            task.id === taskId ? { ...task, status: sourceTask.status } : task,
          ),
        );
        toast.error(
          statusError instanceof Error
            ? statusError.message
            : "Не удалось переместить задачу",
        );
      }
    },
    [canManageTasks, currentUserId, patchTask, tasks, upsertTask],
  );

  const handleTaskPhotoUpload = useCallback(
    async (files: FileList | null) => {
      if (!selectedTask || !files) {
        return;
      }

      const allFiles = Array.from(files);
      const imageFiles = allFiles.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length !== allFiles.length) {
        toast.error("Можно загружать только фотографии");
        return;
      }

      const currentPhotos = selectedTask.photos ?? [];
      const maxPhotos = 8;
      const remainingSlots = maxPhotos - currentPhotos.length;

      if (remainingSlots <= 0) {
        toast.error("Для задачи уже загружено максимальное количество фото");
        return;
      }

      const filesToUpload = imageFiles.slice(0, remainingSlots);

      if (filesToUpload.length < imageFiles.length) {
        toast.info(`Добавлено ${filesToUpload.length} из ${imageFiles.length} фото`);
      }

      setSavingPhotos(true);

      try {
        const uploadedPhotos = await Promise.all(filesToUpload.map(fileToDataUrl));
        const nextPhotos = [...currentPhotos, ...uploadedPhotos];
        const updatedTask = await patchTask(selectedTask.id, { photos: nextPhotos });

        upsertTask(updatedTask);
        toast.success("Фотографии загружены");
      } catch (photoError) {
        toast.error(
          photoError instanceof Error
            ? photoError.message
            : "Не удалось загрузить фотографии",
        );
      } finally {
        setSavingPhotos(false);
      }
    },
    [patchTask, selectedTask, upsertTask],
  );

  const handleRemoveTaskPhoto = useCallback(
    async (index: number) => {
      if (!selectedTask) {
        return;
      }

      const nextPhotos = selectedTask.photos.filter((_, photoIndex) => photoIndex !== index);
      setSavingPhotos(true);

      try {
        const updatedTask = await patchTask(selectedTask.id, { photos: nextPhotos });
        upsertTask(updatedTask);
      } catch (removeError) {
        toast.error(
          removeError instanceof Error
            ? removeError.message
            : "Не удалось удалить фотографию",
        );
      } finally {
        setSavingPhotos(false);
      }
    },
    [patchTask, selectedTask, upsertTask],
  );

  const handleAddComment = useCallback(async () => {
    if (!selectedTask) {
      return;
    }

    const text = commentDraft.trim();

    if (!text) {
      return;
    }

    setPostingComment(true);

    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Не удалось отправить комментарий");
      }

      setTaskComments((current) => [...current, data.comment as TaskCommentItem]);
      setCommentDraft("");
      toast.success("Комментарий добавлен");
    } catch (commentError) {
      toast.error(
        commentError instanceof Error
          ? commentError.message
          : "Не удалось отправить комментарий",
      );
    } finally {
      setPostingComment(false);
    }
  }, [commentDraft, selectedTask]);

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

  const handleEditTask = (task: TaskItem) => {
    setIsTaskDrawerOpen(false);
    setSelectedTaskId(null);
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      specialization: task.specialization ?? "",
      teamId: task.team.id,
      assigneeId: task.assignee?.id ?? "",
      photos: task.photos ?? [],
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
      if (selectedTaskId === taskId) {
        setIsTaskDrawerOpen(false);
        setSelectedTaskId(null);
      }
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
    setTaskForm(createEmptyTaskForm(teams[0]?.id));
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
    options?: {
      compact?: boolean;
      actionMode?: "inline" | "dropdown" | "hidden";
      draggable?: boolean;
      onDragStart?: (taskId: string) => void;
      onDragEnd?: () => void;
    },
  ) => {
    const compact = options?.compact ?? false;
    const actionMode = options?.actionMode ?? "inline";
    const isDraggable = options?.draggable ?? false;

    return (
    <article
      key={task.id}
      className={`rounded-3xl border border-border bg-background shadow-sm transition hover:border-primary/40 hover:shadow-md ${compact ? "p-3" : "p-4"
        } ${isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      onClick={() => handleOpenTaskDrawer(task.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenTaskDrawer(task.id);
        }
      }}
      role="button"
      tabIndex={0}
      draggable={isDraggable}
      onDragStart={(event) => {
        if (!isDraggable) {
          return;
        }

        event.dataTransfer.setData("text/plain", task.id);
        event.dataTransfer.effectAllowed = "move";
        options?.onDragStart?.(task.id);
      }}
      onDragEnd={() => {
        options?.onDragEnd?.();
      }}
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
          <div
            className="flex items-center gap-1"
            onClick={(event) => event.stopPropagation()}
          >
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
          <div onClick={(event) => event.stopPropagation()}>
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
          </div>
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
            <div className="flex flex-wrap gap-2">
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

          <div className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_220px_220px_220px_auto]">
            <Input
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Поиск по названию, описанию, команде, метке или исполнителю"
              startContent={<Search size={16} className="text-muted-foreground" />}
              classNames={{
                inputWrapper: "h-11 rounded-xl border border-border bg-background shadow-none",
              }}
            />

            <UnifiedSelect
              aria-label="Фильтр по команде"
              selectedKeys={[teamFilter]}
              onChange={(event) => setTeamFilter(event.target.value)}
              items={[
                { id: "all", label: "Все команды" },
                ...teams.map((team) => ({ id: team.id, label: team.name })),
              ]}
            >
              {(item: { id: string; label: string }) => (
                <UnifiedSelectItem key={item.id}>{item.label}</UnifiedSelectItem>
              )}
            </UnifiedSelect>

            <UnifiedSelect
              aria-label="Фильтр по статусу"
              selectedKeys={[statusFilter]}
              onChange={(event) =>
                setStatusFilter((event.target.value || "ALL") as "ALL" | TaskStatus)
              }
              items={[
                { id: "ALL", label: "Все статусы" },
                ...TASK_STATUSES.map((status) => ({
                  id: status,
                  label: TASK_STATUS_LABELS[status],
                })),
              ]}
            >
              {(item: { id: string; label: string }) => (
                <UnifiedSelectItem key={item.id}>{item.label}</UnifiedSelectItem>
              )}
            </UnifiedSelect>

            <UnifiedSelect
              aria-label="Фильтр по специализации"
              selectedKeys={[specializationFilter]}
              onChange={(event) =>
                setSpecializationFilter(
                  (event.target.value || "ALL") as "ALL" | UserSpecialization,
                )
              }
              items={[
                { id: "ALL", label: "Все метки" },
                ...USER_SPECIALIZATIONS.map((specialization) => ({
                  id: specialization,
                  label: USER_SPECIALIZATION_LABELS[specialization],
                })),
              ]}
            >
              {(item: { id: string; label: string }) => (
                <UnifiedSelectItem key={item.id}>{item.label}</UnifiedSelectItem>
              )}
            </UnifiedSelect>

            <div className="flex items-center px-1">
              <Checkbox
                isSelected={assignedToMeOnly}
                onValueChange={setAssignedToMeOnly}
                classNames={{
                  label: "text-sm text-foreground",
                }}
              >
                Назначенные мне
              </Checkbox>
            </div>
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
                    setSpecializationFilter("ALL");
                    setAssignedToMeOnly(false);
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
                    <div
                      key={column.id}
                      className={`rounded-[26px] p-4 transition ${dragOverStatus === column.id ? "bg-primary/10 ring-1 ring-primary/40" : "bg-muted"
                        }`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverStatus(column.id);
                      }}
                      onDragLeave={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                          setDragOverStatus(null);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const taskId = event.dataTransfer.getData("text/plain");
                        setDragOverStatus(null);

                        if (taskId) {
                          void handleTaskStatusDrop(taskId, column.id);
                        }
                      }}
                    >
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
                            renderTaskCard(task, {
                              actionMode: "dropdown",
                              draggable:
                                canManageTasks || task.assignee?.id === currentUserId,
                              onDragStart: (taskId) => setDraggingTaskId(taskId),
                              onDragEnd: () => {
                                setDraggingTaskId(null);
                                setDragOverStatus(null);
                              },
                            }),
                          )
                        ) : (
                          <div
                            className={`rounded-3xl border border-dashed p-4 text-sm text-muted-foreground ${draggingTaskId ? "border-primary/40 bg-primary/5" : "border-border bg-background/70"
                              }`}
                          >
                            {draggingTaskId
                              ? "Перетащите задачу в эту колонку"
                              : "В этой колонке пока нет задач."}
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

      <Drawer
        isOpen={isTaskDrawerOpen}
        onOpenChange={(open) => {
          setIsTaskDrawerOpen(open);
          if (!open) {
            setSelectedTaskId(null);
          }
        }}
        placement="right"
        size="lg"
      >
        <DrawerContent>
          <DrawerHeader className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Детали задачи
            </p>
            <h3 className="text-lg font-semibold">
              {selectedTask?.title ?? "Задача не найдена"}
            </h3>
          </DrawerHeader>
          <DrawerBody>
            {selectedTask ? (
              <div className="space-y-5 pb-6">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Описание
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    {selectedTask.description || "Описание пока не добавлено"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Исполнитель
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {selectedTask.assignee?.name || "Не назначен"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Статус
                    </p>
                    <Chip variant="flat" className="mt-2 rounded-xl">
                      {TASK_STATUS_LABELS[selectedTask.status]}
                    </Chip>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Медиа
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Можно загрузить только фотографии (до 8 штук).
                      </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm transition hover:bg-muted">
                      <ImagePlus size={16} />
                      {savingPhotos ? "Сохраняем..." : "Добавить фото"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={savingPhotos}
                        onChange={(event) => {
                          void handleTaskPhotoUpload(event.target.files);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>

                  <div className="mt-4">
                    {selectedTask.photos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTask.photos.map((photo, index) => (
                          <div
                            key={`${selectedTask.id}-photo-${index}`}
                            className="group relative overflow-hidden rounded-xl border border-border"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo}
                              alt={`Фото задачи ${index + 1}`}
                              className="h-28 w-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-danger hover:text-danger-foreground"
                              onClick={() => void handleRemoveTaskPhoto(index)}
                              disabled={savingPhotos}
                              aria-label="Удалить фото"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                        Фотографии пока не добавлены.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Комментарии
                  </p>
                  {commentsLoading ? (
                    <p className="mt-3 text-sm text-muted-foreground">Загрузка комментариев...</p>
                  ) : taskComments.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Пока без комментариев.</p>
                  ) : (
                    <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
                      {taskComments.map((comment) => (
                        <li
                          key={comment.id}
                          className="rounded-xl bg-muted px-3 py-2.5 text-sm"
                        >
                          <p className="text-xs text-muted-foreground">
                            {comment.user.name || comment.user.email || "Пользователь"} ·{" "}
                            {formatCommentAt(comment.createdAt)}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap leading-6">{comment.body}</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Написать комментарий..."
                      value={commentDraft}
                      onValueChange={setCommentDraft}
                      minRows={2}
                      classNames={{
                        inputWrapper:
                          "rounded-xl border border-border bg-background shadow-none",
                      }}
                    />
                    <Button
                      color="primary"
                      className="rounded-xl"
                      isLoading={postingComment}
                      isDisabled={!commentDraft.trim()}
                      onPress={() => void handleAddComment()}
                    >
                      Отправить
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Выберите задачу, чтобы посмотреть детали.
              </p>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

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
