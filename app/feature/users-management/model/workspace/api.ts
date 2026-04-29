import type { UserDraft, UserItem } from "../types";

export async function getUsers(): Promise<UserItem[]> {
  const response = await fetch("/api/users", { cache: "no-store" });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Не удалось загрузить пользователей");
  }

  return result.users ?? [];
}

export async function patchUser({
  userId,
  draft,
}: {
  userId: string;
  draft: UserDraft;
}): Promise<UserItem> {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(draft),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Не удалось обновить пользователя");
  }

  return result.user;
}
