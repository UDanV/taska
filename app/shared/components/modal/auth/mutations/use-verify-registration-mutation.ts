"use client";

import { useMutation } from "@tanstack/react-query";
import { verifyRegistrationCode } from "@/app/shared/services/auth";

export function useVerifyRegistrationMutation() {
  return useMutation({
    mutationFn: verifyRegistrationCode,
  });
}
