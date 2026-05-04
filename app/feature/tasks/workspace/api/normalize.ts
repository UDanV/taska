import type { TaskItem } from "@/app/entities/task/model/types";

export function normalizeTask(task: TaskItem): TaskItem {
  return {
    ...task,
    photos: Array.isArray(task.photos) ? task.photos : [],
  };
}
