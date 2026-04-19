import {
  ChangePasswordData,
  LoginData,
  RegisterData,
} from "@/app/lib/validation/auth.schema";
import { signIn } from "next-auth/react";

export type SocialAuthProvider = "yandex";

export const login = async (data: LoginData) => {
  const result = await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false,
  });

  return result;
};

export const socialLogin = async (provider: SocialAuthProvider) => {
  await signIn(provider, {
    callbackUrl: "/dashboard",
  });
};

export const register = async (data: RegisterData) => {
  const res = await fetch("/api/register", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });

  return res;
};

export const changePassword = async (data: ChangePasswordData) => {
  const res = await fetch("/api/profile/password", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });

  return res;
};