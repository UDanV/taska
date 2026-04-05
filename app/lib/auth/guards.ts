import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth/session";

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/");
  }

  return user;
}
