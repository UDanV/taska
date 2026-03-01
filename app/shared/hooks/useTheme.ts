"use client";

import { useState, useCallback } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
  );

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);

    setTheme(next);
  }, [theme]);

  return { theme, toggleTheme };
};