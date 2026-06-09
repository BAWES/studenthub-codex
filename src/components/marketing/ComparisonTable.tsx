"use client";

import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────

export interface ComparisonRow {
  category: string;
  feature: string;
  studenthub: boolean | string;
  alternatives: string;
  emailSpreadsheets: string;
  traditionalAgencies: string;
}

export interface ComparisonTableProps {
  persona?: "candidate" | "staff" | "company" | "admin" | "inspector";
  className?: string;
}

// ── Candidate comparison data ────────────────────────────

const candidateRows: ComparisonRow[] = [
  {
    category: "Profile",
    feature: "Unified profile visible to all employers",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Profile",
    feature: "Profile readiness score",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Search",
    feature: "Typo-tolerant search",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Search",
    feature: "Filter by location, skill, pay rate",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Matching",
    feature: "AI-matched role suggestions",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Matching",
    feature: "Real-time application tracking",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Payments",
    feature: "Integrated timesheets",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Payments",
    feature: "Direct payment tracking",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Documents",
    feature: "Digital document upload and management",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Documents",
    feature: "Compliance document tracking",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
];

// ── Company comparison data ────────────────────────────

const companyRows: ComparisonRow[] = [
  {
    category: "Sourcing",
    feature: "AI-matched candidate suggestions",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Sourcing",
    feature: "Post to multiple branches at once",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Compliance",
    feature: "Auto right-to-work verification",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Compliance",
    feature: "Expiring certification tracking",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Timesheets",
    feature: "Digital clock-in/clock-out",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Timesheets",
    feature: "Bulk approval workflow",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Billing",
    feature: "Consolidated per-branch invoices",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Billing",
    feature: "Automated VAT calculations",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Analytics",
    feature: "Time-to-hire dashboard",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Analytics",
    feature: "Cost-per-hire tracking",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
];

// ── Staff comparison data ────────────────────────────

const staffRows: ComparisonRow[] = [
  {
    category: "Candidate Search",
    feature: "Typo-tolerant search across 60+ employer databases",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Candidate Search",
    feature: "Fuzzy name matching for transcription errors",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "CV Management",
    feature: "Bulk CV export and shortlisting",
    studenthub: true,
    alternatives: "Limited",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "CV Management",
    feature: "One-click share to employer",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Timesheets",
    feature: "Digital clock-in/clock-out integrated",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Timesheets",
    feature: "Bulk approval and reconciliation",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Payments",
    feature: "Automated commission and margin calculation",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Payments",
    feature: "Multi-agency payment reconciliation",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Reporting",
    feature: "Team performance and placement velocity dashboard",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Reporting",
    feature: "Real-time margin and commission visibility",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
];

// ── Admin comparison data ────────────────────────────

const adminRows: ComparisonRow[] = [
  {
    category: "User Management",
    feature: "Role-based access and permission controls",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "User Management",
    feature: "Unified user directory across all roles",
    studenthub: true,
    alternatives: "Limited",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Finance",
    feature: "Bulk invoicing and consolidated billing",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Finance",
    feature: "Automated VAT calculations",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Compliance",
    feature: "Auto right-to-work document verification",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Compliance",
    feature: "Expiring certification tracking and alerts",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Payroll",
    feature: "Bulk payment run preparation and approval",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Payroll",
    feature: "Production-data validation tools",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Reporting",
    feature: "System-wide audit logs and export",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Reporting",
    feature: "Real-time financial and operational dashboards",
    studenthub: true,
    alternatives: "Limited",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
];

// ── Inspector comparison data ────────────────────────

const inspectorRows: ComparisonRow[] = [
  {
    category: "Document Review",
    feature: "Batch civil ID and certification review",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Document Review",
    feature: "One-click approve/reject with audit trail",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Audit",
    feature: "Full timestamps and reviewer attribution per decision",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Audit",
    feature: "Audit-ready report export for regulators",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Queue Management",
    feature: "AI-prioritized queue — urgent items first",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Queue Management",
    feature: "Batch-level operations (approve/reject all)",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Exemptions",
    feature: "Dedicated exemption queue separate from standard flow",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Exemptions",
    feature: "Flagged document tracking and resolution workflow",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Compliance",
    feature: "Multi-region document standard support",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Compliance",
    feature: "Approval rate and rejection analytics",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
];

// ── Comparison data per persona ─────────────────────────

const personaRows: Record<string, ComparisonRow[]> = {
  candidate: candidateRows,
  staff: staffRows,
  company: companyRows,
  admin: adminRows,
  inspector: inspectorRows,
};

// ── Grouped rendering ────────────────────────────────────

const columns = [
  { key: "studenthub" as const, label: "StudentHub", accent: true },
  { key: "alternatives" as const, label: "Generic job boards" },
  { key: "emailSpreadsheets" as const, label: "Email & spreadsheets" },
  { key: "traditionalAgencies" as const, label: "Traditional agencies" },
];

function renderCell(value: boolean | string) {
  if (value === true)
    return <Check className="size-4" style={{ color: "var(--sh-success)" }} aria-label="Yes" />;
  if (value === false || value === "✗")
    return <X className="size-4" style={{ color: "var(--muted)" }} aria-label="No" />;
  if (value === "Partial" || value === "Limited")
    return <Minus className="size-4" style={{ color: "var(--sh-warning)" }} aria-label="Limited" />;
  return <span className="text-xs" style={{ color: "var(--muted)" }}>{value}</span>;
}

// ── Component ────────────────────────────────────────────

export default function ComparisonTable({ persona = "candidate", className }: ComparisonTableProps) {
  const rows = personaRows[persona] ?? candidateRows;

  // Group by category
  const categories = rows.reduce<{ category: string; rows: ComparisonRow[] }[]>((acc, row) => {
    const existing = acc.find((c) => c.category === row.category);
    if (existing) existing.rows.push(row);
    else acc.push({ category: row.category, rows: [row] });
    return acc;
  }, []);

  return (
    <section className={cn("shSection", className)} aria-label="Feature comparison">
      <div className="text-center mb-8 md:mb-10">
        <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
          See the difference
        </p>
        <h2 className="shBenefitsTitle text-center">
          {persona === "candidate" && "Why candidates choose StudentHub."}
          {persona === "staff" && "Why staffing agencies choose StudentHub."}
          {persona === "company" && "Why companies choose StudentHub."}
          {persona === "admin" && "Why operations teams choose StudentHub."}
          {persona === "inspector" && "Why inspection teams choose StudentHub."}
        </h2>
      </div>

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--sh-glass-border)" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          {/* Header */}
          <thead>
            <tr>
              <th
                className="text-left p-3 text-xs font-black uppercase tracking-wider sticky left-0 z-10 min-w-[220px]"
                style={{
                  background: "var(--sh-glass-bg-strong)",
                  color: "var(--ink)",
                  borderBottom: "1px solid var(--sh-glass-border)",
                }}
              >
                Feature
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-center p-3 text-xs font-black uppercase tracking-wider min-w-[130px]"
                  style={{
                    background: col.accent
                      ? "linear-gradient(180deg, var(--sh-info-bg), var(--sh-glass-bg-strong))"
                      : "var(--sh-glass-bg-strong)",
                    color: col.accent ? "var(--sh-info)" : "var(--muted)",
                    borderBottom: "1px solid var(--sh-glass-border)",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body grouped by category */}
          <tbody>
            {categories.map((cat, ci) => (
              <>
                {/* Category header row */}
                <tr key={`cat-${ci}`}>
                  <td
                    colSpan={5}
                    className="p-2 px-3 text-[10px] font-black uppercase tracking-wider"
                    style={{
                      background: "var(--sh-glass-bg)",
                      color: "var(--muted)",
                      borderBottom: "1px solid var(--sh-glass-border)",
                    }}
                  >
                    {cat.category}
                  </td>
                </tr>
                {cat.rows.map((row, ri) => (
                  <tr
                    key={`${ci}-${ri}`}
                    className="transition-colors duration-150"
                    style={{
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--sh-glass-bg)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <td
                      className="p-3 sticky left-0 z-10 text-sm"
                      style={{
                        background: "var(--paper)",
                        color: "var(--ink)",
                        borderBottom: "1px solid var(--sh-glass-border)",
                        fontWeight: 500,
                      }}
                    >
                      {row.feature}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="text-center p-3"
                        style={{
                          borderBottom: "1px solid var(--sh-glass-border)",
                          background: col.accent ? "color-mix(in srgb, var(--sh-info-bg) 30%, transparent)" : "transparent",
                        }}
                      >
                        <div className="flex items-center justify-center">
                          {renderCell(row[col.key])}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
