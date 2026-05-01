"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@heroui/button";
import { useTheme } from "@/app/shared/hooks/useTheme";
import { CustomDropdown } from "@/app/shared/components/dropdown";
import { Divider } from "@heroui/react";
import { LogoIcon } from "@/app/shared/components/icons/common";
import Link from "next/link";

type DashboardHeaderProps = {
  onOpenSidebar: () => void;
};

export default function DashboardHeader({ onOpenSidebar }: DashboardHeaderProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="mr-auto flex min-h-10 items-center">
          <button
            type="button"
            className="xl:hidden inline-flex items-center justify-center rounded-xl p-1 text-foreground outline-none ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Открыть меню дашборда"
            onClick={onOpenSidebar}
          >
            <LogoIcon size={48} />
          </button>
          <Link
            href="/dashboard"
            className="hidden items-center justify-center xl:inline-flex"
            aria-label="На главную дашборда"
          >
            <LogoIcon size={48} />
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            onPress={toggleTheme}
            variant="light"
            className="min-w-0 rounded-xl p-2"
            aria-label="Переключить тему"
          >
            <span className="inline-flex h-[18px] w-[18px] items-center justify-center">
              {mounted ? (
                theme === "dark" ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )
              ) : (
                <span className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
            </span>
          </Button>

          <Divider orientation="vertical" className="h-4" />

          <CustomDropdown />
        </div>
      </div>
    </header>
  );
}
