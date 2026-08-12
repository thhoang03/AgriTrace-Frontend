import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeMode = "Light" | "Dark" | "System";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const STORAGE_KEY = "agritrace_theme";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === "Dark") {
    root.classList.add("dark");
  } else if (theme === "Light") {
    root.classList.remove("dark");
  } else {
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", isSystemDark);
  }
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "Light",
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || "Light";
  });

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, []);

  // Keep the DOM class in sync (covers the initial render and any external changes).
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Follow OS theme changes live while in "System" mode.
  useEffect(() => {
    if (theme !== "System") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("System");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
