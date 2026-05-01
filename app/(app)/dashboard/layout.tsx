import type { ReactNode } from "react";
import DashboardShell from "@/app/feature/dashboard/ui/shell";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return <DashboardShell>{children}</DashboardShell>;
}