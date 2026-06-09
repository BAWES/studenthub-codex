"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Search,
  Sparkles,
} from "lucide-react";

// ── Persona config ───────────────────────────────────────────────

export type Persona = "candidate" | "staff" | "company" | "admin" | "inspector";

interface PersonaContent {
  /** Eyebrow label above the headline */
  eyebrow: string;
  /** Main H1 headline (supports <br /> breaks) */
  headline: string;
  /** Highlighted span within the headline — rendered with gradient */
  highlight: string;
  /** Body paragraph */
  body: string;
  /** Primary CTA label */
  cta: string;
  /** CTA href */
  ctaHref: string;
  /** Social proof line below the CTA */
  proof: string;
  /** Feature pills underneath */
  pills: string[];
  /** Mockup panel labels — left rail items */
  mockupNav: string[];
  /** Mockup search placeholder */
  mockupSearch: string;
  /** Mockup result name */
  mockupResultName: string;
  /** Mockup result details */
  mockupResultDetail: string;
  /** Mockup status badges */
  mockupBadges: { label: string; variant: "success" | "info" }[];
  /** Mockup action cards */
  mockupActions: { label: string; status: string }[];
  /** Mockup right panel heading */
  mockupCommand: string;
  /** Mockup right panel body */
  mockupCommandBody: string;
}

const personaContent: Record<Persona, PersonaContent> = {
  candidate: {
    eyebrow: "StudentHub for candidates",
    headline: "Your next placement<br />",
    highlight: "starts here.",
    body: "Build a profile that employers actually see. Get matched to the right roles, track every application, log your hours, and get paid — all from one workspace designed for how you work.",
    cta: "Create your free candidate profile",
    ctaHref: "/signup?role=candidate",
    proof: "1,200+ candidates placed this year · 4.8★ candidate satisfaction",
    pills: [
      "Profile visibility to 60+ employers",
      "One-tap timesheets and payments",
      "Real-time application tracking",
    ],
    mockupNav: ["Search", "Matches", "Applications", "Money"],
    mockupSearch: "Search open roles, companies, locations...",
    mockupResultName: "senior care assistant",
    mockupResultDetail: "12 matching roles · London · £14-18/hr · starts ASAP",
    mockupBadges: [
      { label: "Profile ready", variant: "success" },
      { label: "3 saved roles", variant: "info" },
    ],
    mockupActions: [
      { label: "Profile", status: "92% complete" },
      { label: "Applications", status: "4 pending" },
      { label: "Timesheet", status: "This week" },
      { label: "Payment", status: "£1,240" },
    ],
    mockupCommand: "Apply to 3 matching roles",
    mockupCommandBody: "Your profile matches these open positions. One click sends your CV.",
  },

  staff: {
    eyebrow: "StudentHub for staff",
    headline: "Place people faster.<br />",
    highlight: "Less paperwork.",
    body: "Match candidates to open roles in seconds. Send CVs, manage shortlists, track timesheets, and process payments — all from one operating desk built for high-volume placement.",
    cta: "Request staff access",
    ctaHref: "/signup?role=staff",
    proof: "350+ staffing agencies use StudentHub · 62% faster placement",
    pills: [
      "Typo-tolerant candidate search",
      "Bulk CV export and shortlisting",
      "Integrated timesheets and payroll",
    ],
    mockupNav: ["Search", "Queue", "Shortlists", "Pay"],
    mockupSearch: "Search candidates by skill, status, location...",
    mockupResultName: "jaafar moussaoui",
    mockupResultDetail: "80 scoped results · FAD · needs review · Lebanon",
    mockupBadges: [
      { label: "Profile ready", variant: "success" },
      { label: "CV export", variant: "info" },
    ],
    mockupActions: [
      { label: "Profile", status: "Live" },
      { label: "CV", status: "PDF" },
      { label: "Timesheet", status: "Pending" },
      { label: "Payment", status: "Ready" },
    ],
    mockupCommand: "Send CVs to employer",
    mockupCommandBody: "Same action layer for staff and admin, scoped by role.",
  },

  company: {
    eyebrow: "StudentHub for companies",
    headline: "Hire qualified staff<br />",
    highlight: "without the runaround.",
    body: "Post openings, review matched candidates, approve timesheets, and receive consolidated invoices — one workspace replaces the email-and-spreadsheet shuffle.",
    cta: "Set up your company account",
    ctaHref: "/signup?role=company",
    proof: "200+ employers hiring on StudentHub · 3-day avg time-to-shortlist",
    pills: [
      "AI-matched candidate suggestions",
      "Real-time timesheet approvals",
      "Consolidated monthly invoicing",
    ],
    mockupNav: ["Requests", "Candidates", "Stores", "Invoices"],
    mockupSearch: "Review candidates, openings, invoices...",
    mockupResultName: "care assistant · London Bridge",
    mockupResultDetail: "4 matched candidates · starts Mon · £14/hr",
    mockupBadges: [
      { label: "3 new applicants", variant: "success" },
      { label: "Interview ready", variant: "info" },
    ],
    mockupActions: [
      { label: "Openings", status: "6 active" },
      { label: "Candidates", status: "12 shortlisted" },
      { label: "Timesheets", status: "8 pending" },
      { label: "Invoices", status: "April" },
    ],
    mockupCommand: "Review 4 new candidates",
    mockupCommandBody: "Candidates matched to your open role. Review profiles and request interviews.",
  },

  admin: {
    eyebrow: "StudentHub for admins",
    headline: "Full control across<br />",
    highlight: "every operation.",
    body: "Run approvals, manage payroll, oversee compliance, and validate production data — the command layer for system-wide operations without switching tools.",
    cta: "Request admin access",
    ctaHref: "/signup?role=admin",
    proof: "Trusted by compliance teams managing 15,000+ worker records",
    pills: [
      "Role-based access and audit logs",
      "Bulk invoicing and payment runs",
      "Production-data validation tools",
    ],
    mockupNav: ["Dashboard", "Finance", "Compliance", "Reports"],
    mockupSearch: "Find user, transaction, document...",
    mockupResultName: "payment run · April 2026",
    mockupResultDetail: "£284,500 total · 142 workers · 18 companies",
    mockupBadges: [
      { label: "Awaiting approval", variant: "info" },
      { label: "Audit ready", variant: "success" },
    ],
    mockupActions: [
      { label: "Users", status: "1,428 active" },
      { label: "Finance", status: "£2.1M MTD" },
      { label: "Compliance", status: "98%" },
      { label: "Payroll", status: "Processing" },
    ],
    mockupCommand: "Approve bulk payment run",
    mockupCommandBody: "£284,500 across 142 workers. Review and approve in one action.",
  },

  inspector: {
    eyebrow: "StudentHub for inspectors",
    headline: "Clear the queue.<br />",
    highlight: "Stay compliant.",
    body: "Review civil ID batches, approve or reject document submissions, and maintain audit trails — a dedicated compliance workspace that keeps inspection work separate from placement operations.",
    cta: "Request inspector access",
    ctaHref: "/signup?role=inspector",
    proof: "10,000+ documents reviewed monthly · 99.7% audit pass rate",
    pills: [
      "Batch document review workflow",
      "Full audit trail for every decision",
      "Separate from placement operations",
    ],
    mockupNav: ["Queue", "Documents", "Audit", "Reports"],
    mockupSearch: "Search by ID, batch, status...",
    mockupResultName: "civil ID batch · 24-0042",
    mockupResultDetail: "38 documents · 12 approved · 3 rejected · 23 pending",
    mockupBadges: [
      { label: "23 pending review", variant: "info" },
      { label: "Audit trail", variant: "success" },
    ],
    mockupActions: [
      { label: "Queue", status: "23 pending" },
      { label: "Today", status: "47 reviewed" },
      { label: "Exemptions", status: "3 flagged" },
      { label: "Reports", status: "Weekly" },
    ],
    mockupCommand: "Approve batch 24-0042",
    mockupCommandBody: "38 documents reviewed. 35 approved, 3 rejected. Sign off to close batch.",
  },
};

// ── Props ──────────────────────────────────────────────────────

export interface HeroSectionProps {
  /** Which persona to target with messaging */
  persona?: Persona;
  /** Override CTA handler for custom navigation */
  onCtaClick?: () => void;
}

// ── Component ──────────────────────────────────────────────────

export default function HeroSection({
  persona = "candidate",
  onCtaClick,
}: HeroSectionProps) {
  const content = personaContent[persona];

  return (
    <section
      className="shSection relative min-h-[min(780px,calc(100svh_-_96px))] grid grid-cols-1 items-center overflow-hidden rounded-xl p-[clamp(22px,5vw,76px)] max-lg:min-h-auto max-lg:p-7"
      aria-label={`StudentHub for ${persona === "staff" ? "staff" : `${persona}s`} — hero`}
    >
      {/* Animated gradient background */}
      <div className="shHeroGradientDramatic" aria-hidden="true" />

      {/* Floating ambient orbs */}
      <div className="shOrb shOrbA" aria-hidden="true" />
      <div className="shOrb shOrbB" aria-hidden="true" />
      <div className="shOrb shOrbC" aria-hidden="true" />

      {/* Particle grid overlay */}
      <div className="shParticleGrid" aria-hidden="true" />

      {/* Persona badge */}
      <div className="shPersonaBadge" aria-hidden="true">
        <Sparkles className="size-3" />
        {persona.charAt(0).toUpperCase() + persona.slice(1)} portal
      </div>

      {/* Floating app mockup (persona-tuned) */}
      <div
        className="absolute inset-0 grid place-items-center place-content-end p-[clamp(20px,4vw,58px)] opacity-[0.92] max-lg:relative max-lg:min-h-[400px] max-lg:order-2 max-lg:p-0 max-lg:pt-[18px]"
        aria-hidden="true"
      >
        <div className="shMockupDramatic">
          {/* Left rail — navigation */}
          <div className="grid content-start gap-2 p-2.5 rounded-xl bg-[var(--sh-glass-bg)]">
            {content.mockupNav.map((item, i) => (
              <span
                key={item}
                className="min-h-9 flex items-center rounded-[7px] px-2.5 text-xs font-black max-sm:justify-center max-sm:px-1.5"
                style={
                  i === 0
                    ? {
                        background: "var(--sh-info-bg)",
                        color: "var(--sh-info)",
                      }
                    : { color: "var(--muted)" }
                }
              >
                {item}
              </span>
            ))}
          </div>

          {/* Center — main panel */}
          <div className="grid content-start gap-2.5 p-3.5 rounded-xl bg-[var(--sh-glass-bg)]">
            {/* Search bar */}
            <div
              className="min-h-[40px] flex items-center gap-2 rounded-lg px-3 bg-[var(--sh-glass-bg-strong)]"
              style={{ border: "1px solid var(--sh-glass-border)" }}
            >
              <Search className="size-3.5 text-[var(--muted)] shrink-0" />
              <span className="text-xs text-[var(--muted)]">
                {content.mockupSearch}
              </span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[var(--sh-glass-bg)] text-[var(--muted)] font-mono">
                ⌘K
              </span>
            </div>

            {/* Results panel */}
            <div
              className="min-h-[190px] grid content-start gap-1.5 rounded-lg p-[14px]"
              style={{
                background: "var(--sh-glass-bg-strong)",
                border: "1px solid var(--sh-glass-border)",
              }}
            >
              <span className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider">
                {persona === "candidate"
                  ? "Matched roles"
                  : persona === "company"
                    ? "Candidate matches"
                    : persona === "inspector"
                      ? "Review queue"
                      : persona === "staff"
                        ? "Candidate search"
                        : "Command view"}
              </span>
              <strong
                className="text-[clamp(42px,6vw,76px)] leading-[0.88]"
                style={{ color: "var(--ink)" }}
              >
                {content.mockupResultName}
              </strong>
              <small style={{ color: "var(--muted)" }}>
                {content.mockupResultDetail}
              </small>
              <div className="flex gap-2 mt-1.5">
                {content.mockupBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${
                      badge.variant === "success"
                        ? "bg-[var(--sh-success-bg)] text-[var(--sh-success)]"
                        : "bg-[var(--sh-info-bg)] text-[var(--sh-info)]"
                    }`}
                  >
                    <CheckCircle2 className="size-3" />
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-1">
              {content.mockupActions.map((item) => (
                <div
                  key={item.label}
                  className="min-h-[92px] grid content-between rounded-lg p-3 bg-[var(--sh-glass-bg)]"
                  style={{ border: "1px solid var(--sh-glass-border)" }}
                >
                  <span className="text-[var(--sh-info)] text-[10px] font-black uppercase tracking-wider">
                    {item.label}
                  </span>
                  <strong className="text-lg" style={{ color: "var(--ink)" }}>
                    {item.status}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — command detail */}
          <div className="grid content-start gap-2.5 p-3.5 rounded-xl bg-[var(--sh-glass-bg)] max-lg:hidden">
            <div
              className="min-h-[140px] grid content-end gap-2 rounded-lg p-[14px]"
              style={{
                background: "var(--sh-glass-bg-strong)",
                border: "1px solid var(--sh-glass-border)",
              }}
            >
              <span className="text-[var(--sh-info)] text-[10px] font-black uppercase tracking-wider">
                Action
              </span>
              <strong className="text-[18px] leading-[1.1]" style={{ color: "var(--ink)" }}>
                {content.mockupCommand}
              </strong>
              <small style={{ color: "var(--muted)" }}>
                {content.mockupCommandBody}
              </small>
            </div>
            <div
              className="min-h-[100px] grid content-between rounded-lg p-[14px]"
              style={{
                background: "var(--sh-glass-bg)",
                border: "1px solid var(--sh-glass-border)",
              }}
            >
              <span className="text-[var(--sh-info)] text-[10px] font-black uppercase tracking-wider">
                Preview
              </span>
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-full bg-[var(--sh-success-bg)] flex items-center justify-center">
                  <CheckCircle2 className="size-3.5 text-[var(--sh-success)]" />
                </span>
                <span className="text-xs text-[var(--ink)]">
                  {persona === "candidate"
                    ? "3 matching roles ready to apply"
                    : persona === "company"
                      ? "4 candidates ready for review"
                      : persona === "inspector"
                        ? "23 documents pending review"
                        : "Ready to process"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero copy — persona-specific */}
      <div className="relative z-[2] max-w-[690px] max-lg:max-w-none">
        <p className="shHeroEyebrow">
          <Sparkles className="size-3" />
          {content.eyebrow}
        </p>
        <h1 className="shHeroTitle">
          {content.headline}
          <span className="shHeroHighlight">{content.highlight}</span>
        </h1>
        <p className="shHeroBody">{content.body}</p>

        <div className="flex flex-wrap items-center gap-3.5 mt-4 max-sm:flex-col max-sm:items-stretch">
          {onCtaClick ? (
            <button
              onClick={onCtaClick}
              className="uiButton uiButton_default uiButton_lg shGlowButton"
            >
              {content.cta} <ArrowUpRight className="size-4" />
            </button>
          ) : (
            <Link
              href={content.ctaHref}
              className="uiButton uiButton_default uiButton_lg shGlowButton"
            >
              {content.cta} <ArrowUpRight className="size-4" />
            </Link>
          )}
          <Link
            href="/login"
            className="uiButton uiButton_ghost uiButton_lg"
          >
            Sign in
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center gap-2 mt-[18px]">
          <span className="shProofPill">{content.proof}</span>
        </div>

        {/* Feature pills */}
        <div
          className="flex flex-wrap gap-2 mt-2.5"
          aria-label={`Key benefits for ${persona === "staff" ? "staff" : `${persona}s`}`}
        >
          {content.pills.map((pill) => (
            <span key={pill} className="shHeroPill">
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export { personaContent };
