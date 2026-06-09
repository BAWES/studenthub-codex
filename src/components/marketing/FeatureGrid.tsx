"use client";

import { useMemo } from "react";
import {
  Search,
  Layers,
  Globe,
  Zap,
  Shield,
  ClipboardCheck,
  UserRound,
  Building2,
  BarChart3,
} from "lucide-react";
import type { Persona } from "./HeroSection";

// ── Feature definitions per persona ─────────────────────────────────────

export interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  stat: string;
}

const featuresByPersona: Record<Persona, Feature[]> = {
  candidate: [
    {
      icon: Search,
      title: "Smart job matching",
      body: "Your profile is matched against open roles across 60+ employers. No blind applications — only roles that fit your skills and preferences.",
      stat: "92% match accuracy",
    },
    {
      icon: Layers,
      title: "One-tap applications",
      body: "See a role you like? One click sends your CV and profile. Track every application in real time from a single dashboard.",
      stat: "Apply in 1 click",
    },
    {
      icon: BarChart3,
      title: "Timesheets & payments",
      body: "Log hours, approve timesheets, and get paid — all in the same system. No chasing paper forms or separate payroll portals.",
      stat: "Paid weekly",
    },
  ],
  staff: [
    {
      icon: Search,
      title: "Typo-tolerant search",
      body: "Search candidates across countries, skills, and statuses. Typos don't matter — our search finds what you mean, not what you typed.",
      stat: "0.4s avg response",
    },
    {
      icon: Layers,
      title: "Bulk CV management",
      body: "Export, shortlist, and send CVs in bulk. Manage 50 placements in the time it takes to do one manually.",
      stat: "62% faster placement",
    },
    {
      icon: Globe,
      title: "Unified pipeline",
      body: "From initial CV to signed timesheet and final payment — every step lives in one system. No spreadsheets, no email chains.",
      stat: "End-to-end workflows",
    },
  ],
  company: [
    {
      icon: Building2,
      title: "AI-matched hiring",
      body: "Post an opening and get matched candidates from our pool automatically. Review profiles, request interviews, and approve — all from one desk.",
      stat: "3-day avg to shortlist",
    },
    {
      icon: Layers,
      title: "Real-time approvals",
      body: "Approve timesheets as they come in. No end-of-month scramble. Every approval is timestamped and audit-ready.",
      stat: "Instant approvals",
    },
    {
      icon: Shield,
      title: "Consolidated invoicing",
      body: "One monthly invoice per store or location. No more reconciling dozens of separate bills from different agencies.",
      stat: "1 invoice per location",
    },
  ],
  admin: [
    {
      icon: Shield,
      title: "Role-based access",
      body: "Granular permissions across every module. Define who can approve payments, who can run reports, and who can manage users — with full audit trails.",
      stat: "Complete audit trail",
    },
    {
      icon: BarChart3,
      title: "System-wide reporting",
      body: "Real-time dashboards for compliance, finance, and operations. Export-ready reports for auditors and stakeholders.",
      stat: "Real-time dashboards",
    },
    {
      icon: Zap,
      title: "Bulk operations",
      body: "Process payment runs, approve batches, and manage compliance checks across the entire organisation from a single command panel.",
      stat: "Bulk processing",
    },
  ],
  inspector: [
    {
      icon: ClipboardCheck,
      title: "Batch document review",
      body: "Review civil ID batches, approve or reject document submissions, and maintain a complete audit trail for every decision.",
      stat: "10K docs reviewed/mo",
    },
    {
      icon: Shield,
      title: "Full audit trail",
      body: "Every approval, rejection, and exemption is logged with timestamp and reviewer ID. Built for compliance audits.",
      stat: "99.7% audit pass rate",
    },
    {
      icon: Layers,
      title: "Separate compliance workspace",
      body: "Inspection work stays isolated from placement operations. No data leakage, no role confusion, no compliance gaps.",
      stat: "Isolated workspace",
    },
  ],
};

// ── Props ────────────────────────────────────────────────────────────────

export interface FeatureGridProps {
  persona?: Persona;
  title?: string;
  subtitle?: string;
}

// ── Component ────────────────────────────────────────────────────────────

export default function FeatureGrid({
  persona = "candidate",
  title,
  subtitle,
}: FeatureGridProps) {
  const features = featuresByPersona[persona] ?? featuresByPersona.candidate;

  const sectionTitle = title ?? {
    candidate: "Built for your next placement.",
    staff: "Place people faster, with less paperwork.",
    company: "Hire qualified staff without the runaround.",
    admin: "Full control across every operation.",
    inspector: "Clear the queue. Stay compliant.",
  }[persona];

  const sectionSubtitle =
    subtitle ??
    {
      candidate:
        "Every feature is designed to get you from profile to paycheck — faster.",
      staff:
        "From search to payment, every step is connected in one operating desk.",
      company:
        "From posting to invoicing — one workspace replaces the email-and-spreadsheet shuffle.",
      admin:
        "The command layer for system-wide operations without switching tools.",
      inspector:
        "A dedicated compliance workspace that keeps inspection work separate.",
    }[persona];

  return (
    <section className="shSection" aria-label={`Key features for ${persona}s`}>
      <div className="text-center max-w-[640px] mx-auto mb-8">
        <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
          Features
        </p>
        <h2 className="text-[clamp(22px,3.2vw,38px)] font-bold leading-[1.1] mb-2">
          {sectionTitle}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {sectionSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="shCard rounded-xl p-5 transition-all duration-[280ms] hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(16,24,40,0.1)]"
              style={{
                background: "var(--sh-glass-bg)",
                border: "1px solid var(--sh-glass-border)",
                animationDelay: `${i * 100 + 150}ms`,
              }}
            >
              <Icon
                className="size-5 mb-3"
                style={{ color: "var(--sh-info)" }}
                aria-hidden="true"
              />
              <strong className="text-sm" style={{ color: "var(--ink)" }}>
                {feat.title}
              </strong>
              <p className="text-xs leading-relaxed mt-1.5" style={{ color: "var(--muted)" }}>
                {feat.body}
              </p>
              <span className="shCardStat mt-2.5 block">{feat.stat}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
