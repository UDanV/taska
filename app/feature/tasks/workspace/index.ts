"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  getUserSpecializationLabel,
  hasCapability,
  type UserSpecialization,
} from "@/app/lib/auth/roles";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TEAM_COLOR_OPTIONS,
  type TaskStatus,
} from "@/app/lib/workspace/constants";
import { fileToDataUrl } from "@/app/feature/tasks/lib/file";
import type {
  TaskAssigneeItem,
  TaskCommentItem,
  TaskFormState,
  TaskItem,
} from "@/app/entities/task/model/types";
import type { TeamItem, TeamManagerItem } from "@/app/entities/team/model/types";
import type { TaskViewMode } from "@/app/feature/tasks/constants";
import { deleteTask } from "./api/delete";
import { getTaskComments, getTasksWorkspace, getTeamManagers } from "./api/get";
import { patchTask } from "./api/patch";
import { postTask, postTaskComment, postTeam } from "./api/post";
import {
  TASKS_COMMENTS_QUERY_KEY,
  TASKS_TEAM_MANAGERS_QUERY_KEY,
  TASKS_WORKSPACE_QUERY_KEY,
} from "./query-keys";
import type { PatchTaskPayload, SaveTaskPayload, TasksWorkspaceData, TeamFormState } from "./types";
import { createEmptyTaskForm } from "../types/modals/task-editor";
import { addDays, getDateKey, isSameMonth } from "../lib/date";

const EMPTY_TEAMS: TeamItem[] = [];
const EMPTY_TASKS: TaskItem[] = [];
const EMPTY_ASSIGNEES: TaskAssigneeItem[] = [];
const EMPTY_TEAM_MANAGERS: TeamManagerItem[] = [];
const EMPTY_COMMENTS: TaskCommentItem[] = [];

export function useTasksWorkspace() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<TaskViewMode>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [specializationFilter, setSpecializationFilter] = useState<"ALL" | UserSpecialization>(
    "ALL",
  );
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");

  const [teamForm, setTeamForm] = useState<TeamFormState>({
    name: "",
    color: TEAM_COLOR_OPTIONS[0],
    pmId: "",
  });
  const [taskForm, setTaskForm] = useState<TaskFormState>(createEmptyTaskForm());
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [taskPendingDeleteId, setTaskPendingDeleteId] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  const canManageTasks = hasCapability(session?.user?.role, "canManageTasks");
  const currentUserId = session?.user?.id ?? null;
  const workspaceQuery = useQuery({
    queryKey: TASKS_WORKSPACE_QUERY_KEY,
    queryFn: getTasksWorkspace,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
  const teamManagersQuery = useQuery({
    queryKey: TASKS_TEAM_MANAGERS_QUERY_KEY,
    queryFn: getTeamManagers,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
  const commentsQuery = useQuery({
    queryKey: TASKS_COMMENTS_QUERY_KEY(selectedTaskId),
    enabled: isTaskDrawerOpen && Boolean(selectedTaskId),
    queryFn: () => getTaskComments(selectedTaskId as string),
  });

  const teams = workspaceQuery.data?.teams ?? EMPTY_TEAMS;
  const tasks = workspaceQuery.data?.tasks ?? EMPTY_TASKS;
  const taskAssignees = workspaceQuery.data?.taskAssignees ?? EMPTY_ASSIGNEES;
  const teamManagers = teamManagersQuery.data ?? EMPTY_TEAM_MANAGERS;
  const taskComments = commentsQuery.data ?? EMPTY_COMMENTS;
  const commentsLoading = commentsQuery.isFetching;
  const loading = workspaceQuery.isPending;
  const error = workspaceQuery.error instanceof Error ? workspaceQuery.error.message : null;

  useEffect(() => {
    if (!isTaskDrawerOpen || !selectedTaskId) {
      setCommentDraft("");
    }
  }, [isTaskDrawerOpen, selectedTaskId]);

  useEffect(() => {
    if (commentsQuery.error instanceof Error) {
      toast.error(commentsQuery.error.message);
    }
  }, [commentsQuery.error]);

  useEffect(() => {
    setTeamForm((current) => ({
      ...current,
      pmId: current.pmId || teamManagers[0]?.id || "",
    }));
  }, [teamManagers]);

  const loadWorkspace = useCallback(async () => {
    void workspaceQuery.refetch();
    void teamManagersQuery.refetch();
    if (selectedTaskId) {
      await queryClient.invalidateQueries({
        queryKey: TASKS_COMMENTS_QUERY_KEY(selectedTaskId),
      });
    }
  }, [queryClient, selectedTaskId]);

  const openTeamModal = useCallback(() => {
    setTeamForm({
      name: "",
      color: TEAM_COLOR_OPTIONS[0],
      pmId: teamManagers[0]?.id || "",
    });
    setIsCreateTeamOpen(true);
  }, [teamManagers]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (teamFilter !== "all" && task.team.id !== teamFilter) return false;
        if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
        if (specializationFilter !== "ALL" && task.specialization !== specializationFilter) {
          return false;
        }
        if (assignedToMeOnly) return task.assignee?.id === currentUserId;
        if (!normalizedSearch) return true;

        return [
          task.title,
          task.description ?? "",
          task.team.name,
          task.assignee?.name ?? "",
          getUserSpecializationLabel(task.specialization) ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
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

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, TaskItem[]>();
    filteredTasks.forEach((task) => {
      const key = getDateKey(task.updatedAt);
      const bucket = grouped.get(key);
      if (bucket) {
        bucket.push(task);
      } else {
        grouped.set(key, [task]);
      }
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
  const taskPendingDelete = useMemo(
    () => tasks.find((task) => task.id === taskPendingDeleteId) ?? null,
    [taskPendingDeleteId, tasks],
  );

  const setTasksWorkspaceData = useCallback(
    (updater: (current: TasksWorkspaceData) => TasksWorkspaceData) => {
      queryClient.setQueryData<TasksWorkspaceData>(TASKS_WORKSPACE_QUERY_KEY, (current) =>
        updater(
          current ?? {
            teams: [],
            tasks: [],
            taskAssignees: [],
          },
        ),
      );
    },
    [queryClient],
  );

  const patchTaskMutation = useMutation({
    mutationFn: (payload: PatchTaskPayload) => patchTask(payload),
  });

  const createTeamMutation = useMutation({
    mutationFn: (payload: TeamFormState) => postTeam(payload),
  });

  const saveTaskMutation = useMutation({
    mutationFn: ({ taskId, payload }: SaveTaskPayload) =>
      taskId ? patchTask({ taskId, payload }) : postTask(payload),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
  });

  const addCommentMutation = useMutation({
    mutationFn: postTaskComment,
  });

  const openTaskDrawer = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDrawerOpen(true);
  }, []);

  const handleTaskStatusDrop = useCallback(
    async (taskId: string, status: TaskStatus) => {
      const sourceTask = tasks.find((task) => task.id === taskId);
      if (!sourceTask || sourceTask.status === status) return;

      if (
        !canManageTasks &&
        (sourceTask.assignee?.id !== currentUserId ||
          (status !== "IN_PROGRESS" && status !== "REVIEW" && status !== "DONE"))
      ) {
        toast.error("Вы можете переводить только свои задачи в 'В работе', 'На проверке' или 'Готово'");
        return;
      }

      setTasksWorkspaceData((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task,
        ),
      }));

      try {
        const updatedTask = await patchTaskMutation.mutateAsync({ taskId, payload: { status } });
        setTasksWorkspaceData((current) => ({
          ...current,
          tasks: current.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        }));
      } catch (statusError) {
        setTasksWorkspaceData((current) => ({
          ...current,
          tasks: current.tasks.map((task) =>
            task.id === taskId ? { ...task, status: sourceTask.status } : task,
          ),
        }));
        toast.error(statusError instanceof Error ? statusError.message : "Не удалось переместить задачу");
      }
    },
    [canManageTasks, currentUserId, patchTaskMutation, setTasksWorkspaceData, tasks],
  );

  const handleTaskPhotoUpload = useCallback(
    async (files: FileList | null) => {
      if (!selectedTask || !files) return;
      const allFiles = Array.from(files);
      const imageFiles = allFiles.filter((file) => file.type.startsWith("image/"));
      if (imageFiles.length !== allFiles.length) {
        toast.error("Можно загружать только фотографии");
        return;
      }

      const maxPhotos = 8;
      const remainingSlots = maxPhotos - (selectedTask.photos ?? []).length;
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
        const nextPhotos = [...(selectedTask.photos ?? []), ...uploadedPhotos];
        const updatedTask = await patchTaskMutation.mutateAsync({
          taskId: selectedTask.id,
          payload: { photos: nextPhotos },
        });
        setTasksWorkspaceData((current) => ({
          ...current,
          tasks: current.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        }));
        toast.success("Фотографии загружены");
      } catch (photoError) {
        toast.error(photoError instanceof Error ? photoError.message : "Не удалось загрузить фотографии");
      } finally {
        setSavingPhotos(false);
      }
    },
    [patchTaskMutation, selectedTask, setTasksWorkspaceData],
  );

  const handleRemoveTaskPhoto = useCallback(
    async (index: number) => {
      if (!selectedTask) return;
      const nextPhotos = selectedTask.photos.filter((_, photoIndex) => photoIndex !== index);
      setSavingPhotos(true);
      try {
        const updatedTask = await patchTaskMutation.mutateAsync({
          taskId: selectedTask.id,
          payload: { photos: nextPhotos },
        });
        setTasksWorkspaceData((current) => ({
          ...current,
          tasks: current.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        }));
      } catch (removeError) {
        toast.error(removeError instanceof Error ? removeError.message : "Не удалось удалить фотографию");
      } finally {
        setSavingPhotos(false);
      }
    },
    [patchTaskMutation, selectedTask, setTasksWorkspaceData],
  );

  const handleAddComment = useCallback(async () => {
    if (!selectedTask) return;
    const text = commentDraft.trim();
    if (!text) return;

    try {
      const comment = await addCommentMutation.mutateAsync({
        taskId: selectedTask.id,
        body: text,
      });
      queryClient.setQueryData<TaskCommentItem[]>(
        TASKS_COMMENTS_QUERY_KEY(selectedTask.id),
        (current) => [...(current ?? []), comment],
      );
      setCommentDraft("");
      toast.success("Комментарий добавлен");
    } catch (commentError) {
      toast.error(commentError instanceof Error ? commentError.message : "Не удалось отправить комментарий");
    }
  }, [addCommentMutation, commentDraft, queryClient, selectedTask]);

  const handleCreateTeam = useCallback(async () => {
    try {
      const result = await createTeamMutation.mutateAsync(teamForm);
      toast.success("Команда создана");
      setIsCreateTeamOpen(false);
      setTeamForm({ name: "", color: TEAM_COLOR_OPTIONS[0], pmId: teamManagers[0]?.id ?? "" });
      setTaskForm((current: TaskFormState) => ({ ...current, teamId: current.teamId || result.team.id }));
      await queryClient.invalidateQueries({ queryKey: TASKS_WORKSPACE_QUERY_KEY });
    } catch (teamError) {
      toast.error(teamError instanceof Error ? teamError.message : "Не удалось создать команду");
    }
  }, [createTeamMutation, queryClient, teamForm, teamManagers]);

  const handleCreateTask = useCallback(async () => {
    try {
      await saveTaskMutation.mutateAsync({
        taskId: editingTask?.id,
        payload: taskForm,
      });
      toast.success(editingTask ? "Задача обновлена" : "Задача создана");
      setIsTaskModalOpen(false);
      setEditingTask(null);
      setTaskForm(createEmptyTaskForm(teams[0]?.id));
      await queryClient.invalidateQueries({ queryKey: TASKS_WORKSPACE_QUERY_KEY });
    } catch (taskError) {
      toast.error(taskError instanceof Error ? taskError.message : "Не удалось сохранить задачу");
    }
  }, [editingTask, queryClient, saveTaskMutation, taskForm, teams]);

  const handleEditTask = useCallback((task: TaskItem) => {
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
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTaskPendingDeleteId(taskId);
  }, []);

  const cancelTaskDelete = useCallback(() => {
    if (!deletingTaskId) {
      setTaskPendingDeleteId(null);
    }
  }, [deletingTaskId]);

  const confirmTaskDelete = useCallback(
    async () => {
      if (!taskPendingDeleteId) {
        return;
      }

      setDeletingTaskId(taskPendingDeleteId);
      try {
        await deleteTaskMutation.mutateAsync(taskPendingDeleteId);
        toast.success("Задача удалена");
        if (selectedTaskId === taskPendingDeleteId) {
          setIsTaskDrawerOpen(false);
          setSelectedTaskId(null);
        }
        setTaskPendingDeleteId(null);
        await queryClient.invalidateQueries({ queryKey: TASKS_WORKSPACE_QUERY_KEY });
      } catch (deleteError) {
        toast.error(deleteError instanceof Error ? deleteError.message : "Не удалось удалить задачу");
      } finally {
        setDeletingTaskId(null);
      }
    },
    [deleteTaskMutation, queryClient, selectedTaskId, taskPendingDeleteId],
  );

  const openTaskCreateModal = useCallback(() => {
    if (teams.length === 0) {
      openTeamModal();
      return;
    }
    setEditingTask(null);
    setTaskForm(createEmptyTaskForm(teams[0]?.id));
    setIsTaskModalOpen(true);
  }, [openTeamModal, teams]);

  const emptyStateTitle =
    filteredTasks.length === 0 && tasks.length > 0
      ? "По текущим фильтрам ничего не найдено"
      : "Задач пока нет";
  const emptyStateDescription =
    filteredTasks.length === 0 && tasks.length > 0
      ? "Попробуйте сбросить фильтры или выбрать другой формат отображения."
      : "Добавьте первую задачу, и она сразу появится в списке, на доске и в календаре.";
  const savingTeam = createTeamMutation.isPending;
  const savingTask = saveTaskMutation.isPending;
  const postingComment = addCommentMutation.isPending;

  return {
    teams,
    tasks,
    taskAssignees,
    loading,
    error,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    teamFilter,
    setTeamFilter,
    statusFilter,
    setStatusFilter,
    specializationFilter,
    setSpecializationFilter,
    assignedToMeOnly,
    setAssignedToMeOnly,
    calendarDate,
    setCalendarDate,
    isCreateTeamOpen,
    setIsCreateTeamOpen,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isTaskDrawerOpen,
    setIsTaskDrawerOpen,
    selectedTaskId,
    setSelectedTaskId,
    editingTask,
    taskForm,
    setTaskForm,
    teamManagers,
    teamForm,
    setTeamForm,
    savingTeam,
    savingTask,
    savingPhotos,
    deletingTaskId,
    taskPendingDelete,
    draggingTaskId,
    setDraggingTaskId,
    dragOverStatus,
    setDragOverStatus,
    canManageTasks,
    currentUserId,
    filteredTasks,
    boardColumns,
    calendarDays,
    selectedTask,
    taskComments,
    commentsLoading,
    commentDraft,
    setCommentDraft,
    postingComment,
    loadWorkspace,
    handleTaskStatusDrop,
    openTaskDrawer,
    handleTaskPhotoUpload,
    handleRemoveTaskPhoto,
    handleAddComment,
    handleCreateTeam,
    handleCreateTask,
    handleEditTask,
    handleDeleteTask,
    cancelTaskDelete,
    confirmTaskDelete,
    openTeamModal,
    openTaskCreateModal,
    emptyStateTitle,
    emptyStateDescription,
  };
}
