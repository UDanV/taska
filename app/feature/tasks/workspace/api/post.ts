import type { TaskCommentItem } from "@/app/entities/task/model/types";
import type { TeamFormState } from "../types";

export async function postTeam(payload: TeamFormState) {
  const res = await fetch("/api/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Не удалось создать команду");
  }

  return result;
}

export async function postTask(payload: unknown) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Не удалось сохранить задачу");
  }

  return result;
}

export async function postTaskComment({
  taskId,
  body,
}: {
  taskId: string;
  body: string;
}): Promise<TaskCommentItem> {
  const res = await fetch(`/api/tasks/${taskId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Не удалось отправить комментарий");
  }

  return data.comment as TaskCommentItem;
}
