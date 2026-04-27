import type { ReactNode } from "react";
import DashboardHeader from "@/app/feature/dashboard/header";
import DashboardSidebar from "@/app/feature/dashboard/sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />
      <div className="flex min-h-[calc(100vh-4rem)]">
          <DashboardSidebar />
        <main className="min-w-0 flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}