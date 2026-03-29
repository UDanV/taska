"use client";

export const DASHBOARD_PREFERENCES_STORAGE_KEY = "taska-dashboard-preferences";
export const DEFAULT_ACCENT_COLOR = "#b77aff";

export const dashboardSectionConfig = {
  overview: {
    title: "Обзор и метрики",
    description: "Приветствие, быстрые действия и главные показатели недели.",
  },
  focus: {
    title: "Фокус дня",
    description: "Показывает текущий план и задачи, на которых стоит сосредоточиться.",
  },
  board: {
    title: "Task board",
    description: "Основная доска со статусами и карточками команды.",
  },
  projects: {
    title: "Проекты",
    description: "Прогресс по активным проектам и количеству задач.",
  },
  insights: {
    title: "Быстрые инсайты",
    description: "Небольшие сводки по дедлайнам и рабочему ритму.",
  },
} as const;

export type DashboardSectionId = keyof typeof dashboardSectionConfig;

export type DashboardSectionVisibility = Record<DashboardSectionId, boolean>;

export type DashboardPreferences = {
  accentColor: string;
  visibleSections: DashboardSectionVisibility;
};

export const dashboardSectionIds = Object.keys(
  dashboardSectionConfig,
) as DashboardSectionId[];

export const defaultVisibleSections: DashboardSectionVisibility = {
  overview: true,
  focus: true,
  board: true,
  projects: true,
  insights: true,
};

export const defaultDashboardPreferences: DashboardPreferences = {
  accentColor: DEFAULT_ACCENT_COLOR,
  visibleSections: defaultVisibleSections,
};
