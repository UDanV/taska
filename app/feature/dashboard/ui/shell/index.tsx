"use client";

import type { ReactNode } from "react";
import { useDisclosure } from "@heroui/react";
import DashboardHeader from "@/app/feature/dashboard/ui/header";
import DashboardSidebar from "@/app/feature/dashboard/ui/sidebar";

type DashboardShellProps = {
  children: ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const sidebar = useDisclosure();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader onOpenSidebar={sidebar.onOpen} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar
          isMobileOpen={sidebar.isOpen}
          onMobileOpenChange={sidebar.onOpenChange}
          onCloseMobile={sidebar.onClose}
        />
        <main className="min-w-0 flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}
