"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button, Input } from "@heroui/react";
import type { UseFormReturn } from "react-hook-form";
import type { RegisterData } from "@/app/lib/validation/auth.schema";

type RegisterFormProps = {
  form: UseFormReturn<RegisterData>;
  loading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: (data: RegisterData) => Promise<void>;
};

export default function RegisterForm({
  form,
  loading,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit,
}: RegisterFormProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="reg-name"
        label="Имя"
        labelPlacement="inside"
        placeholder="Ваше имя"
        variant="flat"
        radius="md"
        {...form.register("name")}
        isInvalid={!!form.formState.errors.name}
        errorMessage={form.formState.errors.name?.message}
      />

      <Input
        id="reg-email"
        type="email"
        label="Email"
        labelPlacement="inside"
        placeholder="you@example.com"
        variant="flat"
        radius="md"
        {...form.register("email")}
        isInvalid={!!form.formState.errors.email}
        errorMessage={form.formState.errors.email?.message}
      />

      <Input
        id="reg-password"
        type={showPassword ? "text" : "password"}
        label="Пароль"
        labelPlacement="inside"
        placeholder="••••••"
        variant="flat"
        radius="md"
        endContent={
          <Button
            isIconOnly
            size="sm"
            variant="light"
            type="button"
            className="min-w-0 text-muted-foreground"
            onPress={onTogglePassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        }
        {...form.register("password")}
        isInvalid={!!form.formState.errors.password}
        errorMessage={form.formState.errors.password?.message}
      />

      <Input
        id="reg-confirm"
        type={showConfirmPassword ? "text" : "password"}
        label="Повторите пароль"
        labelPlacement="inside"
        placeholder="••••••"
        variant="flat"
        radius="md"
        endContent={
          <Button
            isIconOnly
            size="sm"
            variant="light"
            type="button"
            className="min-w-0 text-muted-foreground"
            onPress={onToggleConfirmPassword}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        }
        {...form.register("confirmPassword")}
        isInvalid={!!form.formState.errors.confirmPassword}
        errorMessage={form.formState.errors.confirmPassword?.message}
      />

      <Button type="submit" color="primary" fullWidth isLoading={loading} className="font-medium">
        Создать аккаунт
      </Button>
    </form>
  );
}
