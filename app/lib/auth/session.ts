import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/app/lib/auth/options";

export type SessionUser = Session["user"];

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getCurrentSession();

  return session?.user ?? null;
}
