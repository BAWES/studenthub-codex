"use client";

import { useState } from "react";
import { FadeInSection } from "@/components/marketing";
import { Check, X } from "lucide-react";

interface ComparisonRow {
  feature: string;
  studentHub: boolean | string;
  traditional: boolean | string;
}

type Category = "profile" | "matching" | "payments" | "documents";

const categories: Record<Category, { label: string; rows: ComparisonRow[] }> = {
  profile: {
    label: "Profile",
    rows: [
      { feature: "Free student profile", studentHub: true, traditional: false },
      { feature: "Visible to 500+ employers", studentHub: true, traditional: false },
      { feature: "AI skill recommendations", studentHub: true, traditional: "Manual only" },
      { feature: "One-click applications", studentHub: true, traditional: false },
    ],
  },
  matching: {
    label: "Matching",
    rows: [
      { feature: "AI-powered matching", studentHub: true, traditional: false },
      { feature: "Real-time role alerts", studentHub: true, traditional: false },
      { feature: "Employer discovery", studentHub: true, traditional: "Apply only" },
      { feature: "Profile completeness score", studentHub: true, traditional: false },
    ],
  },
  payments: {
    label: "Payments",
    rows: [
      { feature: "Digital timesheets", studentHub: true, traditional: "Paper/PDF" },
      { feature: "Auto payment tracking", studentHub: true, traditional: false },
      { feature: "Consolidated invoicing", studentHub: true, traditional: false },
      { feature: "Payment history dashboard", studentHub: true, traditional: false },
    ],
  },
  documents: {
    label: "Documents",
    rows: [
      { feature: "Digital contracts", studentHub: true, traditional: "Paper only" },
      { feature: "Compliance automation", studentHub: true, traditional: false },
      { feature: "ID verification", studentHub: true, traditional: "Manual" },
      { feature: "Exportable reports", studentHub: true, traditional: false },
    ],
  },
};

interface ComparisonSectionProps {
  persona: "candidate" | "company";
}

export default function ComparisonSection({ persona }: ComparisonSectionProps) {
  const [active, setActive] = useState<Category>("profile");

  const catOrder: Category[] = ["profile", "matching", "payments", "documents"];
  const data = categories[active];
  const title =
    persona === "candidate"
      ? "Why students choose StudentHub."
      : "Why employers choose StudentHub.";
  const competitor = persona === "candidate" ? "Traditional job boards" : "Agencies & job boards";

  return (
    <section
      className="py-12 sm:py-16 px-6 max-w-6xl mx-auto max-sm:px-4"
      aria-label="Feature comparison"
    >
      <FadeInSection asDiv>
        <div className="text-center mb-8 sm:mb-10">
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-wider mb-2 px-3 py-1 rounded-full"
            style={{
              color: "var(--sh-coral)",
              backgroundColor: "color-mix(in srgb, var(--sh-coral) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--sh-coral) 20%, transparent)",
            }}
          >
            Comparison
          </span>
          <h2
            className="text-[clamp(22px,3vw,32px)] font-bold leading-tight mb-2"
            style={{ color: "var(--ink)" }}
          >
            {title}
          </h2>
        </div>

        {/* Category tabs */}
        <div className="flex justify-center gap-1.5 mb-6 flex-wrap">
          {catOrder.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
              style={{
                backgroundColor:
                  active === cat
                    ? "color-mix(in srgb, var(--sh-coral) 12%, transparent)"
                    : "transparent",
                color: active === cat ? "var(--sh-coral)" : "var(--muted)",
                border: `1px solid ${
                  active === cat
                    ? "color-mix(in srgb, var(--sh-coral) 25%, transparent)"
                    : "var(--border)"
                }`,
              }}
            >
              {categories[cat].label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          className="overflow-hidden rounded-xl transition-shadow duration-300 hover:shadow-sm"
          style={{
            border: "1px solid var(--border)",
          }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-3 gap-0"
            style={{
              borderBottom: "1px solid var(--border)",
              backgroundColor: "color-mix(in srgb, var(--surface) 40%, transparent)",
            }}
          >
            <div
              className="px-4 py-3 text-xs font-semibold flex items-center"
              style={{ color: "var(--muted)" }}
            >
              Feature
            </div>
            <div
              className="px-4 py-3 text-xs font-semibold text-center flex items-center justify-center gap-1"
              style={{ color: "var(--sh-coral)" }}
            >
              <span
                className="flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-white"
                style={{ backgroundColor: "var(--sh-coral)" }}
              >
                SH
              </span>
              StudentHub
            </div>
            <div
              className="px-4 py-3 text-xs font-semibold text-center flex items-center justify-center"
              style={{ color: "var(--muted)" }}
            >
              {competitor}
            </div>
          </div>

          {/* Rows */}
          {data.rows.map((row, i) => (
            <div
              key={row.feature}
              className="grid grid-cols-3 gap-0 transition-colors duration-150 hover:opacity-90"
              style={{
                borderBottom:
                  i < data.rows.length - 1 ? "1px solid var(--border)" : "none",
                backgroundColor:
                  i % 2 === 0
                    ? "color-mix(in srgb, var(--surface) 30%, transparent)"
                    : "transparent",
              }}
            >
              <div
                className="px-4 py-3 text-sm flex items-center"
                style={{ color: "var(--ink)" }}
              >
                {row.feature}
              </div>
              <div className="px-4 py-3 text-sm text-center flex items-center justify-center">
                {typeof row.studentHub === "boolean" ? (
                  row.studentHub ? (
                    <Check className="size-4" style={{ color: "var(--success)" }} />
                  ) : (
                    <X className="size-4" style={{ color: "var(--error)" }} />
                  )
                ) : (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {row.studentHub}
                  </span>
                )}
              </div>
              <div className="px-4 py-3 text-sm text-center flex items-center justify-center">
                {typeof row.traditional === "boolean" ? (
                  row.traditional ? (
                    <Check className="size-4" style={{ color: "var(--success)" }} />
                  ) : (
                    <X className="size-4" style={{ color: "var(--error)" }} />
                  )
                ) : (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {row.traditional}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Foot note */}
        <p className="text-xs text-center mt-4" style={{ color: "var(--muted)" }}>
          StudentHub is purpose-built for student placement in Kuwait — not a generic job board.
        </p>
      </FadeInSection>
    </section>
  );
}
