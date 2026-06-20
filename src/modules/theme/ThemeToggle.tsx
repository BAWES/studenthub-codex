"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("studenthub-theme", next);
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <Button
      aria-pressed={isDark}
      className={cn(
        "w-full min-h-9 flex items-center gap-2 justify-start overflow-hidden",
        "px-[9px] text-xs font-semibold text-muted-foreground",
        className,
      )}
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
    >
      <span className="inline-flex items-center justify-center shrink-0 w-[18px]">
        {isDark ? <Sun size={16} strokeWidth={2.5} aria-hidden="true" /> : <Moon size={16} strokeWidth={2.5} aria-hidden="true" />}
      </span>
      <span className="opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300 delay-[80ms] whitespace-nowrap">
        {isDark ? "Light" : "Dark"}
      </span>
    </Button>
  );
}
