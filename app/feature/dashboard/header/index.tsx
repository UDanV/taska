"use client";

import { Search, Plus, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@heroui/button";
import type { AppRole } from "@/app/lib/auth/roles";
import { Input } from "@/app/shared/components/ui/input";
import { hasCapability } from "@/app/lib/auth/roles";
import { useTheme } from "@/app/shared/hooks/useTheme";
import { CustomDropdown } from "@/app/shared/components/dropdown";
import { Divider } from "@heroui/react";

type DashboardHeaderProps = {
  userRole: AppRole;
};

export default function DashboardHeader({ userRole }: DashboardHeaderProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const canManageTasks = hasCapability(userRole, "canManageTasks");

  const handleCreateTask = () => {
    window.dispatchEvent(new Event("taska:create-task"));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4">

        <div className="relative hidden w-full max-w-2xl md:flex md:items-center md:gap-2">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Поиск задач, проектов и заметок..."
            className="h-11 border-border bg-card pl-10 rounded-xl"
          />
          <Button
            color={canManageTasks ? "primary" : "default"}
            className="w-full max-w-40 rounded-xl"
            startContent={<Plus size={16} className="flex-shrink-0" />}
            isDisabled={!canManageTasks}
            onPress={handleCreateTask}
          >
            {canManageTasks ? "Новая задача" : "Только просмотр"}
          </Button>
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

          <Button variant="light" className="min-w-0 rounded-xl p-2">
            <Bell size={18} />
          </Button>

          <Divider orientation="vertical" className="h-4" />

          <CustomDropdown />
        </div>
      </div>
    </header>
  );
}
