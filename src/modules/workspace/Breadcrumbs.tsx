"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";

/**
 * Custom label overrides for path segments that need better labels than
 * the auto-generated Title Case from kebab-case.
 */
const CUSTOM_LABELS: Record<string, string> = {
  "id-requests": "ID Requests",
  "work-logs": "Work Logs",
};

export function humanize(segment: string): string {
  if (segment === "[id]" || segment === "id") return "Detail";
  if (segment === "create") return "New";
  if (CUSTOM_LABELS[segment]) return CUSTOM_LABELS[segment];
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type BreadcrumbItem = {
  label: string;
  href?: Route;
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/") as Route;
    const isLast = i === segments.length - 1;
    return {
      label: humanize(segment),
      href: isLast ? undefined : href,
    };
  });
}

export function Breadcrumbs() {
  const trail = useBreadcrumbs();

  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <ol className="flex items-center gap-1">
        {trail.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground font-medium">
                {item.label}
              </span>
            )}
            {i < trail.length - 1 ? (
              <ChevronRight size={14} aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
