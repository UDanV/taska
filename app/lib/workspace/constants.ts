export const TEAM_COLOR_OPTIONS = [
  "#6366F1",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#0EA5E9",
] as const;

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "Нужно сделать",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Готово",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
};

export const TASK_PRIORITY_COLORS: Record<
  TaskPriority,
  "success" | "secondary" | "danger"
> = {
  LOW: "success",
  MEDIUM: "secondary",
  HIGH: "danger",
};
