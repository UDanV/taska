import { z } from "zod";
import { APP_ROLES, USER_SPECIALIZATIONS } from "@/app/lib/auth/roles";

export const updateUserManagementSchema = z.object({
  role: z.enum(APP_ROLES),
  specialization: z.enum(USER_SPECIALIZATIONS).nullable(),
});

export type UpdateUserManagementData = z.infer<typeof updateUserManagementSchema>;
