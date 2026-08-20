"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative size-9 rounded-md hover:bg-[#F5F7FA] dark:hover:bg-white/10 flex items-center justify-center transition-colors"
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-5 text-[#F39C12]" />
        ) : (
          <Moon className="size-5 text-[#2C3E50] dark:text-[#ECF0F1]" />
        )
      ) : (
        <Sun className="size-5 text-transparent" />
      )}
    </button>
  );
}
