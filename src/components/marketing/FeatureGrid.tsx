"use client";

import {
  Search,
  Layers,
  Globe,
  Zap,
  BarChart3,
  UserRound,
  Shield,
  Clock,
  FileText,
  Bell,
  MessageSquare,
  CreditCard,
  ClipboardCheck,
  CheckCircle,
  PieChart,
  GitMerge,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────

export type FeatureGridPersona = "candidate" | "staff" | "company" | "admin" | "inspector";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  stat?: string;
}

// ── Persona-tuned features ───────────────────────────────

const candidateFeatures: Feature[] = [
  {
    icon: Search,
    title: "Smart role discovery",
    body: "Typo-tolerant search across roles, skills, and pay rates. Saved searches alert you the moment a matching role opens.",
    stat: "60+ employers on the platform",
  },
  {
    icon: UserRound,
    title: "Profile that works for you",
    body: "One profile visible to every employer. Profile readiness score tells you exactly what to improve to get shortlisted faster.",
    stat: "3× more profile views",
  },
  {
    icon: Clock,
    title: "Real-time application tracking",
    body: "Know exactly where you stand — submitted, viewed, shortlisted, or placed. No more black hole applications.",
    stat: "4.8★ candidate satisfaction",
  },
  {
    icon: CreditCard,
    title: "Seamless timesheets & pay",
    body: "Log hours on your phone. Manager approves in seconds. Payments hit your account on schedule, every time.",
    stat: "99% on-time payment rate",
  },
  {
    icon: Bell,
    title: "Match alerts",
    body: "Get notified when a new role matches your skills and preferences. Apply in one tap from your phone.",
    stat: "3 min avg response time",
  },
  {
    icon: MessageSquare,
    title: "Direct employer messaging",
    body: "Chat with employers directly through the platform. Share documents, confirm shifts, and negotiate — all in one place.",
    stat: "Integrated chat",
  },
];

const companyFeatures: Feature[] = [
  {
    icon: Search,
    title: "Staff-matched candidates",
    body: "Get matched candidates within 48 hours of posting. Our staff recruiters learn your preferences and deliver better results over time.",
    stat: "48h avg time-to-match",
  },
  {
    icon: Layers,
    title: "Multi-branch management",
    body: "Manage hiring across all your locations from one dashboard. Each branch gets its own view, you get the full picture.",
    stat: "Unlimited branches",
  },
  {
    icon: Clock,
    title: "Timesheet approvals",
    body: "Review and approve timesheets in bulk or individually. No more chasing paper across 12 locations.",
    stat: "10h saved per week",
  },
  {
    icon: FileText,
    title: "Consolidated invoicing",
    body: "One consolidated invoice per branch. Automated VAT calculations and direct payment processing.",
    stat: "3-day month-end close",
  },
  {
    icon: Shield,
    title: "Compliance management",
    body: "Auto-verify right-to-work documents, track expiring certifications, and maintain audit-ready records.",
    stat: "99.7% audit pass rate",
  },
  {
    icon: BarChart3,
    title: "Hiring analytics",
    body: "See time-to-hire, cost-per-hire, and candidate source performance. Data-driven hiring decisions.",
    stat: "Real-time dashboard",
  },
];

const staffFeatures: Feature[] = [
  {
    icon: Search,
    title: "Typo-tolerant search",
    body: "Find candidates even when names are misspelled or documents have transcription errors. Search across skills, locations, and visa status with fuzzy matching.",
    stat: "62% faster placements",
  },
  {
    icon: Layers,
    title: "Bulk CV & shortlist tools",
    body: "Export CVs in bulk, create shortlists in seconds, and share them with employers. No more manual file management across 50+ candidates.",
    stat: "10 min → 30 sec per shortlist",
  },
  {
    icon: Clock,
    title: "Integrated timesheet pipeline",
    body: "Track every candidate's hours from clock-in to manager approval to payroll. One pipeline replaces phone calls and paper forms.",
    stat: "99% timesheet accuracy",
  },
  {
    icon: CreditCard,
    title: "Commission & margin tracking",
    body: "See your margin on every placement. Automated commission calculations, payment tracking, and reconciliation across agencies and employers.",
    stat: "Real-time margin visibility",
  },
  {
    icon: Bell,
    title: "Placement alerts & matching",
    body: "Get notified when a new candidate matches an open job or an employer requests staff. Respond fast, fill roles faster.",
    stat: "3 min avg response to alert",
  },
  {
    icon: BarChart3,
    title: "Team performance dashboard",
    body: "See who's placing, who's falling behind, and where the pipeline is bottlenecked. Data-driven staffing operations.",
    stat: "Weekly team velocity reports",
  },
];

const inspectorFeatures: Feature[] = [
  {
    icon: ClipboardCheck,
    title: "Batch document review",
    body: "Review civil IDs, certifications, and compliance documents in batches. Approve or reject with one click and full audit trail.",
    stat: "47 docs reviewed per session avg",
  },
  {
    icon: Shield,
    title: "Full audit trail",
    body: "Every decision is logged — who reviewed what, when, and why. Audit-ready reports exportable for regulator submissions.",
    stat: "99.7% audit pass rate",
  },
  {
    icon: FileText,
    title: "Exemption & flag management",
    body: "Flag suspicious documents, manage exemption requests, and track resolution. Separate queues keep exceptional cases from blocking standard workflow.",
    stat: "3 flagged per batch avg",
  },
  {
    icon: Zap,
    title: "Smart queue prioritization",
    body: "AI-prioritized queue puts urgent and overdue items first. No more manually sorting through 100+ pending reviews.",
    stat: "40% faster queue clearance",
  },
  {
    icon: BarChart3,
    title: "Compliance analytics",
    body: "See approval rates, rejection reasons, and bottleneck stages. Identify patterns before they become compliance issues.",
    stat: "Real-time compliance dashboard",
  },
  {
    icon: Globe,
    title: "Multi-region compliance",
    body: "Handle different document standards and certification requirements across regions. One view for all compliance operations.",
    stat: "15 regions supported",
  },
];

const adminFeatures: Feature[] = [
  {
    icon: Shield,
    title: "Role-based access control",
    body: "Grant granular permissions per user. Full audit trail for every action. SOC2-ready access logging with timestamped records.",
    stat: "Unlimited roles + custom permission sets",
  },
  {
    icon: FileText,
    title: "Bulk invoicing & payments",
    body: "Generate, review, and approve invoices across all branches. Schedule payment runs with consolidated monthly billing.",
    stat: "85% faster month-end close",
  },
  {
    icon: CheckCircle,
    title: "Production data validation",
    body: "Validate candidate profiles, timesheets, and payment data against production rules before processing. Flag anomalies instantly.",
    stat: "10,000+ records validated daily",
  },
  {
    icon: BarChart3,
    title: "Compliance dashboard",
    body: "Real-time view of right-to-work documents, expiring certifications, and audit readiness. Automated renewal notifications.",
    stat: "99.7% audit pass rate",
  },
  {
    icon: PieChart,
    title: "Custom report builder",
    body: "Build and schedule reports on any metric. Export to CSV, PDF, or direct BI tool integration. Shareable dashboards.",
    stat: "50+ report templates",
  },
  {
    icon: GitMerge,
    title: "Multi-entity reconciliation",
    body: "Reconcile payments, invoices, and headcounts across branches and entities. One view for the full picture.",
    stat: "100% reconciliation accuracy",
  },
];

const personaFeatures: Record<FeatureGridPersona, Feature[]> = {
  candidate: candidateFeatures,
  staff: staffFeatures,
  company: companyFeatures,
  admin: adminFeatures,
  inspector: inspectorFeatures,
};

// ── Props ────────────────────────────────────────────────

export interface FeatureGridProps {
  persona?: FeatureGridPersona;
  className?: string;
}

// ── Component ────────────────────────────────────────────

export default function FeatureGrid({
  persona = "candidate",
  className,
}: FeatureGridProps) {
  const features = personaFeatures[persona] ?? candidateFeatures;

  return (
    <section className={cn(className)} aria-label="Key features">
      <div className="text-center mb-8 md:mb-10">
        <p className="text-[#1f73b7] text-[11px] font-black uppercase tracking-wider mb-2">
          Everything you need
        </p>
        <h2 className="text-[clamp(22px,3.4vw,38px)] font-black leading-[1.08] tracking-tight text-foreground text-center">
          {persona === "candidate" &&
            "Your career, powered by one platform."}
          {persona === "staff" &&
            "Place people faster. Less paperwork."}
          {persona === "company" &&
            "Hiring infrastructure that actually works."}
          {persona === "admin" &&
            "Full control across every operation."}
          {persona === "inspector" &&
            "Clear the queue. Stay compliant."}
        </h2>
        <p
          className="max-w-[520px] mx-auto mt-2 leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          {persona === "candidate" &&
            "From discovering the right role to getting paid on time — every step is connected."}
          {persona === "staff" &&
            "From candidate discovery to payout reconciliation — one operating desk replaces five spreadsheets."}
          {persona === "company" &&
            "From candidate discovery to consolidated billing — one system replaces five tools."}
          {persona === "admin" &&
            "From compliance to payroll — one dashboard replaces a dozen logins."}
          {persona === "inspector" &&
            "From document intake to audit-ready reporting — every step tracked and verifiable."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="group shCard rounded-xl p-5 transition-all duration-[280ms] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(16,24,40,0.1)]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                animationDelay: `${i * 80 + 100}ms`,
              }}
            >
              {/* Icon with glow */}
              <div
                className="size-10 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200"
                style={{
                  background: "rgba(31,115,183,0.08)",
                  color: "#1f73b7",
                }}
              >
                <Icon className="size-5" aria-hidden="true" />
              </div>

              <strong className="block text-sm mb-1.5" style={{ color: "var(--ink)" }}>
                {feat.title}
              </strong>
              <p className="text-xs leading-relaxed m-0" style={{ color: "var(--muted)" }}>
                {feat.body}
              </p>

              {feat.stat && (
                <div
                  className="mt-3 pt-3 text-[11px] font-semibold"
                  style={{
                    color: "var(--sh-info)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  {feat.stat}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
