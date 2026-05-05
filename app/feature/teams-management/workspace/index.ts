"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { hasCapability } from "@/app/lib/auth/roles";
import { TEAM_COLOR_OPTIONS } from "@/app/lib/workspace/constants";
import type { TeamFormState } from "@/app/feature/tasks/types/modals/create-team";
import { ManagerItem, TeamDraft, TeamItem, TeamUserItem } from "@/app/entities/team/model/types";
import { deleteTeam, getTeamsManagementData, patchTeam, postTeam } from "./api";
import { TEAMS_MANAGEMENT_QUERY_KEY } from "./query-keys";
import { TASKS_TEAM_MANAGERS_QUERY_KEY, TASKS_WORKSPACE_QUERY_KEY } from "../../tasks/workspace/query-keys";

const EMPTY_TEAMS: TeamItem[] = [];
const EMPTY_MANAGERS: ManagerItem[] = [];
const EMPTY_TEAM_USERS: TeamUserItem[] = [];

function getEmptyCreateForm(pmId: string): TeamFormState {
  return {
    name: "",
    color: TEAM_COLOR_OPTIONS[0],
    pmId,
  };
}

function normalizeIds(ids: string[]) {
  return Array.from(new Set(ids)).sort();
}

function areSameIds(left: string[], right: string[]) {
  const normalizedLeft = normalizeIds(left);
  const normalizedRight = normalizeIds(right);

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every((value, index) => value === normalizedRight[index]);
}

export function useTeamsManagementWorkspace() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, TeamDraft>>({});
  const [savingTeamId, setSavingTeamId] = useState<string | null>(null);
  const [teamPendingDelete, setTeamPendingDelete] = useState<TeamItem | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TeamFormState>(getEmptyCreateForm(""));

  const teamsQuery = useQuery({
    queryKey: TEAMS_MANAGEMENT_QUERY_KEY,
    queryFn: getTeamsManagementData,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
  const saveTeamMutation = useMutation({
    mutationFn: patchTeam,
  });
  const createTeamMutation = useMutation({
    mutationFn: postTeam,
  });
  const deleteTeamMutation = useMutation({
    mutationFn: deleteTeam,
  });

  const teams = teamsQuery.data?.teams ?? EMPTY_TEAMS;
  const managers = teamsQuery.data?.managers ?? EMPTY_MANAGERS;
  const teamUsers = teamsQuery.data?.teamUsers ?? EMPTY_TEAM_USERS;
  const canEditTeams = teamsQuery.data?.canEditTeams ?? false;
  const canManageTeamMembersCap = hasCapability(session?.user?.role, "canManageTeamMembers");
  const loading = teamsQuery.isPending;
  const error = teamsQuery.error instanceof Error ? teamsQuery.error.message : null;
  const savingTeam = createTeamMutation.isPending;

  useEffect(() => {
    setDrafts(
      teams.reduce((acc: Record<string, TeamDraft>, team: TeamItem) => {
        acc[team.id] = {
          name: team.name,
          color: team.color,
          pmId: team.pm.id,
          memberIds: team.members.map((member) => member.user.id),
        };
        return acc;
      }, {}),
    );
  }, [teams]);

  useEffect(() => {
    setCreateForm((current) =>
      current.pmId ? current : getEmptyCreateForm(managers[0]?.id ?? ""),
    );
  }, [managers]);

  const loadData = useCallback(async () => {
    await teamsQuery.refetch();
  }, [teamsQuery]);

  const openCreateTeamModal = useCallback(() => {
    if (!canEditTeams) {
      return;
    }

    setCreateForm(getEmptyCreateForm(managers[0]?.id ?? ""));
    setIsCreateTeamOpen(true);
  }, [canEditTeams, managers]);

  const membersTotal = useMemo(
    () => teams.reduce((sum, team) => sum + team.membersCount, 0),
    [teams],
  );
  const tasksTotal = useMemo(() => teams.reduce((sum, team) => sum + team.tasksCount, 0), [teams]);

  const handleDraftChange = useCallback(
    <K extends keyof TeamDraft>(teamId: string, key: K, value: TeamDraft[K]) => {
      setDrafts((current) => ({
        ...current,
        [teamId]: {
          ...current[teamId],
          [key]: value,
        },
      }));
    },
    [],
  );

  const handleSaveTeam = useCallback(
    async (teamId: string) => {
      const draft = drafts[teamId];
      if (!draft) {
        return;
      }

      setSavingTeamId(teamId);

      try {
        const teamEntity = teams.find((item) => item.id === teamId);
        const membersOnly = Boolean(
          !canEditTeams &&
            teamEntity &&
            canManageTeamMembersCap &&
            session?.user?.id &&
            teamEntity.pm.id === session.user.id,
        );

        const team = await saveTeamMutation.mutateAsync({ teamId, draft, membersOnly });
        queryClient.setQueryData<Awaited<ReturnType<typeof getTeamsManagementData>>>(
          TEAMS_MANAGEMENT_QUERY_KEY,
          (current) =>
            current
              ? {
                  ...current,
                  teams: current.teams.map((item) =>
                    item.id === teamId ? { ...item, ...team } : item,
                  ),
                }
              : current,
        );
        setDrafts((current) => ({
          ...current,
          [teamId]: {
            name: team.name,
            color: team.color,
            pmId: team.pm.id,
            memberIds:
              current[teamId]?.memberIds ??
              teams.find((team) => team.id === teamId)?.members.map((member) => member.user.id) ??
              [],
          },
        }));
        toast.success("Команда обновлена");
        await queryClient.invalidateQueries({ queryKey: TEAMS_MANAGEMENT_QUERY_KEY });
        await queryClient.invalidateQueries({ queryKey: TASKS_WORKSPACE_QUERY_KEY });
      } catch (saveError) {
        toast.error(saveError instanceof Error ? saveError.message : "Не удалось обновить команду");
      } finally {
        setSavingTeamId(null);
      }
    },
    [
      canEditTeams,
      canManageTeamMembersCap,
      drafts,
      queryClient,
      saveTeamMutation,
      session?.user?.id,
      teams,
    ],
  );

  const handleCreateTeam = useCallback(async () => {
    try {
      await createTeamMutation.mutateAsync(createForm);
      toast.success("Команда создана");
      setIsCreateTeamOpen(false);
      setCreateForm(getEmptyCreateForm(managers[0]?.id ?? ""));
      await queryClient.invalidateQueries({ queryKey: TEAMS_MANAGEMENT_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: TASKS_WORKSPACE_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: TASKS_TEAM_MANAGERS_QUERY_KEY });
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : "Не удалось создать команду");
    }
  }, [createForm, createTeamMutation, managers, queryClient]);

  const requestTeamDelete = useCallback((team: TeamItem) => {
    setTeamPendingDelete(team);
  }, []);

  const cancelTeamDelete = useCallback(() => {
    if (deletingTeamId) {
      return;
    }

    setTeamPendingDelete(null);
  }, [deletingTeamId]);

  const confirmTeamDelete = useCallback(async () => {
    if (!teamPendingDelete) {
      return;
    }

    const teamId = teamPendingDelete.id;
    setDeletingTeamId(teamId);

    try {
      await deleteTeamMutation.mutateAsync(teamId);
      queryClient.setQueryData<Awaited<ReturnType<typeof getTeamsManagementData>>>(
        TEAMS_MANAGEMENT_QUERY_KEY,
        (current) =>
          current
            ? {
                ...current,
                teams: current.teams.filter((team) => team.id !== teamId),
              }
            : current,
      );
      setDrafts((current) => {
        const rest = { ...current };
        delete rest[teamId];
        return rest;
      });
      setTeamPendingDelete(null);
      toast.success("Команда удалена");
      await queryClient.invalidateQueries({ queryKey: TEAMS_MANAGEMENT_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: TASKS_WORKSPACE_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: TASKS_TEAM_MANAGERS_QUERY_KEY });
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Не удалось удалить команду");
    } finally {
      setDeletingTeamId(null);
    }
  }, [deleteTeamMutation, queryClient, teamPendingDelete]);

  const getTeamDraft = useCallback(
    (team: TeamItem) =>
      drafts[team.id] ?? {
        name: team.name,
        color: team.color,
        pmId: team.pm.id,
        memberIds: team.members.map((member) => member.user.id),
      },
    [drafts],
  );

  const canManageMembersForTeam = useCallback(
    (team: TeamItem) =>
      canEditTeams ||
      (canManageTeamMembersCap && Boolean(session?.user?.id && team.pm.id === session.user.id)),
    [canEditTeams, canManageTeamMembersCap, session?.user?.id],
  );

  const isTeamDirty = useCallback(
    (team: TeamItem, draft: TeamDraft) => {
      const membersDirty = !areSameIds(
        draft.memberIds,
        team.members.map((member) => member.user.id),
      );

      if (canEditTeams) {
        return (
          draft.name !== team.name ||
          draft.color !== team.color ||
          draft.pmId !== team.pm.id ||
          membersDirty
        );
      }

      if (
        canManageTeamMembersCap &&
        session?.user?.id &&
        team.pm.id === session.user.id
      ) {
        return membersDirty;
      }

      return false;
    },
    [canEditTeams, canManageTeamMembersCap, session?.user?.id],
  );

  return {
    teams,
    managers,
    teamUsers,
    loading,
    error,
    canEditTeams,
    canManageTeamMembersCap,
    savingTeamId,
    teamPendingDelete,
    deletingTeamId,
    isCreateTeamOpen,
    setIsCreateTeamOpen,
    savingTeam,
    createForm,
    setCreateForm,
    membersTotal,
    tasksTotal,
    loadData,
    openCreateTeamModal,
    handleDraftChange,
    handleSaveTeam,
    handleCreateTeam,
    requestTeamDelete,
    cancelTeamDelete,
    confirmTeamDelete,
    getTeamDraft,
    isTeamDirty,
    canManageMembersForTeam,
  };
}
