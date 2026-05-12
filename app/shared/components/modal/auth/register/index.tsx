"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button, Checkbox, Input } from "@heroui/react";
import { Controller, type UseFormReturn } from "react-hook-form";
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
  const consentGiven = form.watch("acceptPersonalDataProcessing");

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

      <Controller
        name="acceptPersonalDataProcessing"
        control={form.control}
        render={({ field }) => (
          <div className="flex items-center gap-1">
            <Checkbox
              isSelected={field.value}
              onValueChange={field.onChange}
              classNames={{
                base: "items-start gap-2 max-w-full",
                label: "text-sm text-foreground leading-snug",
              }}
            >
            </Checkbox>
            <span>
                Я согласен на{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  обработку персональных данных
                </Link>
              </span>
            {form.formState.errors.acceptPersonalDataProcessing?.message ? (
              <p className="text-xs text-danger pl-8">
                {form.formState.errors.acceptPersonalDataProcessing.message}
              </p>
            ) : null}
          </div>
        )}
      />

      <Button
        type="submit"
        color="primary"
        fullWidth
        isLoading={loading}
        isDisabled={!consentGiven}
        className="font-medium"
      >
        Создать аккаунт
      </Button>
    </form>
  );
}
