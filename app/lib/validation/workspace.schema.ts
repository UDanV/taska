import { z } from "zod";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TEAM_COLOR_OPTIONS,
} from "@/app/lib/workspace/constants";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(40, "Максимум 40 символов"),
  color: z.enum(TEAM_COLOR_OPTIONS).default("#6366F1"),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Минимум 2 символа").max(120, "Максимум 120 символов"),
  description: z
    .string()
    .trim()
    .max(500, "Максимум 500 символов")
    .optional()
    .transform((value) => value || undefined),
  status: z.enum(TASK_STATUSES).default("TODO"),
  priority: z.enum(TASK_PRIORITIES).default("MEDIUM"),
  teamId: z.string().uuid("Неверный идентификатор команды"),
  assigneeId: z
    .string()
    .uuid("Неверный идентификатор исполнителя")
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});

export const updateTaskSchema = createTaskSchema
  .omit({ teamId: true })
  .extend({
    teamId: z.string().uuid("Неверный идентификатор команды").optional(),
    title: z.string().trim().min(2, "Минимум 2 символа").max(120).optional(),
    description: z
      .string()
      .trim()
      .max(500, "Максимум 500 символов")
      .optional()
      .or(z.literal(""))
      .transform((value) => value || undefined),
    status: z.enum(TASK_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Нет данных для обновления",
  });

export type CreateTeamData = z.infer<typeof createTeamSchema>;
export type CreateTaskData = z.infer<typeof createTaskSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;
