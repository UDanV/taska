"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TEAM_COLOR_OPTIONS, TASK_STATUSES } from "@/app/lib/workspace/constants";
import { createEmptyTaskForm } from "@/app/feature/tasks/types/modals/task-editor";
import type { TeamFormState } from "@/app/feature/tasks/types/modals/create-team";
import { getTasksWorkspace, getTeamManagers } from "@/app/feature/tasks/model/workspace/api/get";
import { patchTask } from "@/app/feature/tasks/model/workspace/api/patch";
import { postTask, postTeam } from "@/app/feature/tasks/model/workspace/api/post";
import {
  TASKS_TEAM_MANAGERS_QUERY_KEY,
  TASKS_WORKSPACE_QUERY_KEY,
} from "@/app/feature/tasks/model/workspace/query-keys";
import type {
  DashboardTaskItem,
} from "../types";

export function useDashboardWorkspace() {
  const queryClient = useQueryClient();

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DashboardTaskItem | null>(null);

  const [teamForm, setTeamForm] = useState<TeamFormState>({
    name: "",
    color: TEAM_COLOR_OPTIONS[0],
    pmId: "",
  });
  const [taskForm, setTaskForm] = useState(createEmptyTaskForm());
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
  const createTeamMutation = useMutation({
    mutationFn: (payload: TeamFormState) => postTeam(payload),
  });
  const saveTaskMutation = useMutation({
    mutationFn: () =>
      editingTask
        ? patchTask({ taskId: editingTask.id, payload: taskForm })
        : postTask(taskForm),
  });

  const teams = workspaceQuery.data?.teams ?? [];
  const tasks = workspaceQuery.data?.tasks ?? [];
  const taskAssignees = workspaceQuery.data?.taskAssignees ?? [];
  const teamManagers = teamManagersQuery.data ?? [];
  const loading = workspaceQuery.isPending;
  const error = workspaceQuery.error instanceof Error ? workspaceQuery.error.message : null;
  const savingTeam = createTeamMutation.isPending;
  const savingTask = saveTaskMutation.isPending;

  const loadWorkspace = useCallback(async () => {
    await Promise.all([workspaceQuery.refetch(), teamManagersQuery.refetch()]);
  }, [teamManagersQuery, workspaceQuery]);

  useEffect(() => {
    setTeamForm((current) => ({
      ...current,
      pmId: current.pmId || teamManagers[0]?.id || "",
    }));
  }, [teamManagers]);

  const openTeamModal = useCallback(() => {
    setTeamForm({
      name: "",
      color: TEAM_COLOR_OPTIONS[0],
      pmId: teamManagers[0]?.id ?? "",
    });
    setIsCreateTeamOpen(true);
  }, [teamManagers]);

  const openTaskCreateModal = useCallback(() => {
    if (teams.length === 0) {
      openTeamModal();
      return;
    }

    setEditingTask(null);
    setTaskForm(createEmptyTaskForm(teams[0]?.id));
    setIsTaskModalOpen(true);
  }, [openTeamModal, teams]);

  useEffect(() => {
    const refreshWorkspace = () => {
      void loadWorkspace();
    };

    window.addEventListener("taska:create-team", openTeamModal);
    window.addEventListener("taska:create-task", openTaskCreateModal);
    window.addEventListener("taska:workspace-updated", refreshWorkspace);

    return () => {
      window.removeEventListener("taska:create-team", openTeamModal);
      window.removeEventListener("taska:create-task", openTaskCreateModal);
      window.removeEventListener("taska:workspace-updated", refreshWorkspace);
    };
  }, [loadWorkspace, openTeamModal, openTaskCreateModal]);

  const handleCreateTeam = useCallback(async () => {
    try {
      const result = await createTeamMutation.mutateAsync(teamForm);
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
      await queryClient.invalidateQueries({ queryKey: TASKS_WORKSPACE_QUERY_KEY });
    } catch (teamError) {
      toast.error(teamError instanceof Error ? teamError.message : "Не удалось создать команду");
    }
  }, [createTeamMutation, queryClient, teamForm, teamManagers]);

  const handleCreateTask = useCallback(async () => {
    try {
      await saveTaskMutation.mutateAsync();
      toast.success(editingTask ? "Задача обновлена" : "Задача создана");
      setIsTaskModalOpen(false);
      setEditingTask(null);
      setTaskForm(createEmptyTaskForm(teams[0]?.id));
      await queryClient.invalidateQueries({ queryKey: TASKS_WORKSPACE_QUERY_KEY });
    } catch (taskError) {
      toast.error(taskError instanceof Error ? taskError.message : "Не удалось сохранить задачу");
    }
  }, [editingTask, queryClient, saveTaskMutation, teams]);

  const activeTasks = useMemo(() => tasks.filter((task) => task.status !== "DONE"), [tasks]);
  const reviewTasksCount = useMemo(
    () => tasks.filter((task) => task.status === "REVIEW").length,
    [tasks],
  );
  const doneTasksCount = useMemo(() => tasks.filter((task) => task.status === "DONE").length, [tasks]);
  const highPriorityCount = useMemo(
    () => tasks.filter((task) => task.priority === "HIGH").length,
    [tasks],
  );
  const focusTasks = useMemo(() => activeTasks.slice(0, 3), [activeTasks]);
  const taskStatusCounts = useMemo(
    () => TASK_STATUSES.map((status) => tasks.filter((task) => task.status === status).length),
    [tasks],
  );

  return {
    teams,
    tasks,
    taskAssignees,
    loading,
    error,
    isCreateTeamOpen,
    setIsCreateTeamOpen,
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTask,
    teamManagers,
    teamForm,
    setTeamForm,
    taskForm,
    setTaskForm,
    savingTeam,
    savingTask,
    loadWorkspace,
    handleCreateTeam,
    handleCreateTask,
    openTaskCreateModal,
    activeTasks,
    reviewTasksCount,
    doneTasksCount,
    highPriorityCount,
    focusTasks,
    taskStatusCounts,
  };
}
