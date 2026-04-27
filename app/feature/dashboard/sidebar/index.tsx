"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  Users,
  UserRound,
} from "lucide-react";
import { Button } from "@heroui/button";
import { hasCapability } from "@/app/lib/auth/roles";

const navigation = [
  {
    label: "Аналитика",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Задачи",
    href: "/dashboard/tasks",
    icon: CheckSquare,
  },
  {
    label: "Команды",
    href: "/dashboard/teams",
    icon: Users,
  },
  {
    label: "Пользователи",
    href: "/dashboard/users",
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

export default function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const visibleNavigation = navigation.filter((item) => {
    if (item.href !== "/dashboard/users") {
      return true;
    }

    return hasCapability(session?.user?.role, "canManageUsers");
  });

  useEffect(() => {
    const loadTeams = async () => {

      try {
        const res = await fetch("/api/teams", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Не удалось загрузить команды");
        }

        setTeams(data.teams ?? []);
      } catch {
        setTeams([]);
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
          {visibleNavigation.map((item) => {
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
      </div>
    </aside>
  );
}
