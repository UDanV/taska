import { z } from "zod";
import { isDisposableEmail } from "@/app/lib/validation/disposable-email";

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Минимум 2 символа"),
    email: z
      .string()
      .email("Введите корректный email")
      .refine((email) => !isDisposableEmail(email), "Временные email не поддерживаются"),
    password: z.string().min(6, "Минимум 6 символов"),
    confirmPassword: z.string().min(6, "Минимум 6 символов"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const verifyRegistrationCodeSchema = z.object({
  email: z.string().email("Введите корректный email"),
  code: z.string().regex(/^\d{6}$/, "Введите 6-значный код"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Минимум 6 символов"),
    newPassword: z.string().min(6, "Минимум 6 символов"),
    confirmPassword: z.string().min(6, "Минимум 6 символов"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Новый пароль должен отличаться от текущего",
    path: ["newPassword"],
  });

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type VerifyRegistrationCodeData = z.infer<typeof verifyRegistrationCodeSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;