import type { AppRole, UserSpecialization } from "@/app/lib/auth/roles";
import type { TEAM_COLOR_OPTIONS } from "@/app/lib/workspace/constants";
import { TaskPriority, TaskStatus, TeamMemberRole } from "@prisma/client";

export type TeamColor = (typeof TEAM_COLOR_OPTIONS)[number];

export type ManagerItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: AppRole;
};

export type TeamMemberItem = {
  id: string;
  teamRole: TeamMemberRole;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: AppRole;
    specialization: UserSpecialization | null;
  };
};

export type TeamTaskItem = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  updatedAt: string;
  assignee: {
    id: string;
    name: string | null;
  } | null;
};

export type TeamItem = {
  id: string;
  name: string;
  color: TeamColor;
  membersCount: number;
  tasksCount: number;
  pm: {
    id: string;
    name: string | null;
    email: string | null;
    role: AppRole;
  };
  members: TeamMemberItem[];
  tasks: TeamTaskItem[];
};

export type TeamDraft = {
  name: string;
  color: TeamColor;
  pmId: string;
  memberIds: string[];
};

export type TeamUserItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: AppRole;
  specialization: UserSpecialization | null;
};
