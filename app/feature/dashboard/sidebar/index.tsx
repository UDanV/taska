"use client";

import Link from "next/link";
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

const teams = [
  { name: "Product", color: "bg-primary" },
  { name: "Design", color: "bg-pink-500" },
  { name: "Growth", color: "bg-emerald-500" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

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
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.name}
                className="flex items-center justify-between rounded-2xl bg-muted px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${team.color}`} />
                  <span className="text-sm font-medium">{team.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">online</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
