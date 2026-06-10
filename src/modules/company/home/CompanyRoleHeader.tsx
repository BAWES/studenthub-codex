"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
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
    <GlassPanel variant="subtle" radius="lg" className="p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--sh-info-bg)" }}
        >
          <Building2 className="size-6" style={{ color: "var(--sh-info)" }} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>
            {contactName}
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {contactEmail}
            <span className="mx-2" aria-hidden="true">·</span>
            {linkedCompanyCount} linked {linkedCompanyCount === 1 ? "company" : "companies"}
          </p>
        </div>
      </div>
      <Link
        href="/company/requests/new"
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: "var(--sh-info)", color: "#fff" }}
      >
        <Plus className="size-4" aria-hidden="true" />
        Create Request
      </Link>
    </GlassPanel>
  );
}
