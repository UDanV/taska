import type { TaskCommentItem, TaskItem } from "@/app/entities/task/model/types";
import type { TeamManagerItem } from "@/app/entities/team/model/types";
import type { TasksWorkspaceData } from "../types";
import { normalizeTask } from "./normalize";

export async function getTasksWorkspace(): Promise<TasksWorkspaceData> {
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

  return {
    teams: teamsData.teams ?? [],
    tasks: (tasksData.tasks ?? []).map((task: TaskItem) => normalizeTask(task)),
    taskAssignees: assigneesData.users ?? [],
  };
}

export async function getTeamManagers(): Promise<TeamManagerItem[]> {
  const res = await fetch("/api/team-managers", { cache: "no-store" });
  const data = await res.json();

  if (!res.ok) {
    return [];
  }

  return data.managers ?? [];
}

export async function getTaskComments(taskId: string): Promise<TaskCommentItem[]> {
  const res = await fetch(`/api/tasks/${taskId}/comments`, { cache: "no-store" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Не удалось загрузить комментарии");
  }

  return data.comments ?? [];
}
