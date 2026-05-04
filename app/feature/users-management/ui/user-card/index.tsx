"use client";

import { Avatar, Button, Chip } from "@heroui/react";
import {
  APP_ROLES,
  ROLE_LABELS,
  USER_SPECIALIZATION_LABELS,
  USER_SPECIALIZATIONS,
  getUserSpecializationLabel,
  type AppRole,
  type UserSpecialization,
} from "@/app/lib/auth/roles";
import { SelectItemUI, SelectUI } from "@/app/shared/components/ui/select";
import { formatCreatedAt } from "../../lib/date";
import type { UsersManagementUserCardProps } from "@/app/entities/users/model/types";

export default function UsersManagementUserCard({
  user,
  draft,
  canManageUsers,
  isDirty,
  isSaving,
  onSave,
  onDraftChange,
}: UsersManagementUserCardProps) {
  return (
    <article className="rounded-[26px] border border-border bg-muted/30 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar
            src={user.image ?? undefined}
            name={user.name || user.email || "Taska"}
            className="h-14 w-14 bg-primary text-lg font-semibold text-primary-foreground"
          />

          <div className="space-y-2">
            <div>
              <h3 className="text-lg font-semibold">{user.name || "Без имени"}</h3>
              <p className="text-sm text-muted-foreground">{user.email || "Email не указан"}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip color="secondary" variant="flat" className="rounded-xl">
                {ROLE_LABELS[user.role]}
              </Chip>
              <Chip variant="flat" className="rounded-xl">
                {getUserSpecializationLabel(user.specialization) ?? "Без метки"}
              </Chip>
            </div>

            <p className="text-xs text-muted-foreground">Зарегистрирован {formatCreatedAt(user.createdAt)}</p>
          </div>
        </div>

        <div
          className={`grid gap-3 lg:min-w-[360px] ${canManageUsers ? "lg:grid-cols-[1fr_1fr_auto]" : "lg:grid-cols-[1fr_auto]"}`}
        >
          {canManageUsers ? (
            <SelectUI
              placeholder="Выберите роль"
              selectedKeys={[draft.role]}
              onChange={(event) => onDraftChange(user.id, "role", event.target.value as AppRole)}
            >
              {APP_ROLES.map((role) => (
                <SelectItemUI key={role}>{ROLE_LABELS[role]}</SelectItemUI>
              ))}
            </SelectUI>
          ) : null}

          <SelectUI
            placeholder="Без метки"
            selectedKeys={draft.specialization ? [draft.specialization] : []}
            onChange={(event) =>
              onDraftChange(
                user.id,
                "specialization",
                event.target.value ? (event.target.value as UserSpecialization) : null,
              )
            }
          >
            {USER_SPECIALIZATIONS.map((specialization) => (
              <SelectItemUI key={specialization}>
                {USER_SPECIALIZATION_LABELS[specialization]}
              </SelectItemUI>
            ))}
          </SelectUI>

          <Button
            color="primary"
            className="rounded-xl"
            isDisabled={!isDirty}
            isLoading={isSaving}
            onPress={() => void onSave(user.id)}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </article>
  );
}
