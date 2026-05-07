export const APP_ROLES = {
  ROOT: "ROOT",
  PM: "PM",
  EMPLOYEE: "EMPLOYEE",
} as const;

export const USER_SPECIALIZATIONS = {
  FRONTEND: "FRONTEND",
  BACKEND: "BACKEND",
  DEVOPS: "DEVOPS",
} as const;

export type AppRole = keyof typeof APP_ROLES;
export type UserSpecialization = keyof typeof USER_SPECIALIZATIONS;
export const DEFAULT_ROLE: AppRole = "EMPLOYEE";

export const ROLE_LABELS: Record<AppRole, string> = {
  ROOT: "Администратор",
  PM: "Менеджер",
  EMPLOYEE: "Сотрудник",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  ROOT: "Полный доступ к рабочему пространству: команды, задачи, назначения и администрирование.",
  PM: "Управление задачами и составом своих команд (без смены названия команды и PM). Создание команд — только у администратора.",
  EMPLOYEE: "Может просматривать свои задачи, брать их в работу и отмечать выполнение.",
};

export const USER_SPECIALIZATION_LABELS: Record<UserSpecialization, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DEVOPS: "DevOps",
};

export function getUserSpecializationLabel(
  specialization: string | null | undefined,
): string | null {
  if (!specialization) {
    return null;
  }

  return USER_SPECIALIZATION_LABELS[specialization as UserSpecialization] ?? null;
}

export const AUTH_CAPABILITIES = {
  canCreateTeam: ["ROOT"],
  canManageTeamMembers: ["ROOT", "PM"],
  canManageUsers: ["ROOT"],
  canViewUsers: ["ROOT", "PM"],
  canManageTasks: ["ROOT", "PM"],
  canAssignExecutors: ["ROOT", "PM"],
  canDeleteTasks: ["ROOT", "PM"],
  canViewTasks: ["ROOT", "PM", "EMPLOYEE"],
  canExecuteTasks: ["ROOT", "PM", "EMPLOYEE"],
} as const satisfies Record<string, readonly AppRole[]>;

export type AuthCapability = keyof typeof AUTH_CAPABILITIES;

export function hasRole(
  role: AppRole | null | undefined,
  expectedRole: AppRole,
): boolean {
  return role === expectedRole;
}

export function hasAnyRole(
  role: AppRole | null | undefined,
  roles: readonly AppRole[],
): boolean {
  return role ? roles.includes(role) : false;
}

export function hasCapability(
  role: AppRole | null | undefined,
  capability: AuthCapability,
): boolean {
  return hasAnyRole(role, AUTH_CAPABILITIES[capability]);
}
