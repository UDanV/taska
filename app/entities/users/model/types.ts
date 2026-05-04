import type { AppRole, UserSpecialization } from "@/app/lib/auth/roles";

export type UserItem = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: AppRole;
  specialization: UserSpecialization | null;
  createdAt: string;
  hasPassword: boolean;
};

export type UserDraft = {
  role: AppRole;
  specialization: UserSpecialization | null;
};

export interface UsersManagementUserCardProps {
  user: UserItem;
  draft: UserDraft;
  canManageUsers: boolean;
  isDirty: boolean;
  isSaving: boolean;
  onSave: (userId: string) => void | Promise<void>;
  onDraftChange: <K extends keyof UserDraft>(userId: string, key: K, value: UserDraft[K]) => void;
}