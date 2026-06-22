"use client";

import { Sparkles, UserRound, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────

export type SwitcherPersona = "candidate" | "company";

export interface PersonaSwitcherProps {
  active: SwitcherPersona;
  onChange: (persona: SwitcherPersona) => void;
  className?: string;
}

// ── Persona definitions ──────────────────────────────────

interface PersonaDef {
  id: SwitcherPersona;
  label: string;
  subtitle: string;
  icon: typeof Sparkles;
}

const personas: PersonaDef[] = [
  {
    id: "candidate",
    label: "Candidate",
    subtitle: "Find work, get placed",
    icon: UserRound,
  },
  {
    id: "company",
    label: "Company",
    subtitle: "Hire and manage teams",
    icon: Building2,
  },
];

// ── Component ────────────────────────────────────────────

export default function PersonaSwitcher({
  active,
  onChange,
  className,
}: PersonaSwitcherProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl",
        "w-fit mx-auto",
        className,
      )}
      role="tablist"
      aria-label="Select your role to see tailored information"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {personas.map((p) => {
        const Icon = p.icon;
        const isActive = p.id === active;

        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(p.id)}
            className={cn(
              "group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold",
              "transition-all duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
              isActive
                ? "text-[var(--ink)]"
                : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--border)]",
            )}
          >
            {/* Active glow indicator */}
            {isActive && (
              <span
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: "var(--sh-info-bg)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 8px rgba(16,24,40,0.06)",
                }}
              />
            )}

            {/* Shimmer dot on active */}
            {isActive && (
              <span
                className="absolute -top-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full"
                style={{ background: "var(--sh-info)" }}
                aria-hidden="true"
              />
            )}

            {/* Content (relative to sit above the glow) */}
            <span className="relative z-[1] flex items-center gap-2">
              <Icon className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.label.slice(0, 3)}</span>
            </span>

            {/* Subtitle tooltip on hover */}
            <span
              className={cn(
                "absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap",
                "text-[10px] font-medium px-2 py-0.5 rounded-md",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
              )}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              {p.subtitle}
            </span>
          </button>
        );
      })}


    </div>
  );
}
