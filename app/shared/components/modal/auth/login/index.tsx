"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button, Input } from "@heroui/react";
import type { UseFormReturn } from "react-hook-form";
import type { LoginData } from "@/app/lib/validation/auth.schema";

type LoginFormProps = {
  form: UseFormReturn<LoginData>;
  loading: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  onSubmit: (data: LoginData) => Promise<void>;
};

export default function LoginForm({
  form,
  loading,
  showPassword,
  onTogglePassword,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="login-email"
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
        id="login-password"
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

      <Button type="submit" color="primary" fullWidth isLoading={loading} className="font-medium">
        Войти
      </Button>
    </form>
  );
}
