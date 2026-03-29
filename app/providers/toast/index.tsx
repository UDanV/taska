"use client";

import { HeroUIProvider } from "@heroui/react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { DashboardPreferencesProvider } from "@/app/shared/providers/dashboard-preferences";

type ProvidersProps = {
  children: React.ReactNode;
  session: Session | null;
};

export function Providers({ children, session }: ProvidersProps) {
  const router = useRouter();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DashboardPreferencesProvider>
        <HeroUIProvider navigate={router.push}>
          <SessionProvider session={session}>{children}</SessionProvider>
          <Toaster richColors position="top-right" expand />
        </HeroUIProvider>
      </DashboardPreferencesProvider>
    </ThemeProvider>
  );
}