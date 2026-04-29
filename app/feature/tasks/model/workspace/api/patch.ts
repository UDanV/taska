import type { TaskItem } from "@/app/entities/task/model/types";
import { normalizeTask } from "./normalize";

export async function patchTask({
  taskId,
  payload,
}: {
  taskId: string;
  payload: unknown;
}): Promise<TaskItem> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Не удалось обновить задачу");
  }

  return normalizeTask(result.task as TaskItem);
}
