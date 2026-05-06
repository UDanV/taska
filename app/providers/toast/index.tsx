"use client";

import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";
import { DashboardPreferencesProvider } from "@/app/shared/providers/dashboard-preferences";

type ProvidersProps = {
  children: React.ReactNode;
  session: Session | null;
};

export function Providers({ children, session }: ProvidersProps) {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DashboardPreferencesProvider>
        <QueryClientProvider client={queryClient}>
          <HeroUIProvider navigate={router.push}>
            <SessionProvider session={session}>
              {children}
            </SessionProvider>
            <Toaster richColors position="top-right" expand />
          </HeroUIProvider>
        </QueryClientProvider>
      </DashboardPreferencesProvider>
    </ThemeProvider>
  );
}