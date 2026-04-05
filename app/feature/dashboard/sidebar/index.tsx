"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  UserRound,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@heroui/button";
import type { AppRole } from "@/app/lib/auth/roles";
import { hasCapability } from "@/app/lib/auth/roles";

const navigation = [
  {
    label: "Обзор",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Мои задачи",
    href: "/dashboard",
    icon: CheckSquare,
  },
  {
    label: "Проекты",
    href: "/dashboard",
    icon: FolderKanban,
  },
  {
    label: "Профиль",
    href: "/dashboard/profile",
    icon: UserRound,
  },
  {
    label: "Настройки",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

type TeamItem = {
  id: string;
  name: string;
  color: string;
  tasksCount: number;
};

type DashboardSidebarProps = {
  userRole: AppRole;
};

export default function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname();
  const canCreateTeam = hasCapability(userRole, "canCreateTeam");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      setLoadingTeams(true);

      try {
        const res = await fetch("/api/teams", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Не удалось загрузить команды");
        }

        setTeams(data.teams ?? []);
      } catch {
        setTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    };

    const refreshWorkspace = () => {
      void loadTeams();
    };

    void loadTeams();
    window.addEventListener("taska:workspace-updated", refreshWorkspace);

    return () => {
      window.removeEventListener("taska:workspace-updated", refreshWorkspace);
    };
  }, []);

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-border bg-card/50 xl:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col gap-6 overflow-y-auto px-4 py-6">

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Button
                key={item.label}
                as={Link}
                href={item.href}
                variant={isActive ? "solid" : "light"}
                color={isActive ? "primary" : "default"}
                className="h-12 w-full justify-start rounded-2xl px-4 text-sm font-medium"
                startContent={<Icon size={18} />}
              >
                {item.label}
              </Button>
            );
          })}
        </nav>

        <section className="rounded-3xl border border-border bg-background p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <p className="text-sm font-semibold">Команды</p>
          </div>
          <p className="mb-3 text-xs leading-5 text-muted-foreground">
            {canCreateTeam
              ? "У вас есть доступ к созданию и настройке команд."
              : "Создание команд доступно только администратору root."}
          </p>
          {canCreateTeam ? (
            <Button
              variant="light"
              className="mb-3 h-10 w-full justify-start rounded-2xl px-3"
              startContent={<Users size={16} />}
              onPress={() => window.dispatchEvent(new Event("taska:create-team"))}
            >
              Создать команду
            </Button>
          ) : null}
          <div className="space-y-3">
            {loadingTeams ? (
              <div className="rounded-2xl bg-muted px-3 py-3 text-sm text-muted-foreground">
                Загружаем команды...
              </div>
            ) : teams.length > 0 ? (
              teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-2xl bg-muted px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="truncate text-sm font-medium">{team.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {team.tasksCount} задач
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-muted px-3 py-3 text-sm text-muted-foreground">
                Пока нет ни одной команды.
              </div>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
