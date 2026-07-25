"use client";

import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "./AdminThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useAdminTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="
        flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium
        text-gray-600 dark:text-gray-300
        bg-gray-50 dark:bg-gray-800
        hover:bg-pink-50 dark:hover:bg-pink-500/10
        hover:text-pink-600 dark:hover:text-pink-400
        border border-gray-200 dark:border-gray-700
        transition-all duration-200
        group
      "
    >
      {/* Animated icon */}
      <div className="relative w-4 h-4 shrink-0">
        <Sun
          className={`
            absolute inset-0 w-4 h-4 transition-all duration-300
            ${!isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}
          `}
        />
        <Moon
          className={`
            absolute inset-0 w-4 h-4 transition-all duration-300
            ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}
          `}
        />
      </div>

      {/* Label */}
      <span className="flex-1 text-left text-xs font-semibold">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>

      {/* Toggle pill */}
      <div
        className={`
          relative w-9 h-5 rounded-full transition-colors duration-300 shrink-0
          ${isDark ? "bg-pink-500" : "bg-gray-200 dark:bg-gray-700"}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300
            ${isDark ? "left-[18px]" : "left-0.5"}
          `}
        />
      </div>
    </button>
  );
}
