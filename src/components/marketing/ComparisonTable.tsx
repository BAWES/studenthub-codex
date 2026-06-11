"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  X,
  Minus,
  ChevronDown,
  Sparkles,
  Star,
  GraduationCap,
  Building2,
} from "lucide-react";
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
  persona?: "candidate" | "company";
  className?: string;
}

// ── Column labels per persona ─────────────────────────────

interface ColumnDef {
  key: "studenthub" | "alternatives" | "emailSpreadsheets" | "traditionalAgencies";
  label: string;
  accent?: boolean;
}

const sharedColumns: ColumnDef[] = [
  { key: "studenthub", label: "StudentHub", accent: true },
  { key: "alternatives", label: "Generic job boards" },
  { key: "emailSpreadsheets", label: "Email & spreadsheets" },
  { key: "traditionalAgencies", label: "Traditional agencies" },
];

// ── Data ─────────────────────────────────────────────────

const candidateRows: ComparisonRow[] = [
  { category: "Profile", feature: "Unified profile visible to all employers", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Profile", feature: "Profile readiness score", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Search", feature: "Typo-tolerant search", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Search", feature: "Filter by location, skill, pay rate", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Matching", feature: "AI-matched role suggestions", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Matching", feature: "Real-time application tracking", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Payments", feature: "Integrated timesheets", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Payments", feature: "Direct payment tracking", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Documents", feature: "Digital document upload and management", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Documents", feature: "Compliance document tracking", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
];

const companyRows: ComparisonRow[] = [
  { category: "Sourcing", feature: "AI-matched candidate suggestions", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Sourcing", feature: "Post to multiple branches at once", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Compliance", feature: "Auto right-to-work verification", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Compliance", feature: "Expiring certification tracking", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Timesheets", feature: "Digital clock-in/clock-out", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Timesheets", feature: "Bulk approval workflow", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Billing", feature: "Consolidated per-branch invoices", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: "Partial" },
  { category: "Billing", feature: "Automated VAT calculations", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Analytics", feature: "Time-to-hire dashboard", studenthub: true, alternatives: "Partial", emailSpreadsheets: false, traditionalAgencies: false },
  { category: "Analytics", feature: "Cost-per-hire tracking", studenthub: true, alternatives: false, emailSpreadsheets: false, traditionalAgencies: false },
];

const personaRows: Record<string, ComparisonRow[]> = {
  candidate: candidateRows,
  company: companyRows,
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

// ── Category pill colors ─────────────────────────────

const categoryColors: Record<string, string> = {
  Profile: "#0b63ce",
  Search: "#24835b",
  Matching: "#8b5cf6",
  Payments: "#f59e0b",
  Documents: "#ec4899",
  Sourcing: "#0b63ce",
  Compliance: "#24835b",
  Timesheets: "#8b5cf6",
  Billing: "#f59e0b",
  Analytics: "#ec4899",
  Shortlisting: "#0b63ce",
  Commissions: "#8b5cf6",
};

// ── Animated score bar ────────────────────────────────

function AnimatedScoreBar({
  value,
  delay,
}: {
  value: ScoreValue;
  delay: number;
}) {
  const percent = getScorePercent(value);
  const score = getScore(value);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const barColor =
    score === "full"
      ? "linear-gradient(90deg, #24835b, #2ecc71)"
      : score === "partial"
        ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
        : "linear-gradient(90deg, #d6dce7, #e2e8f0)";

  return (
    <div className="flex items-center gap-2">
      <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--sh-glass-bg)]">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: animated ? `${percent}%` : "0%",
            background: barColor,
            boxShadow:
              score === "full"
                ? "0 0 8px rgba(36, 131, 91, 0.4)"
                : score === "partial"
                  ? "0 0 8px rgba(245, 158, 11, 0.4)"
                  : "none",
          }}
        />
      </div>
      <span className="shrink-0 text-[10px] font-bold w-4 text-center">
        {score === "full" && (
          <Check className="size-3.5 inline" style={{ color: "var(--sh-success)" }} />
        )}
        {score === "partial" && (
          <Minus className="size-3.5 inline" style={{ color: "var(--sh-warning)" }} />
        )}
        {score === "none" && (
          <X className="size-3.5 inline" style={{ color: "var(--muted)" }} />
        )}
      </span>
    </div>
  );
}

// ── Score ring component ──────────────────────────────

function ScoreRing({
  value,
  label,
  total,
  color,
}: {
  value: number;
  label: string;
  total: number;
  color: string;
}) {
  const pct = Math.round((value / total) * 100);
  const circumference = 2 * Math.PI * 36;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative size-20">
        <svg className="size-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="var(--sh-glass-border)"
            strokeWidth="5"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? circumference * (1 - pct / 100) : circumference}
            className="transition-all duration-1500 ease-out"
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-lg font-black"
            style={{ color }}
          >
            {animated ? `${pct}%` : "0%"}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: "var(--muted)" }}>
        {label}
      </span>
    </div>
  );
}

// ── Feature card (desktop) ────────────────────────────

function FeatureCard({
  feature,
  columns,
  scores,
  index,
}: {
  feature: string;
  columns: ColumnDef[];
  scores: Record<string, ScoreValue>;
  index: number;
}) {
  return (
    <div
      className="group flex items-stretch rounded-lg overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--sh-glass-bg)",
        border: "1px solid var(--sh-glass-border)",
        animation: `shCardIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Feature name */}
      <div
        className="flex-1 min-w-0 p-3 flex items-center"
        style={{ borderRight: "1px solid var(--sh-glass-border)" }}
      >
        <span className="text-xs font-medium truncate" style={{ color: "var(--ink)" }}>
          {feature}
        </span>
      </div>

      {/* Scores */}
      {columns.map((col) => (
        <div
          key={col.key}
          className="w-[140px] shrink-0 p-3 flex items-center"
          style={{
            background: col.accent
              ? "linear-gradient(180deg, color-mix(in srgb, var(--sh-info-bg) 40%, transparent), transparent)"
              : "transparent",
            borderRight: "1px solid var(--sh-glass-border)",
          }}
        >
          <AnimatedScoreBar value={scores[col.key]} delay={index * 60 + 200} />
        </div>
      ))}
    </div>
  );
}

// ── Category section card ─────────────────────────────

function CategoryCard({
  category,
  rows,
  columns,
  ci,
}: {
  category: string;
  rows: ComparisonRow[];
  columns: ColumnDef[];
  ci: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const catColor = categoryColors[category] ?? "var(--muted)";

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: "var(--sh-glass-bg-strong)",
        border: "1px solid var(--sh-glass-border)",
        animation: `shCardIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both`,
        animationDelay: `${ci * 100}ms`,
      }}
    >
      {/* Category header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 transition-colors hover:brightness-110"
        style={{
          borderBottom: expanded ? "1px solid var(--sh-glass-border)" : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full" style={{ background: catColor }} />
          <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: catColor }}>
            {category}
          </span>
        </div>
        <ChevronDown
          className="size-3.5 transition-transform duration-200"
          style={{
            color: "var(--muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Feature rows */}
      <div
        className="transition-all duration-300 overflow-hidden"
        style={{
          maxHeight: expanded ? `${rows.length * 60}px` : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="grid gap-1.5 p-2">
          {rows.map((row, ri) => {
            const scores: Record<string, ScoreValue> = {
              studenthub: row.studenthub,
              alternatives: row.alternatives,
              emailSpreadsheets: row.emailSpreadsheets,
              traditionalAgencies: row.traditionalAgencies,
            };
            return (
              <FeatureCard
                key={ri}
                feature={row.feature}
                columns={columns}
                scores={scores}
                index={ri}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Mobile card ───────────────────────────────────────

function MobileScoreBadge({ value }: { value: ScoreValue }) {
  const score = getScore(value);
  if (score === "full")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--sh-success-bg)]" style={{ color: "var(--sh-success)" }}>
        <Check className="size-2.5" /> Yes
      </span>
    );
  if (score === "partial")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--sh-warning-bg)]" style={{ color: "var(--sh-warning)" }}>
        <Minus className="size-2.5" /> Limited
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--sh-glass-bg)", color: "var(--muted)" }}>
      <X className="size-2.5" /> No
    </span>
  );
}

// ── Component ────────────────────────────────────────────

export default function ComparisonTable({ persona = "candidate", className }: ComparisonTableProps) {
  const rows = personaRows[persona] ?? candidateRows;
  const columns = sharedColumns;

  // Group by category
  const categories = rows.reduce<{ category: string; rows: ComparisonRow[] }[]>((acc, row) => {
    const existing = acc.find((c) => c.category === row.category);
    if (existing) existing.rows.push(row);
    else acc.push({ category: row.category, rows: [row] });
    return acc;
  }, []);

  // Score summary
  const totalFeatures = rows.length;
  const shFullScore = rows.filter((r) => getScore(r.studenthub) === "full").length;

  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className={cn("shSection", className)}
      aria-label="Feature comparison"
    >
      <div className="text-center mb-8 md:mb-10">
        <p
          className="text-[11px] font-black uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5"
          style={{ color: "var(--sh-info)" }}
        >
          <Sparkles className="size-3" />
          See the difference
        </p>
        <h2 className="shBenefitsTitle text-center">
          {persona === "candidate"
            ? "Why candidates choose StudentHub."
            : "Why companies choose StudentHub."}
        </h2>
        <p
          className="max-w-[480px] mx-auto mt-2 text-sm leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          {persona === "candidate"
            ? "StudentHub gives you tools that job boards and agencies can't match."
            : "One platform replaces four legacy tools."}
        </p>
      </div>

      {/* Score summary rings */}
      <div className="flex items-center justify-center gap-6 md:gap-10 mb-8 flex-wrap">
        <ScoreRing value={shFullScore} label="StudentHub" total={totalFeatures} color="#0b63ce" />
      </div>

      {/* Desktop: card-based category layout */}
      <div className="hidden md:grid gap-4 max-w-[960px] mx-auto">
        {categories.map((cat, ci) => (
          <CategoryCard
            key={`cat-card-${ci}`}
            category={cat.category}
            rows={cat.rows}
            columns={columns}
            ci={ci}
          />
        ))}
      </div>

      {/* Mobile: compact list */}
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

            {/* Feature rows */}
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
                      <MobileScoreBadge value={row[col.key]} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </FadeInSection>
        ))}
      </div>

      {/* Context note */}
      <div className="text-center mt-6">
        <p className="text-[10px]" style={{ color: "var(--muted)" }}>
          Based on {totalFeatures} features compared. Data updated regularly.
        </p>
      </div>
    </section>
  );
}
