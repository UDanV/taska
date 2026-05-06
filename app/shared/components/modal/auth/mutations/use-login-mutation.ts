"use client";

import { useMutation } from "@tanstack/react-query";
import { login } from "@/app/shared/services/auth";

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
  });
}
