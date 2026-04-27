import { z } from "zod";
import { USER_SPECIALIZATIONS } from "@/app/lib/auth/roles";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TEAM_COLOR_OPTIONS,
} from "@/app/lib/workspace/constants";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(40, "Максимум 40 символов"),
  color: z.enum(TEAM_COLOR_OPTIONS).default("#6366F1"),
  pmId: z.string().uuid("Выберите PM команды"),
  memberIds: z.array(z.string().uuid("Неверный идентификатор участника")).optional(),
});

export const updateTeamSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Минимум 2 символа")
      .max(40, "Максимум 40 символов")
      .optional(),
    color: z.enum(TEAM_COLOR_OPTIONS).optional(),
    pmId: z.string().uuid("Выберите PM команды").optional(),
    memberIds: z.array(z.string().uuid("Неверный идентификатор участника")).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Нет данных для обновления",
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
  specialization: z.enum(USER_SPECIALIZATIONS, {
    message: "Выберите метку задачи",
  }),
  teamId: z.string().uuid("Неверный идентификатор команды"),
  assigneeId: z
    .union([z.string().uuid("Неверный идентификатор исполнителя"), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value === undefined || value === "" ? null : value)),
  photos: z
    .array(z.string().max(2_000_000, "Ссылка на фото слишком длинная"))
    .max(8, "Можно загрузить до 8 фотографий")
    .optional()
    .transform((value) => value ?? []),
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
    specialization: z.enum(USER_SPECIALIZATIONS).optional(),
    assigneeId: z
      .union([z.string().uuid("Неверный идентификатор исполнителя"), z.literal(""), z.null()])
      .optional()
      .transform((value) => {
        if (value === undefined) {
          return undefined;
        }

        return value === "" ? null : value;
      }),
    photos: z
      .array(z.string().max(2_000_000, "Ссылка на фото слишком длинная"))
      .max(8, "Можно загрузить до 8 фотографий")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Нет данных для обновления",
  });

export const createTaskCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Введите текст комментария")
    .max(2000, "Максимум 2000 символов"),
});

export type CreateTeamData = z.infer<typeof createTeamSchema>;
export type UpdateTeamData = z.infer<typeof updateTeamSchema>;
export type CreateTaskData = z.infer<typeof createTaskSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;
export type CreateTaskCommentData = z.infer<typeof createTaskCommentSchema>;
