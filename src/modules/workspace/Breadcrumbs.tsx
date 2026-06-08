"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";

export function humanize(segment: string): string {
  if (segment === "[id]" || segment === "id") return "Detail";
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
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {trail.map((item, i) => (
          <li key={i}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {i < trail.length - 1 ? (
              <ChevronRight className="breadcrumbSep" size={14} aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
