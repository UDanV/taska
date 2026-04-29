import { AppRole } from "@/app/lib/auth/roles";
import type { TEAM_COLOR_OPTIONS } from "@/app/lib/workspace/constants";

export type TeamColor = (typeof TEAM_COLOR_OPTIONS)[number];

export type TeamItem = {
  id: string;
  name: string;
  color: string;
  membersCount: number;
  tasksCount: number;
};

export type TeamManagerItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: AppRole;
};