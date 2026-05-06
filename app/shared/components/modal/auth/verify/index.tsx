"use client";

import { Button, InputOtp } from "@heroui/react";
import type { UseFormReturn } from "react-hook-form";
import type { VerifyRegistrationCodeData } from "@/app/lib/validation/auth.schema";

type VerifyEmailCodeFormProps = {
  form: UseFormReturn<VerifyRegistrationCodeData>;
  loading: boolean;
  email: string;
  onSubmit: (data: VerifyRegistrationCodeData) => Promise<void>;
  onResetEmail: () => void;
};

export default function VerifyEmailCodeForm({
  form,
  loading,
  email,
  onSubmit,
  onResetEmail,
}: VerifyEmailCodeFormProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        Мы отправили 6-значный код на {email}. Введите его, чтобы завершить регистрацию.
      </p>

      <InputOtp
        length={6}
        {...form.register("code")}
        isInvalid={!!form.formState.errors.code}
        errorMessage={form.formState.errors.code?.message}
        onChange={(e) => {
          form.setValue("code", (e.target as HTMLInputElement).value);
        }}
      />

      <Button type="submit" color="primary" fullWidth isLoading={loading} className="font-medium">
        Подтвердить email
      </Button>

      <Button type="button" variant="light" fullWidth isDisabled={loading} onPress={onResetEmail}>
        Изменить email
      </Button>
    </form>
  );
}
