import { LoginData, RegisterData } from "@/app/lib/validation/auth.schema";
import { signIn } from "next-auth/react";

export const login = async (data: LoginData) => {
  const result = await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false,
  });

  return result;
};

export const register = async (data: RegisterData) => {
  const res = await fetch("/api/register", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });

  return res;
};