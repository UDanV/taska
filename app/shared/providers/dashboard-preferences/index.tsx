"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import {
  DASHBOARD_PREFERENCES_STORAGE_KEY,
  DEFAULT_ACCENT_COLOR,
  dashboardSectionIds,
  defaultDashboardPreferences,
  defaultVisibleSections,
  type DashboardPreferences,
  type DashboardSectionId,
} from "@/app/shared/lib/dashboard-preferences";

type DashboardPreferencesContextValue = {
  accentColor: string;
  visibleSections: DashboardPreferences["visibleSections"];
  hydrated: boolean;
  setAccentColor: (color: string) => void;
  toggleSection: (section: DashboardSectionId, enabled: boolean) => void;
  resetPreferences: () => void;
};

const DashboardPreferencesContext =
  createContext<DashboardPreferencesContextValue | null>(null);

const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)));

const normalizeHexColor = (value: string) => {
  const normalized = value.trim();

  if (!/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
    return DEFAULT_ACCENT_COLOR;
  }

  return normalized.toLowerCase();
};

const hexToRgb = (value: string) => {
  const normalized = normalizeHexColor(value).slice(1);

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((channel) => clamp(channel).toString(16).padStart(2, "0"))
    .join("")}`;

const mixColors = (from: string, to: string, ratio: number) => {
  const start = hexToRgb(from);
  const end = hexToRgb(to);

  return rgbToHex(
    start.r + (end.r - start.r) * ratio,
    start.g + (end.g - start.g) * ratio,
    start.b + (end.b - start.b) * ratio,
  );
};

const withAlpha = (color: string, alpha: number) => {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getContrastColor = (color: string) => {
  const { r, g, b } = hexToRgb(color);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.68 ? "#121212" : "#ffffff";
};

const sanitizePreferences = (raw: unknown): DashboardPreferences => {
  if (!raw || typeof raw !== "object") {
    return defaultDashboardPreferences;
  }

  const candidate = raw as Partial<DashboardPreferences>;

  const visibleSections = dashboardSectionIds.reduce(
    (acc, sectionId) => {
      acc[sectionId] =
        typeof candidate.visibleSections?.[sectionId] === "boolean"
          ? candidate.visibleSections[sectionId]
          : defaultVisibleSections[sectionId];

      return acc;
    },
    {} as DashboardPreferences["visibleSections"],
  );

  return {
    accentColor:
      typeof candidate.accentColor === "string"
        ? normalizeHexColor(candidate.accentColor)
        : DEFAULT_ACCENT_COLOR,
    visibleSections,
  };
};

const applyAccentColor = (color: string, isDark: boolean) => {
  const root = document.documentElement;
  const accentColor = normalizeHexColor(color);
  const primaryForeground = getContrastColor(accentColor);
  const secondary = isDark
    ? mixColors(accentColor, "#111114", 0.84)
    : mixColors(accentColor, "#ffffff", 0.8);
  const secondaryForeground = isDark
    ? mixColors(accentColor, "#ffffff", 0.22)
    : mixColors(accentColor, "#111114", 0.35);
  const accent = isDark
    ? mixColors(accentColor, "#15151b", 0.8)
    : mixColors(accentColor, "#ffffff", 0.68);
  const accentForeground = isDark
    ? mixColors(accentColor, "#ffffff", 0.28)
    : mixColors(accentColor, "#111114", 0.18);
  const highlight = isDark
    ? mixColors(accentColor, "#ffffff", 0.2)
    : mixColors(accentColor, "#ff7af0", 0.5);

  root.style.setProperty("--primary", accentColor);
  root.style.setProperty("--primary-foreground", primaryForeground);
  root.style.setProperty("--secondary", secondary);
  root.style.setProperty("--secondary-foreground", secondaryForeground);
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-foreground", accentForeground);
  root.style.setProperty("--ring", accentColor);
  root.style.setProperty("--sidebar-primary", accentColor);
  root.style.setProperty("--sidebar-primary-foreground", primaryForeground);
  root.style.setProperty("--sidebar-accent", secondary);
  root.style.setProperty("--sidebar-accent-foreground", secondaryForeground);
  root.style.setProperty("--sidebar-ring", accentColor);
  root.style.setProperty("--primary-highlight", highlight);
  root.style.setProperty("--primary-glow", withAlpha(accentColor, 0.38));
};

type DashboardPreferencesProviderProps = {
  children: ReactNode;
};

export const DashboardPreferencesProvider = ({
  children,
}: DashboardPreferencesProviderProps) => {
  const { resolvedTheme } = useTheme();
  const [preferences, setPreferences] = useState(defaultDashboardPreferences);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DASHBOARD_PREFERENCES_STORAGE_KEY);

      if (!raw) {
        setHydrated(true);
        return;
      }

      setPreferences(sanitizePreferences(JSON.parse(raw)));
    } catch {
      setPreferences(defaultDashboardPreferences);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      DASHBOARD_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  }, [hydrated, preferences]);

  useEffect(() => {
    applyAccentColor(preferences.accentColor, resolvedTheme === "dark");
  }, [preferences.accentColor, resolvedTheme]);

  const setAccentColor = useCallback((color: string) => {
    setPreferences((current) => ({
      ...current,
      accentColor: normalizeHexColor(color),
    }));
  }, []);

  const toggleSection = useCallback(
    (section: DashboardSectionId, enabled: boolean) => {
      setPreferences((current) => ({
        ...current,
        visibleSections: {
          ...current.visibleSections,
          [section]: enabled,
        },
      }));
    },
    [],
  );

  const resetPreferences = useCallback(() => {
    setPreferences(defaultDashboardPreferences);
  }, []);

  const value = useMemo<DashboardPreferencesContextValue>(
    () => ({
      accentColor: preferences.accentColor,
      visibleSections: preferences.visibleSections,
      hydrated,
      setAccentColor,
      toggleSection,
      resetPreferences,
    }),
    [
      hydrated,
      preferences.accentColor,
      preferences.visibleSections,
      resetPreferences,
      setAccentColor,
      toggleSection,
    ],
  );

  return (
    <DashboardPreferencesContext.Provider value={value}>
      {children}
    </DashboardPreferencesContext.Provider>
  );
};

export const useDashboardPreferences = () => {
  const context = useContext(DashboardPreferencesContext);

  if (!context) {
    throw new Error(
      "useDashboardPreferences must be used within DashboardPreferencesProvider",
    );
  }

  return context;
};
