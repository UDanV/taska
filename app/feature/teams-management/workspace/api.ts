import { ManagerItem, TeamDraft, TeamItem, TeamUserItem } from "@/app/entities/team/model/types";
import type { TeamFormState } from "@/app/feature/tasks/types/modals/create-team";

export type TeamsManagementData = {
  teams: TeamItem[];
  managers: ManagerItem[];
  teamUsers: TeamUserItem[];
  canEditTeams: boolean;
};

export async function getTeamsManagementData(): Promise<TeamsManagementData> {
  const [teamsRes, managersRes, usersRes] = await Promise.all([
    fetch("/api/teams?includeDetails=1", { cache: "no-store" }),
    fetch("/api/team-managers", { cache: "no-store" }),
    fetch("/api/users", { cache: "no-store" }),
  ]);

  const teamsData = await teamsRes.json();
  const managersData = await managersRes.json();
  const usersData = await usersRes.json();

  if (!teamsRes.ok) {
    throw new Error(teamsData.error || "Не удалось загрузить команды");
  }

  return {
    teams: teamsData.teams ?? [],
    managers: managersRes.ok ? (managersData.managers ?? []) : [],
    teamUsers: managersRes.ok && usersRes.ok ? (usersData.users ?? []) : [],
    canEditTeams: managersRes.ok,
  };
}

export async function patchTeam({
  teamId,
  draft,
}: {
  teamId: string;
  draft: TeamDraft;
}) {
  const res = await fetch(`/api/teams/${teamId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(draft),
  });
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Не удалось обновить команду");
  }

  return result.team as TeamItem;
}

export async function postTeam(payload: TeamFormState) {
  const res = await fetch("/api/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Не удалось создать команду");
  }

  return result;
}
