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

// ── Column labels per persona ─────────────────────────────

interface ColumnDef {
  key: "studenthub" | "alternatives" | "emailSpreadsheets" | "traditionalAgencies";
  label: string;
  accent?: boolean;
}

const personaColumns: Record<string, ColumnDef[]> = {
  candidate: [
    { key: "studenthub", label: "StudentHub", accent: true },
    { key: "alternatives", label: "Generic job boards" },
    { key: "emailSpreadsheets", label: "Email & spreadsheets" },
    { key: "traditionalAgencies", label: "Traditional agencies" },
  ],
  company: [
    { key: "studenthub", label: "StudentHub", accent: true },
    { key: "alternatives", label: "Generic job boards" },
    { key: "emailSpreadsheets", label: "Email & spreadsheets" },
    { key: "traditionalAgencies", label: "Traditional agencies" },
  ],
  staff: [
    { key: "studenthub", label: "StudentHub", accent: true },
    { key: "alternatives", label: "Generic job boards" },
    { key: "emailSpreadsheets", label: "Email & spreadsheets" },
    { key: "traditionalAgencies", label: "Traditional agencies" },
  ],
  admin: [
    { key: "studenthub", label: "StudentHub", accent: true },
    { key: "alternatives", label: "Generic ERPs" },
    { key: "emailSpreadsheets", label: "Email & spreadsheets" },
    { key: "traditionalAgencies", label: "Manual processes" },
  ],
  inspector: [
    { key: "studenthub", label: "StudentHub", accent: true },
    { key: "alternatives", label: "Paper-based systems" },
    { key: "emailSpreadsheets", label: "Generic document tools" },
    { key: "traditionalAgencies", label: "Manual review" },
  ],
};

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

// ── Staff comparison data ─────────────────────────────────

const staffRows: ComparisonRow[] = [
  {
    category: "Sourcing",
    feature: "Typo-tolerant candidate search",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Sourcing",
    feature: "Search by skill, location, visa status",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Sourcing",
    feature: "Bulk CV export",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Shortlisting",
    feature: "One-click shortlist creation",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Shortlisting",
    feature: "Share shortlists with employers",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Shortlisting",
    feature: "Candidate status tracking",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Timesheets",
    feature: "Integrated timesheet pipeline",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
  {
    category: "Commissions",
    feature: "Automated commission calculations",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Commissions",
    feature: "Real-time margin visibility",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "Partial",
  },
];

// ── Admin comparison data ─────────────────────────────────

const adminRows: ComparisonRow[] = [
  {
    category: "Users",
    feature: "Role-based access control",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Users",
    feature: "Full audit logs",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Finance",
    feature: "Bulk invoicing workflow",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Finance",
    feature: "Payment run management",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Finance",
    feature: "Multi-entity reconciliation",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Compliance",
    feature: "Production data validation",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Compliance",
    feature: "Compliance dashboard",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Reports",
    feature: "Custom report builder",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Reports",
    feature: "Scheduled report delivery",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
];

// ── Inspector comparison data ─────────────────────────────

const inspectorRows: ComparisonRow[] = [
  {
    category: "Review",
    feature: "Batch document review",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "Partial",
    traditionalAgencies: "✗",
  },
  {
    category: "Review",
    feature: "AI-prioritised queue",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Compliance",
    feature: "Full audit trail per decision",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "Partial",
    traditionalAgencies: "✗",
  },
  {
    category: "Compliance",
    feature: "Auto-approve/reject rules",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Exemptions",
    feature: "Flag management workflow",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Exemptions",
    feature: "Separate exemption queue",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
  {
    category: "Reporting",
    feature: "Exportable compliance reports",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "Partial",
    traditionalAgencies: "✗",
  },
  {
    category: "Reporting",
    feature: "Multi-region standards support",
    studenthub: true,
    alternatives: "✗",
    emailSpreadsheets: "✗",
    traditionalAgencies: "✗",
  },
];

// ── Comparison data per persona ─────────────────────────

const personaRows: Record<string, ComparisonRow[]> = {
  candidate: candidateRows,
  company: companyRows,
  staff: staffRows,
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
  const columns = personaColumns[persona] ?? personaColumns.candidate;

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
          {persona === "company" && "Why companies choose StudentHub."}
          {persona !== "candidate" && persona !== "company" && "See how StudentHub compares."}
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
