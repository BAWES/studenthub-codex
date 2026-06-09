"use client";

import { useState } from "react";
import { CheckCircle2, X, Minus, ArrowUpRight, ChevronDown } from "lucide-react";
import type { Persona } from "./HeroSection";

// ── Comparison data per persona ──────────────────────────────────────────

export interface ComparisonRow {
  feature: string;
  studenthub: boolean | string;
  competitor1: boolean | string;
  competitor2: boolean | string;
  competitor3?: boolean | string;
}

interface ComparisonConfig {
  title: string;
  subtitle: string;
  competitor1Name: string;
  competitor2Name: string;
  competitor3Name?: string;
  rows: ComparisonRow[];
}

const comparisonsByPersona: Record<Persona, ComparisonConfig> = {
  candidate: {
    title: "How StudentHub compares",
    subtitle:
      "Other platforms make you juggle spreadsheets, email chains, and separate payroll tools. StudentHub does it all in one place.",
    competitor1Name: "Generic job boards",
    competitor2Name: "Agency-only platforms",
    competitor3Name: "DIY (spreadsheets)",
    rows: [
      {
        feature: "Free profile & unlimited applications",
        studenthub: true,
        competitor1: true,
        competitor2: false,
        competitor3: true,
      },
      {
        feature: "Real-time application tracking",
        studenthub: true,
        competitor1: "Manual only",
        competitor2: true,
        competitor3: "Spreadsheet",
      },
      {
        feature: "One-tap timesheets",
        studenthub: true,
        competitor1: false,
        competitor2: false,
        competitor3: "Manual",
      },
      {
        feature: "Weekly payments in-app",
        studenthub: true,
        competitor1: false,
        competitor2: "Weekly",
        competitor3: "Varies",
      },
      {
        feature: "Profile visible to 60+ employers",
        studenthub: true,
        competitor1: "Apply per job",
        competitor2: "Agency pool only",
        competitor3: "N/A",
      },
      {
        feature: "CV + portfolio management",
        studenthub: true,
        competitor1: "Basic upload",
        competitor2: true,
        competitor3: true,
      },
      {
        feature: "Employer-reviewed matching",
        studenthub: true,
        competitor1: false,
        competitor2: "Agency-led",
        competitor3: false,
      },
      {
        feature: "Mobile app for logging hours",
        studenthub: true,
        competitor1: false,
        competitor2: false,
        competitor3: false,
      },
    ],
  },
  staff: {
    title: "Built for placement speed",
    subtitle:
      "Most staffing tools give you search OR payroll OR reporting — never all three in one desk. StudentHub unifies every step.",
    competitor1Name: "Bullhorn",
    competitor2Name: "Vincere",
    competitor3Name: "Email + spreadsheets",
    rows: [
      {
        feature: "Typo-tolerant candidate search",
        studenthub: true,
        competitor1: "Exact match only",
        competitor2: "Exact match only",
        competitor3: false,
      },
      {
        feature: "Bulk CV export & shortlisting",
        studenthub: true,
        competitor1: true,
        competitor2: true,
        competitor3: "Manual",
      },
      {
        feature: "Integrated timesheets & payroll",
        studenthub: true,
        competitor1: "Add-on module",
        competitor2: "Add-on module",
        competitor3: "Separate system",
      },
      {
        feature: "End-to-end pipeline tracking",
        studenthub: true,
        competitor1: true,
        competitor2: true,
        competitor3: false,
      },
      {
        feature: "Multi-client management",
        studenthub: true,
        competitor1: "Per-seat pricing",
        competitor2: "Per-seat pricing",
        competitor3: true,
      },
      {
        feature: "Unified invoicing",
        studenthub: true,
        competitor1: "Add-on",
        competitor2: "Limited",
        competitor3: "Spreadsheet",
      },
      {
        feature: "Real-time compliance checks",
        studenthub: true,
        competitor1: false,
        competitor2: false,
        competitor3: false,
      },
      {
        feature: "Pricing (per agent / month)",
        studenthub: "From £49",
        competitor1: "£100-300",
        competitor2: "£80-200",
        competitor3: "£0 (time cost)",
      },
    ],
  },
  company: {
    title: "Hiring without the overhead",
    subtitle:
      "Comparing StudentHub to traditional agency-led hiring or direct recruitment platforms.",
    competitor1Name: "Direct agency",
    competitor2Name: "LinkedIn Recruiter",
    competitor3Name: "Indeed",
    rows: [
      {
        feature: "AI-matched candidate suggestions",
        studenthub: true,
        competitor1: false,
        competitor2: "Manual search",
        competitor3: "Keyword search",
      },
      {
        feature: "Real-time timesheet approvals",
        studenthub: true,
        competitor1: "Paper/email",
        competitor2: false,
        competitor3: false,
      },
      {
        feature: "Consolidated monthly invoicing",
        studenthub: true,
        competitor1: "Per-agency",
        competitor2: false,
        competitor3: false,
      },
      {
        feature: "Multi-location management",
        studenthub: true,
        competitor1: "Per location",
        competitor2: true,
        competitor3: true,
      },
      {
        feature: "Direct candidate pool access",
        studenthub: true,
        competitor1: "Agency-owned",
        competitor2: "Passive only",
        competitor3: "Active only",
      },
      {
        feature: "Compliance & right-to-work checks",
        studenthub: true,
        competitor1: "Agency handles",
        competitor2: false,
        competitor3: false,
      },
      {
        feature: "Pricing",
        studenthub: "From £99/mo",
        competitor1: "20-35% margin",
        competitor2: "£600+/seat/yr",
        competitor3: "Per job post",
      },
    ],
  },
  admin: {
    title: "Enterprise control without the complexity",
    subtitle:
      "Traditional admin tools are either too basic (spreadsheets) or too rigid (SAP/Oracle). StudentHub sits in the middle.",
    competitor1Name: "Spreadsheets",
    competitor2Name: "SAP SuccessFactors",
    rows: [
      {
        feature: "Role-based access control",
        studenthub: true,
        competitor1: false,
        competitor2: true,
      },
      {
        feature: "Bulk invoicing & payment runs",
        studenthub: true,
        competitor1: "Manual",
        competitor2: true,
      },
      {
        feature: "Real-time compliance dashboards",
        studenthub: true,
        competitor1: false,
        competitor2: "Add-on module",
      },
      {
        feature: "Full audit trail exports",
        studenthub: true,
        competitor1: false,
        competitor2: true,
      },
      {
        feature: "User management & permissions",
        studenthub: true,
        competitor1: false,
        competitor2: true,
      },
      {
        feature: "Integration with existing tools",
        studenthub: "API + webhooks",
        competitor1: false,
        competitor2: "Custom dev required",
      },
      {
        feature: "Setup time",
        studenthub: "Days",
        competitor1: "Instant",
        competitor2: "6-12 months",
      },
    ],
  },
  inspector: {
    title: "Compliance without the clutter",
    subtitle:
      "Most inspection workflows are scattered across email, shared drives, and paper forms. StudentHub gives you one queue.",
    competitor1Name: "Email + spreadsheets",
    competitor2Name: "SharePoint/Google Drive",
    rows: [
      {
        feature: "Batch document review queue",
        studenthub: true,
        competitor1: "Per-email",
        competitor2: "Folder-based",
      },
      {
        feature: "Approve/reject workflow",
        studenthub: true,
        competitor1: "Reply-all",
        competitor2: "Manual",
      },
      {
        feature: "Full audit trail",
        studenthub: true,
        competitor1: "Email archive",
        competitor2: "Version history",
      },
      {
        feature: "Exemption flagging",
        studenthub: true,
        competitor1: "Manual memo",
        competitor2: "Manual",
      },
      {
        feature: "Reporting & analytics",
        studenthub: true,
        competitor1: "Manual tally",
        competitor2: "Basic filters",
      },
      {
        feature: "Separate from placement ops",
        studenthub: true,
        competitor1: false,
        competitor2: "Requires separate tenant",
      },
      {
        feature: "Pricing",
        studenthub: "From £149/mo",
        competitor1: "£0 (time cost)",
        competitor2: "£5-15/seat/mo",
      },
    ],
  },
};

// ── Props ────────────────────────────────────────────────────────────────

export interface ComparisonTableProps {
  persona?: Persona;
}

// ── Cell renderer ────────────────────────────────────────────────────────

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2
        className="size-4 shrink-0"
        style={{ color: "var(--sh-success)" }}
        aria-label="Yes"
      />
    ) : (
      <X className="size-4 shrink-0" style={{ color: "var(--muted)" }} aria-label="No" />
    );
  }

  // String value — might be a "negative" indicator
  const isNegative =
    value.toLowerCase().startsWith("no") ||
    value === "N/A" ||
    value === "Manual" ||
    value === "Spreadsheet" ||
    value.startsWith("£0");
  const isPositive =
    value.toLowerCase().startsWith("yes") ||
    value.toLowerCase().startsWith("from £") ||
    value === "Days" ||
    value === "API + webhooks";

  return (
    <span
      className="text-xs leading-tight"
      style={{
        color: isNegative
          ? "var(--sh-danger)"
          : isPositive
            ? "var(--sh-success)"
            : "var(--muted)",
        fontWeight: isPositive ? 600 : 400,
      }}
    >
      {value}
    </span>
  );
}

// ── Component ────────────────────────────────────────────────────────────

export default function ComparisonTable({ persona = "candidate" }: ComparisonTableProps) {
  const config = comparisonsByPersona[persona] ?? comparisonsByPersona.candidate;
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? config.rows : config.rows.slice(0, 5);
  const hasMore = config.rows.length > 5;

  return (
    <section className="shSection" aria-label={`StudentHub vs alternatives for ${persona}s`}>
      <div className="text-center max-w-[640px] mx-auto mb-8">
        <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
          Comparison
        </p>
        <h2 className="text-[clamp(22px,3.2vw,38px)] font-bold leading-[1.1] mb-2">
          {config.title}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {config.subtitle}
        </p>
      </div>

      <div
        className="overflow-hidden rounded-xl"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
      >
        {/* Scrollable wrapper for small screens */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 580 }}>
            {/* ── Header ── */}
            <thead>
              <tr>
                <th
                  className="sticky left-0 z-[2] p-4 text-xs font-black uppercase tracking-wider min-w-[180px]"
                  style={{
                    color: "var(--ink)",
                    background: "var(--sh-glass-bg-strong)",
                    borderBottom: "1px solid var(--sh-glass-border)",
                  }}
                >
                  Feature
                </th>
                <th
                  className="p-4 text-xs font-black uppercase tracking-wider text-center min-w-[120px]"
                  style={{
                    color: "var(--sh-info)",
                    background: "var(--sh-info-bg)",
                    borderBottom: "1px solid var(--sh-glass-border)",
                  }}
                >
                  StudentHub
                </th>
                {[config.competitor1Name, config.competitor2Name, config.competitor3Name]
                  .filter(Boolean)
                  .map((name) => (
                    <th
                      key={name}
                      className="p-4 text-xs font-semibold text-center min-w-[120px]"
                      style={{
                        color: "var(--muted)",
                        background: "var(--sh-glass-bg-strong)",
                        borderBottom: "1px solid var(--sh-glass-border)",
                      }}
                    >
                      {name}
                    </th>
                  ))}
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody>
              {visibleRows.map((row, i) => {
                const competitors = [
                  row.competitor1,
                  row.competitor2,
                  row.competitor3,
                ].filter((c) => c !== undefined);

                return (
                  <tr
                    key={row.feature}
                    className="transition-colors duration-150"
                    style={{
                      background:
                        i % 2 === 0 ? "transparent" : "color-mix(in srgb, var(--sh-glass-bg) 50%, transparent)",
                    }}
                  >
                    <td
                      className="sticky left-0 z-[1] p-4 text-sm font-medium"
                      style={{
                        color: "var(--ink)",
                        background: i % 2 === 0 ? "var(--sh-glass-bg)" : "color-mix(in srgb, var(--sh-glass-bg) 50%, transparent)",
                        borderBottom: "1px solid var(--sh-glass-border)",
                      }}
                    >
                      {row.feature}
                    </td>
                    <td
                      className="p-4 text-center"
                      style={{
                        background: "var(--sh-info-bg)",
                        borderBottom: "1px solid var(--sh-glass-border)",
                      }}
                    >
                      <Cell value={row.studenthub} />
                    </td>
                    {competitors.map((val, ci) => (
                      <td
                        key={ci}
                        className="p-4 text-center"
                        style={{
                          borderBottom: "1px solid var(--sh-glass-border)",
                        }}
                      >
                        <Cell value={val} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expand / collapse toggle */}
        {hasMore && (
          <div className="flex justify-center py-3" style={{ borderTop: "1px solid var(--sh-glass-border)" }}>
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors duration-150 hover:opacity-70"
              style={{ color: "var(--sh-info)" }}
            >
              {expanded ? "Show less" : `Show all ${config.rows.length} features`}
              <ChevronDown
                className="size-3 transition-transform duration-200"
                style={{ transform: expanded ? "rotate(180deg)" : undefined }}
              />
            </button>
          </div>
        )}
      </div>

      {/* Footnote CTA */}
      {persona !== "candidate" && (
        <div className="text-center mt-4">
          <a
            href={
              persona === "staff"
                ? "/signup?role=staff"
                : persona === "company"
                  ? "/signup?role=company"
                  : persona === "admin"
                    ? "/signup?role=admin"
                    : "/signup?role=inspector"
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold no-underline transition-colors duration-150 hover:opacity-70"
            style={{ color: "var(--sh-info)" }}
          >
            See how StudentHub works for your {persona === "staff" ? "agency" : persona === "admin" ? "organisation" : persona === "company" ? "company" : "team"} <ArrowUpRight className="size-3" />
          </a>
        </div>
      )}
    </section>
  );
}
