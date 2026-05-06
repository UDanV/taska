"use client";

import { useMutation } from "@tanstack/react-query";
import { register } from "@/app/shared/services/auth";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
  });
}
