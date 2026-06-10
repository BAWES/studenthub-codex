"use client";

import React from "react";
import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import FadeInSection from "./FadeInSection";

// ── Types ────────────────────────────────────────────────

export interface ComparisonRow {
  category: string;
  feature: string;
  studenthub: boolean | string;
  alternatives: boolean | string;
  emailSpreadsheets: boolean | string;
  traditionalAgencies: boolean | string;
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
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Profile",
    feature: "Profile readiness score",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Search",
    feature: "Typo-tolerant search",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Search",
    feature: "Filter by location, skill, pay rate",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Matching",
    feature: "AI-matched role suggestions",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Matching",
    feature: "Real-time application tracking",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Payments",
    feature: "Integrated timesheets",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Payments",
    feature: "Direct payment tracking",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Documents",
    feature: "Digital document upload and management",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Documents",
    feature: "Compliance document tracking",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
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
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Sourcing",
    feature: "Post to multiple branches at once",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Compliance",
    feature: "Auto right-to-work verification",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Compliance",
    feature: "Expiring certification tracking",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Timesheets",
    feature: "Digital clock-in/clock-out",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Timesheets",
    feature: "Bulk approval workflow",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Billing",
    feature: "Consolidated per-branch invoices",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Billing",
    feature: "Automated VAT calculations",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Analytics",
    feature: "Time-to-hire dashboard",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Analytics",
    feature: "Cost-per-hire tracking",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
];

// ── Staff comparison data ─────────────────────────────────

const staffRows: ComparisonRow[] = [
  {
    category: "Sourcing",
    feature: "Typo-tolerant candidate search",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Sourcing",
    feature: "Search by skill, location, visa status",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Sourcing",
    feature: "Bulk CV export",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Shortlisting",
    feature: "One-click shortlist creation",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Shortlisting",
    feature: "Share shortlists with employers",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Shortlisting",
    feature: "Candidate status tracking",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Timesheets",
    feature: "Integrated timesheet pipeline",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: "Partial",
  },
  {
    category: "Commissions",
    feature: "Automated commission calculations",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Commissions",
    feature: "Real-time margin visibility",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
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
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Users",
    feature: "Full audit logs",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Finance",
    feature: "Bulk invoicing workflow",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Finance",
    feature: "Payment run management",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Finance",
    feature: "Multi-entity reconciliation",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Compliance",
    feature: "Production data validation",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Compliance",
    feature: "Compliance dashboard",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Reports",
    feature: "Custom report builder",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Reports",
    feature: "Scheduled report delivery",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
];

// ── Inspector comparison data ─────────────────────────────

const inspectorRows: ComparisonRow[] = [
  {
    category: "Review",
    feature: "Batch document review",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: "Partial",
    traditionalAgencies: false,
  },
  {
    category: "Review",
    feature: "AI-prioritised queue",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Compliance",
    feature: "Full audit trail per decision",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: "Partial",
    traditionalAgencies: false,
  },
  {
    category: "Compliance",
    feature: "Auto-approve/reject rules",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Exemptions",
    feature: "Flag management workflow",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Exemptions",
    feature: "Separate exemption queue",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
  },
  {
    category: "Reporting",
    feature: "Exportable compliance reports",
    studenthub: true,
    alternatives: "Partial",
    emailSpreadsheets: "Partial",
    traditionalAgencies: false,
  },
  {
    category: "Reporting",
    feature: "Multi-region standards support",
    studenthub: true,
    alternatives: false,
    emailSpreadsheets: false,
    traditionalAgencies: false,
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

// ── Score calculation ──────────────────────────────────

type ScoreValue = boolean | string;

function getScore(value: ScoreValue): "full" | "partial" | "none" {
  if (value === true) return "full";
  if (value === false) return "none";
  if (value === "Partial" || value === "Limited") return "partial";
  return "none";
}

function getScorePercent(value: ScoreValue): number {
  const score = getScore(value);
  if (score === "full") return 100;
  if (score === "partial") return 50;
  return 0;
}

// ── Render helpers ────────────────────────────────────

function ScoreBar({ value }: { value: ScoreValue }) {
  const percent = getScorePercent(value);
  const score = getScore(value);
  const barColor =
    score === "full"
      ? "var(--sh-success)"
      : score === "partial"
        ? "var(--sh-warning)"
        : "var(--sh-glass-border-strong)";

  return (
    <div className="flex items-center gap-2">
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--sh-glass-bg)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percent}%`,
            background: barColor,
            boxShadow: percent > 0 ? `0 0 6px ${barColor}` : "none",
          }}
        />
      </div>
      {score === "full" && <Check className="size-3.5 shrink-0" style={{ color: "var(--sh-success)" }} />}
      {score === "partial" && <Minus className="size-3.5 shrink-0" style={{ color: "var(--sh-warning)" }} />}
      {score === "none" && <X className="size-3.5 shrink-0" style={{ color: "var(--muted)" }} />}
    </div>
  );
}

function ScoreIcon({ value }: { value: ScoreValue }) {
  const score = getScore(value);
  if (score === "full")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--sh-success-bg)]" style={{ color: "var(--sh-success)" }}>
        <Check className="size-3" /> Yes
      </span>
    );
  if (score === "partial")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--sh-warning-bg)]" style={{ color: "var(--sh-warning)" }}>
        <Minus className="size-3" /> Limited
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--sh-glass-bg)", color: "var(--muted)" }}>
      <X className="size-3" /> No
    </span>
  );
}

// ── Category pill colors ─────────────────────────────

const categoryColors: Record<string, string> = {
  Profile: "var(--sh-info)",
  Search: "var(--sh-success)",
  Matching: "#8b5cf6",
  Payments: "#f59e0b",
  Documents: "#ec4899",
  Sourcing: "var(--sh-info)",
  Compliance: "var(--sh-success)",
  Timesheets: "#8b5cf6",
  Billing: "#f59e0b",
  Analytics: "#ec4899",
  Shortlisting: "var(--sh-info)",
  Commissions: "#8b5cf6",
  Users: "var(--sh-info)",
  Finance: "var(--sh-success)",
  Reports: "#8b5cf6",
  Review: "var(--sh-info)",
  Exemptions: "#f59e0b",
  Reporting: "#ec4899",
};

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

  // ── Score summary row — show StudentHub's total advantage ──
  const totalFeatures = rows.length;
  const shFullScore = rows.filter((r) => getScore(r.studenthub) === "full").length;
  const shPercent = Math.round((shFullScore / totalFeatures) * 100);

  return (
    <FadeInSection
      className={cn("shSection", className)}
      aria-label="Feature comparison"
      delay={100}
    >
      <div className="text-center mb-8 md:mb-10">
        <p
          className="text-[11px] font-black uppercase tracking-wider mb-2"
          style={{ color: "var(--sh-info)" }}
        >
          See the difference
        </p>
        <h2 className="shBenefitsTitle text-center">
          {persona === "candidate" && "Why candidates choose StudentHub."}
          {persona === "company" && "Why companies choose StudentHub."}
          {persona !== "candidate" && persona !== "company" && "See how StudentHub compares."}
        </h2>

        {/* Score summary badge */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "var(--sh-info-bg)", color: "var(--sh-info)" }}>
            StudentHub wins on {shFullScore}/{totalFeatures} features
          </span>
        </div>
      </div>

      {/* Desktop: visual table */}
      <div className="hidden md:block overflow-hidden rounded-xl border" style={{ borderColor: "var(--sh-glass-border)" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          {/* Header */}
          <thead>
            <tr>
              <th
                className="text-left p-3 text-xs font-black uppercase tracking-wider min-w-[220px]"
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
                  <span className="flex items-center justify-center gap-1.5">
                    {col.label}
                    {col.accent && (
                      <span className="size-1.5 rounded-full bg-[var(--sh-info)]" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body grouped by category */}
          <tbody>
            {categories.map((cat, ci) => (
              <React.Fragment key={`cat-group-${ci}`}>
                {/* Category header row */}
                <tr>
                  <td
                    colSpan={5}
                    className="p-2 px-3 font-black tracking-wider"
                    style={{
                      background: "var(--sh-glass-bg)",
                      color: categoryColors[cat.category] ?? "var(--muted)",
                      borderBottom: "1px solid var(--sh-glass-border)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {cat.category}
                  </td>
                </tr>
                {cat.rows.map((row, ri) => (
                  <tr
                    key={`${ci}-${ri}`}
                    className="transition-colors duration-150"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--sh-glass-bg)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <td
                      className="p-3 text-sm font-medium"
                      style={{
                        background: "var(--paper)",
                        color: "var(--ink)",
                        borderBottom: "1px solid var(--sh-glass-border)",
                      }}
                    >
                      {row.feature}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="p-3"
                        style={{
                          borderBottom: "1px solid var(--sh-glass-border)",
                          background: col.accent
                            ? "color-mix(in srgb, var(--sh-info-bg) 30%, transparent)"
                            : "transparent",
                        }}
                      >
                        <div className="flex items-center justify-center px-2">
                          <ScoreBar value={row[col.key]} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card-based layout */}
      <div className="md:hidden grid gap-4">
        {categories.map((cat, ci) => (
          <FadeInSection
            key={`mobile-cat-${ci}`}
            asDiv
            className="rounded-xl overflow-hidden border"
            style={{ borderColor: "var(--sh-glass-border)" }}
            delay={ci * 80}
          >
            {/* Category header */}
            <div
              className="p-2.5 px-3 text-[11px] font-black uppercase tracking-wider"
              style={{
                background: "var(--sh-glass-bg)",
                color: categoryColors[cat.category] ?? "var(--muted)",
                borderBottom: "1px solid var(--sh-glass-border)",
              }}
            >
              {cat.category}
            </div>

            {/* Feature cards list */}
            {cat.rows.map((row, ri) => (
              <div
                key={`${ci}-${ri}`}
                className="p-3 grid grid-cols-1 gap-2"
                style={{
                  borderBottom: ri < cat.rows.length - 1 ? "1px solid var(--sh-glass-border)" : "none",
                }}
              >
                <strong className="text-sm" style={{ color: "var(--ink)" }}>
                  {row.feature}
                </strong>
                <div className="grid grid-cols-1 gap-2">
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span
                        className="font-semibold"
                        style={{
                          color: col.accent ? "var(--sh-info)" : "var(--muted)",
                        }}
                      >
                        {col.label}
                      </span>
                      <ScoreIcon value={row[col.key]} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </FadeInSection>
        ))}
      </div>
    </FadeInSection>
  );
}
