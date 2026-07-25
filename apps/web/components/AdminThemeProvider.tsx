"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

export function useAdminTheme() {
  return useContext(ThemeContext);
}

export function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Read preference from localStorage on mount, fallback to system preference
  useEffect(() => {
    const stored = localStorage.getItem("admin-theme") as Theme | null;
    const preferred =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(preferred);
    setMounted(true);
  }, []);

  function toggle() {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("admin-theme", next);
      return next;
    });
  }

  // Prevent flash of unstyled content — render invisible until hydrated
  if (!mounted) {
    return (
      <div
        className="flex min-h-screen bg-[#f7f8fc] antialiased font-sans"
        style={{ visibility: "hidden" }}
      >
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className={theme === "dark" ? "dark" : ""}>{children}</div>
    </ThemeContext.Provider>
  );
}
