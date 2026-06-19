"use client";

import React from "react";
import { Check, X, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SH_BLUE = "#0b63ce";
const SH_AMBER = "#f59e0b";

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
  persona?: "candidate" | "company";
  className?: string;
}

// ── Column labels ────────────────────────────────────────

interface ColumnDef {
  key: "studenthub" | "alternatives" | "emailSpreadsheets" | "traditionalAgencies";
  label: string;
  accent?: boolean;
}

const sharedColumns: ColumnDef[] = [
  { key: "studenthub", label: "StudentHub", accent: true },
  { key: "alternatives", label: "Job boards" },
  { key: "emailSpreadsheets", label: "Email & sheets" },
  { key: "traditionalAgencies", label: "Agencies" },
];

// ── Data ─────────────────────────────────────────────────

const candidateRows: ComparisonRow[] = [
  { category: "Profile", feature: "Unified profile visible to all employers", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Profile", feature: "Profile readiness score", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Search", feature: "Typo-tolerant search", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Search", feature: "Filter by location, skill, pay", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Matching", feature: "Staff-matched role suggestions", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Matching", feature: "Real-time application tracking", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Payments", feature: "Integrated timesheets", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Payments", feature: "Direct payment tracking", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Documents", feature: "Digital document management", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Documents", feature: "Compliance tracking", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
];

const companyRows: ComparisonRow[] = [
  { category: "Sourcing", feature: "Staff-matched candidates", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Sourcing", feature: "Post to multiple branches", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Compliance", feature: "Right-to-work verification", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Compliance", feature: "Certification tracking", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Timesheets", feature: "Digital clock-in/out", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Timesheets", feature: "Bulk approval workflow", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Billing", feature: "Consolidated per-branch invoices", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Billing", feature: "Automated VAT", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Analytics", feature: "Time-to-hire dashboard", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Analytics", feature: "Cost-per-hire tracking", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
];

const personaRows: Record<string, ComparisonRow[]> = {
  candidate: candidateRows,
  company: companyRows,
};

// ── Score helpers ────────────────────────────────────────

type ScoreValue = boolean | string;

function getScore(value: ScoreValue): "full" | "partial" | "none" {
  if (value === true) return "full";
  if (value === false) return "none";
  if (value === "Partial" || value === "Limited") return "partial";
  return "none";
}

function ScoreDot({ value }: { value: ScoreValue }) {
  const score = getScore(value);
  const cls = score === "full" ? "shLandingScoreDot shLandingScoreFull"
    : score === "partial" ? "shLandingScoreDot shLandingScorePartial"
    : "shLandingScoreDot shLandingScoreNone";
  return <span className={cls} />;
}

// ── Component ────────────────────────────────────────────

export default function ComparisonTable({ persona = "candidate", className }: ComparisonTableProps) {
  const rows = personaRows[persona] ?? candidateRows;
  const columns = sharedColumns;
  const totalFeatures = rows.length;
  const shFullScore = rows.filter((r) => getScore(r.studenthub) === "full").length;

  // Group by category
  const categories = rows.reduce<{ category: string; rows: ComparisonRow[] }[]>((acc, row) => {
    const existing = acc.find((c) => c.category === row.category);
    if (existing) existing.rows.push(row);
    else acc.push({ category: row.category, rows: [row] });
    return acc;
  }, []);

  return (
    <section
      className={cn("scroll-mt-20", className)}
      aria-label="Feature comparison"
    >
      <div className="text-center mb-8 md:mb-10">
        <span className="shLandingEyebrow">
          <Sparkles className="size-3" />
          See the difference
        </span>
        <h2 className="shLandingSectionTitle mt-3">
          {persona === "candidate"
            ? "Why students choose StudentHub."
            : "Why companies choose StudentHub."}
        </h2>
        <p className="shLandingSectionSub mx-auto mt-2">
          {persona === "candidate"
            ? "StudentHub gives you tools that job boards and agencies can't match."
            : "One platform replaces four legacy tools."}
        </p>
      </div>

      {/* Score summary */}
      <div className="max-w-[600px] mx-auto mb-6">
        <div
          className="rounded-xl p-4 flex items-center justify-center gap-3"
          style={{
            background: `linear-gradient(135deg, ${SH_BLUE}08, ${SH_BLUE}04)`,
            border: `1px solid ${SH_BLUE}20`,
          }}
        >
          <span className="shLandingScoreDot shLandingScoreFull" />
          <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            StudentHub scores{" "}
            <span style={{ color: SH_BLUE }}>
              {shFullScore}/{totalFeatures}
            </span>{" "}
            features — more than any alternative.
          </span>
        </div>
      </div>

      {/* Desktop: glass table */}
      <div
        className="hidden md:block overflow-x-auto rounded-xl"
        style={{
          backgroundColor: "var(--sh-glass-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--sh-glass-border)",
        }}
      >
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                className="text-left p-3 text-xs font-semibold"
                style={{
                  color: "var(--muted)",
                  backgroundColor: "var(--sh-glass-bg-strong)",
                  borderBottom: "1px solid var(--sh-glass-border)",
                  minWidth: 200,
                }}
              >
                Feature
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-center p-3 text-xs font-semibold"
                  style={{
                    color: col.accent ? SH_BLUE : "var(--muted)",
                    backgroundColor: col.accent
                      ? `${SH_BLUE}06`
                      : "var(--sh-glass-bg-strong)",
                    borderBottom: "1px solid var(--sh-glass-border)",
                    minWidth: 120,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <React.Fragment key={cat.category}>
                {/* Category header row */}
                <tr>
                  <td
                    colSpan={5}
                    className="text-[10px] font-bold uppercase tracking-wider p-2 px-3"
                    style={{
                      color: SH_BLUE,
                      backgroundColor: `${SH_BLUE}04`,
                      borderBottom: "1px solid var(--sh-glass-border)",
                    }}
                  >
                    {cat.category}
                  </td>
                </tr>
                {cat.rows.map((row, ri) => (
                  <tr
                    key={`${cat.category}-${ri}`}
                    className="transition-colors duration-150"
                    style={{
                      backgroundColor:
                        ri % 2 === 0 ? "var(--sh-glass-bg)" : "transparent",
                    }}
                  >
                    <td
                      className="p-3 text-xs"
                      style={{
                        color: "var(--ink)",
                        borderBottom: "1px solid var(--sh-glass-border)",
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
                          backgroundColor: col.accent
                            ? `${SH_BLUE}04`
                            : "transparent",
                        }}
                      >
                        <ScoreDot value={row[col.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: accordion list */}
      <div className="md:hidden grid gap-3">
        {categories.map((cat) => (
          <div
            key={cat.category}
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "var(--sh-glass-bg)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--sh-glass-border)",
            }}
          >
            <div
              className="p-3 text-[11px] font-bold uppercase tracking-wider"
              style={{
                color: SH_BLUE,
                backgroundColor: `${SH_BLUE}08`,
                borderBottom: "1px solid var(--sh-glass-border)",
              }}
            >
              {cat.category}
            </div>
            {cat.rows.map((row, ri) => (
              <div
                key={`${cat.category}-${ri}`}
                className="p-3"
                style={{
                  borderBottom:
                    ri < cat.rows.length - 1 ? "1px solid var(--sh-glass-border)" : "none",
                }}
              >
                <strong
                  className="text-sm block mb-2"
                  style={{ color: "var(--ink)" }}
                >
                  {row.feature}
                </strong>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className="flex items-center justify-between gap-2"
                    >
                      <span
                        className="font-medium"
                        style={{
                          color: col.accent ? SH_BLUE : "var(--muted)",
                        }}
                      >
                        {col.label}
                      </span>
                      <ScoreDot value={row[col.key]} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-[10px]" style={{ color: "var(--muted)" }}>
          Based on {totalFeatures} features compared.
        </p>
      </div>
    </section>
  );
}
