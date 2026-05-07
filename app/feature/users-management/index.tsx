"use client";

import { Button, Input } from "@heroui/react";
import { LoaderCircle, Search, ShieldCheck, UsersRound } from "lucide-react";
import {
  APP_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  type AppRole,
} from "@/app/lib/auth/roles";
import { useUsersManagementWorkspace } from "@/app/feature/users-management/workspace";
import UsersManagementUserCard from "@/app/feature/users-management/ui/user-card";

export default function UsersManagementPage() {
  const workspace = useUsersManagementWorkspace();

  return (
    <div className="space-y-6 p-3 sm:p-4 md:p-6 xl:space-y-8 xl:p-8">
      <section className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr] xl:gap-6">
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:block xl:space-y-6">
          <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="flex items-center gap-2">
              <UsersRound size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Сводка</h2>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:mt-5 xl:grid-cols-1">
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Всего пользователей</p>
                <p className="mt-2 text-3xl font-semibold">{workspace.users.length}</p>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Root-аккаунтов</p>
                <p className="mt-2 text-3xl font-semibold">
                  {workspace.rootsCount}
                </p>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">С меткой специализации</p>
                <p className="mt-2 text-3xl font-semibold">
                  {workspace.specializedCount}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Роли в системе</h2>
            </div>

            <div className="mt-4 space-y-3 xl:mt-5">
              {Object.values(APP_ROLES).map((role: AppRole) => (
                <div key={role} className="rounded-3xl bg-muted p-4">
                  <p className="font-medium">{ROLE_LABELS[role]}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {ROLE_DESCRIPTIONS[role]}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">Все пользователи</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {workspace.canManageUsers
                  ? "Изменения применяются вручную кнопкой сохранения у нужного пользователя."
                  : "Менеджер может изменять только специализацию пользователей."}
              </p>
            </div>

            <Input
              value={workspace.searchQuery}
              onValueChange={workspace.setSearchQuery}
              placeholder="Поиск по имени, email, роли или метке"
              startContent={<Search size={16} className="text-muted-foreground" />}
              className="w-full xl:max-w-md xl:min-w-[320px]"
              classNames={{
                inputWrapper: "h-11 rounded-xl border border-border bg-background shadow-none",
              }}
            />
          </div>

          {workspace.loading ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-6 text-center sm:p-8">
              <LoaderCircle className="mx-auto animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                Загружаем пользователей...
              </p>
            </div>
          ) : workspace.error ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-danger/30 bg-danger/5 p-6 text-center sm:p-8">
              <p className="text-base font-medium">{workspace.error}</p>
              <Button
                variant="light"
                className="mt-4 rounded-xl"
                onPress={() => void workspace.loadUsers()}
              >
                Повторить загрузку
              </Button>
            </div>
          ) : workspace.filteredUsers.length === 0 ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-6 text-center sm:p-8">
              <p className="text-base font-medium">Пользователи не найдены</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Попробуйте изменить строку поиска.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {workspace.filteredUsers.map((user) => {
                const draft = workspace.getDraftForUser(user);
                return (
                  <UsersManagementUserCard
                    key={user.id}
                    user={user}
                    draft={draft}
                    canManageUsers={workspace.canManageUsers}
                    isDirty={workspace.isUserDirty(user, draft)}
                    isSaving={workspace.savingUserId === user.id}
                    onSave={workspace.handleSave}
                    onDraftChange={workspace.handleDraftChange}
                  />
                );
              })}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
