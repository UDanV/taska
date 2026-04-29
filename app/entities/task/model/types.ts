"use client";

import { TaskModalAssigneeItem, TaskModalFormState } from "@/app/feature/tasks/types/modals/task-editor";
import type { UserSpecialization } from "@/app/lib/auth/roles";
import type { TaskPriority, TaskStatus } from "@/app/lib/workspace/constants";

export type TaskAssigneeItem = TaskModalAssigneeItem;
export type TaskFormState = TaskModalFormState;

export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  photos: string[];
  status: TaskStatus;
  priority: TaskPriority;
  specialization: UserSpecialization | null;
  updatedAt: string;
  team: {
    id: string;
    name: string;
    color: string;
  };
  createdBy: {
    id: string;
    name: string | null;
  };
  assignee: {
    id: string;
    name: string | null;
    specialization: UserSpecialization | null;
  } | null;
};

export type TaskCommentItem = {
  id: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

export type TaskPatchPayload = Partial<{
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  specialization: UserSpecialization;
  teamId: string;
  assigneeId: string | null;
  photos: string[];
}>;
