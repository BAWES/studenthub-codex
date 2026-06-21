"use client";

import { Building2, Plus } from "lucide-react";
import Link from "next/link";

type CompanyRoleHeaderProps = {
  contactName: string;
  contactEmail: string;
  linkedCompanyCount: number;
};

/**
 * CompanyRoleHeader — top banner for the company workspace.
 * Shows contact info, linked company count, and a Create Request CTA.
 */
export function CompanyRoleHeader({
  contactName,
  contactEmail,
  linkedCompanyCount,
}: CompanyRoleHeaderProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
          <Building2 className="size-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {contactName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {contactEmail}
            <span className="mx-2" aria-hidden="true">·</span>
            {linkedCompanyCount} linked {linkedCompanyCount === 1 ? "company" : "companies"}
          </p>
        </div>
      </div>
      <Link
        href="/company/requests/new"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
      >
        <Plus className="size-4" aria-hidden="true" />
        Create Request
      </Link>
    </div>
  );
}
