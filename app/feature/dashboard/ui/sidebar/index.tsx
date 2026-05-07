"use client";

import Link from "next/link";
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
import { Drawer, DrawerBody, DrawerContent } from "@heroui/react";
import { hasCapability } from "@/app/lib/auth/roles";

const navigation = [
  {
    label: "Дашборд",
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

type DashboardSidebarProps = {
  isMobileOpen: boolean;
  onMobileOpenChange: (isOpen: boolean) => void;
  onCloseMobile: () => void;
};

export default function DashboardSidebar({
  isMobileOpen,
  onMobileOpenChange,
  onCloseMobile,
}: DashboardSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const visibleNavigation = navigation.filter((item) => {
    if (item.href !== "/dashboard/users") {
      return true;
    }

    return hasCapability(session?.user?.role, "canViewUsers");
  });

  const renderNavItems = (closeOnNavigate: boolean) =>
    visibleNavigation.map((item) => {
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
          onPress={closeOnNavigate ? onCloseMobile : undefined}
        >
          {item.label}
        </Button>
      );
    });

  return (
    <>
      <Drawer
        isOpen={isMobileOpen}
        onOpenChange={onMobileOpenChange}
        placement="left"
        size="sm"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          wrapper: "xl:hidden",
          backdrop: "xl:hidden",
          base: "w-[min(100vw-1rem,280px)] max-w-[280px] sm:max-w-[280px]",
        }}
      >
        <DrawerContent>
          <DrawerBody className="gap-2 px-3 pb-3 pt-14 sm:px-4 sm:pt-16">
            <nav className="flex flex-col gap-2">{renderNavItems(true)}</nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <aside className="hidden w-[280px] shrink-0 border-r border-border bg-card/50 xl:block">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col gap-6 overflow-y-auto px-4 py-6">
          <nav className="space-y-2">{renderNavItems(false)}</nav>
        </div>
      </aside>
    </>
  );
}
