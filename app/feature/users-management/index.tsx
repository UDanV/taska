"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, Button, Chip, Input, Select, SelectItem } from "@heroui/react";
import { LoaderCircle, RefreshCcw, Search, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";
import {
  APP_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  USER_SPECIALIZATION_LABELS,
  USER_SPECIALIZATIONS,
  type AppRole,
  type UserSpecialization,
} from "@/app/lib/auth/roles";

type UserItem = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: AppRole;
  specialization: UserSpecialization | null;
  createdAt: string;
  hasPassword: boolean;
};

type UserDraft = {
  role: AppRole;
  specialization: UserSpecialization | null;
};

const selectClassName =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary";

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Не удалось загрузить пользователей");
      }

      const nextUsers = result.users ?? [];
      setUsers(nextUsers);
      setDrafts(
        nextUsers.reduce(
          (acc: Record<string, UserDraft>, user: UserItem) => {
            acc[user.id] = {
              role: user.role,
              specialization: user.specialization,
            };
            return acc;
          },
          {},
        ),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить пользователей",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        user.name ?? "",
        user.email ?? "",
        ROLE_LABELS[user.role],
        user.specialization
          ? USER_SPECIALIZATION_LABELS[user.specialization]
          : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [searchQuery, users]);

  const handleDraftChange = <K extends keyof UserDraft>(
    userId: string,
    key: K,
    value: UserDraft[K],
  ) => {
    setDrafts((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        [key]: value,
      },
    }));
  };

  const handleSave = async (userId: string) => {
    const draft = drafts[userId];

    if (!draft) {
      return;
    }

    setSavingUserId(userId);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Не удалось обновить пользователя");
      }

      setUsers((current) =>
        current.map((user) => (user.id === userId ? result.user : user)),
      );
      setDrafts((current) => ({
        ...current,
        [userId]: {
          role: result.user.role,
          specialization: result.user.specialization,
        },
      }));
      toast.success("Пользователь обновлён");
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Не удалось обновить пользователя",
      );
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6 xl:p-8">
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <UsersRound size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Сводка</h2>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Всего пользователей</p>
                <p className="mt-2 text-3xl font-semibold">{users.length}</p>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Root-аккаунтов</p>
                <p className="mt-2 text-3xl font-semibold">
                  {users.filter((user) => user.role === "ROOT").length}
                </p>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">С меткой специализации</p>
                <p className="mt-2 text-3xl font-semibold">
                  {users.filter((user) => user.specialization).length}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Роли в системе</h2>
            </div>

            <div className="mt-5 space-y-3">
              {APP_ROLES.map((role) => (
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

        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Все пользователи</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Изменения применяются вручную кнопкой сохранения у нужного пользователя.
              </p>
            </div>

            <Input
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Поиск по имени, email, роли или метке"
              startContent={<Search size={16} className="text-muted-foreground" />}
              className="w-full lg:max-w-md"
              classNames={{
                inputWrapper: "h-11 rounded-xl border border-border bg-background shadow-none",
              }}
            />
          </div>

          {loading ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
              <LoaderCircle className="mx-auto animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                Загружаем пользователей...
              </p>
            </div>
          ) : error ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-danger/30 bg-danger/5 p-8 text-center">
              <p className="text-base font-medium">{error}</p>
              <Button
                variant="light"
                className="mt-4 rounded-xl"
                onPress={() => void loadUsers()}
              >
                Повторить загрузку
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-base font-medium">Пользователи не найдены</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Попробуйте изменить строку поиска.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredUsers.map((user) => {
                const draft = drafts[user.id] ?? {
                  role: user.role,
                  specialization: user.specialization,
                };
                const isDirty =
                  draft.role !== user.role ||
                  draft.specialization !== user.specialization;

                return (
                  <article
                    key={user.id}
                    className="rounded-[26px] border border-border bg-muted/30 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={user.image ?? undefined}
                          name={user.name || user.email || "Taska"}
                          className="h-14 w-14 bg-primary text-lg font-semibold text-primary-foreground"
                        />

                        <div className="space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {user.name || "Без имени"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {user.email || "Email не указан"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Chip
                              color="secondary"
                              variant="flat"
                              className="rounded-xl"
                            >
                              {ROLE_LABELS[user.role]}
                            </Chip>
                            <Chip variant="flat" className="rounded-xl">
                              {user.specialization
                                ? USER_SPECIALIZATION_LABELS[user.specialization]
                                : "Без метки"}
                            </Chip>
                            <Chip
                              variant="flat"
                              className="rounded-xl"
                              color={user.hasPassword ? "success" : "warning"}
                            >
                              {user.hasPassword ? "Локальный вход" : "Соцлогин"}
                            </Chip>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            Зарегистрирован {formatCreatedAt(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 lg:min-w-[360px] lg:grid-cols-[1fr_1fr_auto]">
                        <Select
                          className={selectClassName}
                          value={draft.role}
                          onChange={(event) =>
                            handleDraftChange(
                              user.id,
                              "role",
                              event.target.value as AppRole,
                            )
                          }
                        >
                          {APP_ROLES.map((role) => (
                            <SelectItem key={role}>
                              {ROLE_LABELS[role]}
                            </SelectItem>
                          ))}
                        </Select>

                        <Select
                          className={selectClassName}
                          value={draft.specialization ?? ""}
                          onChange={(event) =>
                            handleDraftChange(
                              user.id,
                              "specialization",
                              event.target.value
                                ? (event.target.value as UserSpecialization)
                                : null,
                            )
                          }
                        >
                          {USER_SPECIALIZATIONS.map((specialization) => (
                            <SelectItem key={specialization}>
                              {USER_SPECIALIZATION_LABELS[specialization]}
                            </SelectItem>
                          ))}
                        </Select>

                        <Button
                          color="primary"
                          className="rounded-xl"
                          isDisabled={!isDirty}
                          isLoading={savingUserId === user.id}
                          onPress={() => void handleSave(user.id)}
                        >
                          Сохранить
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
