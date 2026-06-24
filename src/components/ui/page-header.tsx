"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PageHeaderBreadcrumb = {
  /** Display label (e.g. "Requests") */
  label: string;
  /** Optional href — renders as a link; plain span when omitted */
  href?: string;
};

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Page title (required) */
  title: string;
  /** Optional breadcrumb trail (e.g. [{label:"Requests", href:"/requests"}, {label:"Detail"}]) */
  breadcrumbs?: PageHeaderBreadcrumb[];
  /** Optional description / subtitle rendered below the title */
  description?: string;
  /** Optional primary action element (button or link) */
  action?: React.ReactNode;
  /** Optional back navigation href for detail pages — renders a chevron-left icon link */
  backHref?: string;
  /** Entrance animation delay in ms (default: 0, max: 400) */
  entranceDelay?: number;
  /** Remove extra bottom margin (for nested or custom-spaced layouts) */
  noSpacing?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  function PageHeader(
    {
      className,
      title,
      breadcrumbs,
      description,
      action,
      backHref,
      entranceDelay = 0,
      noSpacing = false,
      ...props
    },
    ref,
  ) {
    const delay = Math.min(entranceDelay, 400);

    return (
      <div
        ref={ref}
        data-slot="page-header"
        className={cn(
          "shPageHeader",
          noSpacing && "shPageHeader_noSpacing",
          className,
        )}
        style={{ animationDelay: `${delay}ms` }}
        {...props}
      >
        {/* ── Breadcrumbs ───────────────────────────────────────────── */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="shPageHeader-crumbs" aria-label="Breadcrumbs">
            <ol>
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${i}`}>
                    {isLast ? (
                      <span aria-current="page" className="shPageHeader-crumbCurrent">
                        {crumb.label}
                      </span>
                    ) : crumb.href ? (
                      <Link href={crumb.href as any} className="shPageHeader-crumbLink">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="shPageHeader-crumbText">{crumb.label}</span>
                    )}
                    {!isLast && (
                      <ChevronRight
                        className="shPageHeader-crumbChevron"
                        aria-hidden="true"
                        size={14}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* ── Title row ─────────────────────────────────────────────── */}
        <div className="shPageHeader-titleRow">
          <div className="shPageHeader-titleGroup">
            {backHref && (
              <Link
                href={backHref as any}
                className="shPageHeader-back"
                aria-label="Go back"
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </Link>
            )}
            <h1 className="shPageHeader-title">{title}</h1>
          </div>
          {action && (
            <div className="shPageHeader-action">
              {action}
            </div>
          )}
        </div>

        {/* ── Description ───────────────────────────────────────────── */}
        {description && (
          <p className="shPageHeader-desc">{description}</p>
        )}
      </div>
    );
  },
);

export { PageHeader };
