import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth/session";
import { hasAnyRole, hasRole } from "@/app/lib/auth/roles";

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/");
  }

  return user;
}

export async function requireRootUser() {
  const user = await requireAuthenticatedUser();

  if (!hasRole(user.role, "ROOT")) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireRootOrManagerUser() {
  const user = await requireAuthenticatedUser();

  if (!hasAnyRole(user.role, ["ROOT", "PM"])) {
    redirect("/dashboard");
  }

  return user;
}
