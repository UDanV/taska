import type { TaskAssigneeItem, TaskFormState, TaskItem } from "@/app/entities/task/model/types";
import type { TeamItem, TeamManagerItem } from "@/app/entities/team/model/types";

export type DashboardTeamItem = TeamItem;
export type DashboardTeamManagerItem = TeamManagerItem;
export type DashboardTaskItem = TaskItem;
export type DashboardTaskAssigneeItem = TaskAssigneeItem;
export type DashboardTaskFormState = TaskFormState;