"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ROLE_LABELS,
  getUserSpecializationLabel,
  hasCapability,
} from "@/app/lib/auth/roles";
import {
  TASKS_TEAM_MANAGERS_QUERY_KEY,
  TASKS_WORKSPACE_QUERY_KEY,
} from "@/app/feature/tasks/model/workspace/query-keys";
import { TEAMS_MANAGEMENT_QUERY_KEY } from "@/app/feature/teams-management/model/workspace/query-keys";
import type { UserDraft, UserItem } from "../types";
import { getUsers, patchUser } from "./api";
import { USERS_MANAGEMENT_QUERY_KEY } from "./query-keys";

const EMPTY_USERS: UserItem[] = [];

export function useUsersManagementWorkspace() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const canManageUsers = hasCapability(session?.user?.role, "canManageUsers");

  const [searchQuery, setSearchQuery] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({});

  const usersQuery = useQuery({
    queryKey: USERS_MANAGEMENT_QUERY_KEY,
    queryFn: getUsers,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
  const saveUserMutation = useMutation({
    mutationFn: patchUser,
  });

  const users = usersQuery.data ?? EMPTY_USERS;
  const loading = usersQuery.isPending;
  const error = usersQuery.error instanceof Error ? usersQuery.error.message : null;

  useEffect(() => {
    setDrafts(
      users.reduce((acc: Record<string, UserDraft>, user: UserItem) => {
        acc[user.id] = {
          role: user.role,
          specialization: user.specialization,
        };
        return acc;
      }, {}),
    );
  }, [users]);

  const loadUsers = useCallback(async () => {
    await usersQuery.refetch();
  }, [usersQuery]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        user.name ?? "",
        user.email ?? "",
        ROLE_LABELS[user.role],
        getUserSpecializationLabel(user.specialization) ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [searchQuery, users]);

  const rootsCount = useMemo(() => users.filter((user) => user.role === "ROOT").length, [users]);
  const specializedCount = useMemo(
    () => users.filter((user) => user.specialization).length,
    [users],
  );

  const handleDraftChange = useCallback(
    <K extends keyof UserDraft>(userId: string, key: K, value: UserDraft[K]) => {
      setDrafts((current) => ({
        ...current,
        [userId]: {
          ...current[userId],
          [key]: value,
        },
      }));
    },
    [],
  );

  const handleSave = useCallback(
    async (userId: string) => {
      const draft = drafts[userId];
      if (!draft) {
        return;
      }

      setSavingUserId(userId);

      try {
        const user = await saveUserMutation.mutateAsync({ userId, draft });
        queryClient.setQueryData<UserItem[]>(USERS_MANAGEMENT_QUERY_KEY, (current) =>
          (current ?? []).map((item) => (item.id === userId ? user : item)),
        );
        setDrafts((current) => ({
          ...current,
          [userId]: {
            role: user.role,
            specialization: user.specialization,
          },
        }));
        toast.success("Пользователь обновлён");
        await queryClient.invalidateQueries({ queryKey: TASKS_WORKSPACE_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: TASKS_TEAM_MANAGERS_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: TEAMS_MANAGEMENT_QUERY_KEY });
      } catch (saveError) {
        toast.error(saveError instanceof Error ? saveError.message : "Не удалось обновить пользователя");
      } finally {
        setSavingUserId(null);
      }
    },
    [drafts, queryClient, saveUserMutation],
  );

  const getDraftForUser = useCallback(
    (user: UserItem) =>
      drafts[user.id] ?? {
        role: user.role,
        specialization: user.specialization,
      },
    [drafts],
  );

  const isUserDirty = useCallback(
    (user: UserItem, draft: UserDraft) =>
      (canManageUsers && draft.role !== user.role) || draft.specialization !== user.specialization,
    [canManageUsers],
  );

  return {
    users,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    savingUserId,
    canManageUsers,
    filteredUsers,
    rootsCount,
    specializedCount,
    loadUsers,
    handleDraftChange,
    handleSave,
    getDraftForUser,
    isUserDirty,
  };
}
