import type { ReactNode } from "react";
import DashboardHeader from "@/app/feature/dashboard/header";
import DashboardSidebar from "@/app/feature/dashboard/sidebar";
import { requireAuthenticatedUser } from "@/app/lib/auth/guards";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await requireAuthenticatedUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader userRole={user.role} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar userRole={user.role} />
        <main className="min-w-0 flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}