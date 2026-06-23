"use client";

import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTabProps = {
  href: Route;
  label: string;
  icon: LucideIcon;
  active: boolean;
};

/**
 * Individual navigation tab for the App Header.
 * Renders as a link with icon, label, and active indicator.
 * Uses shadcn button-like styling with Zendesk Coral accents.
 */
export function NavTab({ href, label, icon: Icon, active }: NavTabProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium no-underline transition-colors",
        active
          ? "bg-coral-light text-coral"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      <Icon size={16} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
      <span>{label}</span>
      {active && (
        <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-[1px] bg-coral" />
      )}
    </Link>
  );
}
