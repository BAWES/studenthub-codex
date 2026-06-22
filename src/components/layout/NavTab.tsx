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
 * Individual navigation tab for the OS Glass App Header.
 * Renders as a link with icon, label, and animated active indicator.
 */
export function NavTab({ href, label, icon: Icon, active }: NavTabProps) {
  return (
    <Link
      href={href}
      className={cn(
        "shAppHeaderTab",
        active ? "shAppHeaderTabActive" : "shAppHeaderTabInactive",
      )}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      <Icon size={16} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
      <span>{label}</span>
      {active && <span className="shAppHeaderTabActiveIndicator" />}
    </Link>
  );
}
