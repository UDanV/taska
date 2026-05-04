import type {
  TaskAssigneeItem,
  TaskFormState,
  TaskItem,
  TaskPatchPayload,
} from "@/app/entities/task/model/types";
import type { TeamColor, TeamItem } from "@/app/entities/team/model/types";

export type TeamFormState = {
  name: string;
  color: TeamColor;
  pmId: string;
};

export type TasksWorkspaceData = {
  teams: TeamItem[];
  tasks: TaskItem[];
  taskAssignees: TaskAssigneeItem[];
};

export type SaveTaskPayload = {
  taskId?: string;
  payload: TaskFormState;
};

export type PatchTaskPayload = {
  taskId: string;
  payload: TaskPatchPayload;
};
