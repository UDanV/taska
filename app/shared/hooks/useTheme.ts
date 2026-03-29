"use client";

import { useMemo } from "react";
import { useTheme as useNextTheme } from "next-themes";

type Theme = "light" | "dark";

export const useTheme = () => {
  const { resolvedTheme, setTheme } = useNextTheme();
  const mounted = typeof resolvedTheme !== "undefined";

  const theme = useMemo<Theme>(
    () => (resolvedTheme === "dark" ? "dark" : "light"),
    [resolvedTheme],
  );

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return { theme, toggleTheme, mounted };
};