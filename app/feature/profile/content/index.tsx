"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, Button, Chip, Input } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, KeyRound, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { AppRole, UserSpecialization } from "@/app/lib/auth/roles";
import {
  ROLE_LABELS,
  getUserSpecializationLabel,
} from "@/app/lib/auth/roles";
import {
  changePasswordSchema,
  type ChangePasswordData,
} from "@/app/lib/validation/auth.schema";
import { changePassword } from "@/app/shared/services/auth";

type ProfileContentProps = {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    hasPassword: boolean;
    role: AppRole;
    specialization: UserSpecialization;
  };
};

export default function ProfileContent({ user }: ProfileContentProps) {
  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
  });
  const form = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const roleLabel = ROLE_LABELS[user.role];
  const specializationLabel = getUserSpecializationLabel(user.specialization);

  const handleChangePassword = async (data: ChangePasswordData) => {
    const response = await changePasswordMutation.mutateAsync(data);
    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error || "Не удалось сменить пароль");
      return;
    }

    toast.success("Пароль успешно обновлен");
    form.reset();
  };

  return (
    <div className="space-y-8 p-4 md:p-6 xl:p-8">

      <section className="grid gap-4 xl:grid-cols-1">
        <div className="space-y-4">
          <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <UserRound size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Информация о пользователе</h2>
            </div>

            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center">
              <Avatar
                name={user.name || user.email || "Taska"}
                className="h-20 w-20 bg-primary font-semibold text-primary-foreground"
              />

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {user.name || "Пользователь Taska"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user.email || "Email не указан"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    color="secondary"
                    variant="flat"
                    className="rounded-xl font-medium"
                  >
                    {roleLabel}
                  </Chip>
                  <Chip variant="flat" className="rounded-xl font-medium">
                    Метка: {specializationLabel ?? "Не указана"}
                  </Chip>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Специализация</h2>
            </div>

            <div className="mt-5 rounded-3xl bg-muted p-4">
              <p className="font-medium">{specializationLabel ?? "Не указана"}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Эта метка назначается root и помогает понимать, чем именно
                занимается сотрудник: frontend, backend или devops.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-4">

          <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <KeyRound size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Смена пароля</h2>
            </div>

            {user.hasPassword ? (
              <form
                onSubmit={form.handleSubmit(handleChangePassword)}
                className="mt-6 space-y-4"
              >
                <Input
                  type="password"
                  label="Текущий пароль"
                  labelPlacement="inside"
                  placeholder="Введите текущий пароль"
                  variant="flat"
                  radius="md"
                  {...form.register("currentPassword")}
                  isInvalid={!!form.formState.errors.currentPassword}
                  errorMessage={form.formState.errors.currentPassword?.message}
                />

                <Input
                  type="password"
                  label="Новый пароль"
                  labelPlacement="inside"
                  placeholder="Минимум 6 символов"
                  variant="flat"
                  radius="md"
                  {...form.register("newPassword")}
                  isInvalid={!!form.formState.errors.newPassword}
                  errorMessage={form.formState.errors.newPassword?.message}
                />

                <Input
                  type="password"
                  label="Подтвердите пароль"
                  labelPlacement="inside"
                  placeholder="Повторите новый пароль"
                  variant="flat"
                  radius="md"
                  {...form.register("confirmPassword")}
                  isInvalid={!!form.formState.errors.confirmPassword}
                  errorMessage={form.formState.errors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  color="primary"
                  className="rounded-xl"
                  isLoading={changePasswordMutation.isPending}
                >
                  Обновить пароль
                </Button>
              </form>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted p-4">
                <p className="font-medium">Смена пароля недоступна</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Для аккаунтов, созданных через социальные сети, пароль сейчас
                  не используется. Позже здесь можно будет добавить сценарии
                  привязки локального входа.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
