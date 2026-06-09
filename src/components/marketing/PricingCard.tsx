"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowUpRight } from "lucide-react";
import type { Persona } from "./HeroSection";

// ── Pricing data per persona ─────────────────────────────────────────────

export interface PricingTier {
  name: string;
  monthly: number;
  annual: number;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
}

const pricingByPersona: Record<Persona, PricingTier[]> = {
  candidate: [
    {
      name: "Free",
      monthly: 0,
      annual: 0,
      description: "Everything you need to find your next role — no cost.",
      cta: "Create free profile",
      ctaHref: "/signup?role=candidate",
      features: [
        "Profile visible to 60+ employers",
        "Unlimited job applications",
        "Real-time application tracking",
        "One-tap timesheets",
        "Weekly payments",
        "CV upload and management",
      ],
    },
  ],
  staff: [
    {
      name: "Starter",
      monthly: 49,
      annual: 39,
      description: "For independent recruiters and small agencies.",
      cta: "Request staff access",
      ctaHref: "/signup?role=staff",
      features: [
        "Up to 50 active candidates",
        "Typo-tolerant search",
        "CV export and shortlisting",
        "Timesheet management",
        "Basic reporting",
        "Email support",
      ],
    },
    {
      name: "Professional",
      monthly: 149,
      annual: 119,
      description: "For growing agencies with multiple clients.",
      cta: "Request staff access",
      ctaHref: "/signup?role=staff",
      popular: true,
      features: [
        "Unlimited active candidates",
        "Bulk CV export and shortlisting",
        "Integrated timesheets and payroll",
        "Advanced reporting and analytics",
        "Multi-client management",
        "Priority support",
      ],
    },
    {
      name: "Enterprise",
      monthly: 399,
      annual: 329,
      description: "For large agencies with complex workflows.",
      cta: "Contact sales",
      ctaHref: "/signup?role=staff",
      features: [
        "Everything in Professional",
        "Custom workflows and automation",
        "API access and integrations",
        "Dedicated account manager",
        "SLA guarantees",
        "Custom onboarding and training",
      ],
    },
  ],
  company: [
    {
      name: "Starter",
      monthly: 99,
      annual: 79,
      description: "For small employers posting occasional roles.",
      cta: "Set up company account",
      ctaHref: "/signup?role=company",
      features: [
        "Up to 5 active openings",
        "AI-matched candidate suggestions",
        "Real-time timesheet approvals",
        "Consolidated monthly invoicing",
        "Email support",
      ],
    },
    {
      name: "Business",
      monthly: 249,
      annual: 199,
      description: "For growing companies hiring regularly.",
      cta: "Set up company account",
      ctaHref: "/signup?role=company",
      popular: true,
      features: [
        "Up to 20 active openings",
        "Priority candidate matching",
        "Multi-location management",
        "Custom invoice schedules",
        "Advanced reporting",
        "Phone and email support",
      ],
    },
    {
      name: "Enterprise",
      monthly: 599,
      annual: 499,
      description: "For large organisations with high-volume hiring.",
      cta: "Contact sales",
      ctaHref: "/signup?role=company",
      features: [
        "Unlimited openings",
        "Dedicated matching specialist",
        "Custom integration and API access",
        "Multi-brand management",
        "Dedicated account manager",
        "SLA guarantees and priority support",
      ],
    },
  ],
  admin: [
    {
      name: "Operations",
      monthly: 299,
      annual: 249,
      description: "For organisations managing compliance and finance.",
      cta: "Request admin access",
      ctaHref: "/signup?role=admin",
      features: [
        "Role-based access control",
        "Bulk invoicing and payment runs",
        "Compliance dashboards",
        "Audit log exports",
        "User management",
        "Priority support",
      ],
    },
    {
      name: "Enterprise",
      monthly: 799,
      annual: 649,
      description: "For large-scale operations with advanced needs.",
      cta: "Contact sales",
      ctaHref: "/signup?role=admin",
      popular: true,
      features: [
        "Everything in Operations",
        "Custom compliance reports",
        "API access for data integration",
        "Dedicated account manager",
        "White-label options",
        "SLA guarantees and 24/7 support",
      ],
    },
  ],
  inspector: [
    {
      name: "Standard",
      monthly: 149,
      annual: 119,
      description: "For individual inspectors and small teams.",
      cta: "Request inspector access",
      ctaHref: "/signup?role=inspector",
      features: [
        "Batch document review",
        "Full audit trail",
        "Approval and rejection workflow",
        "Basic reporting",
        "Email support",
      ],
    },
    {
      name: "Professional",
      monthly: 399,
      annual: 329,
      description: "For compliance teams with high throughput.",
      cta: "Request inspector access",
      ctaHref: "/signup?role=inspector",
      popular: true,
      features: [
        "Unlimited batch processing",
        "Advanced audit analytics",
        "Custom exemption workflows",
        "Integration with external systems",
        "Priority support",
        "Dedicated account manager",
      ],
    },
  ],
};

// ── Props ────────────────────────────────────────────────────────────────

export interface PricingCardProps {
  persona?: Persona;
}

// ── Component ────────────────────────────────────────────────────────────

export default function PricingCard({ persona = "candidate" }: PricingCardProps) {
  const [annual, setAnnual] = useState(false);
  const tiers = pricingByPersona[persona] ?? pricingByPersona.candidate;

  return (
    <section className="shSection" aria-label={`Pricing for ${persona}s`}>
      <div className="text-center max-w-[640px] mx-auto mb-8">
        <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
          Pricing
        </p>
        <h2 className="text-[clamp(22px,3.2vw,38px)] font-bold leading-[1.1] mb-2">
          {persona === "candidate"
            ? "Free to use. Always."
            : "Simple, transparent pricing."}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {persona === "candidate"
            ? "Creating a profile costs nothing. No hidden fees, no surprise charges."
            : "No hidden fees. No surprise price hikes. What you see is what you pay."}
        </p>

        {/* Annual / monthly toggle (only for paid tiers) */}
        {tiers.length > 1 && (
          <div
            className="inline-flex items-center gap-2 mt-5 p-1 rounded-full"
            style={{
              background: "var(--sh-glass-bg)",
              border: "1px solid var(--sh-glass-border)",
            }}
          >
            <button
              onClick={() => setAnnual(false)}
              className="px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200"
              style={
                !annual
                  ? {
                      background: "var(--ink)",
                      color: "var(--paper)",
                    }
                  : { color: "var(--muted)" }
              }
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200"
              style={
                annual
                  ? {
                      background: "var(--ink)",
                      color: "var(--paper)",
                    }
                  : { color: "var(--muted)" }
              }
            >
              Annual
              <span
                className="ml-1.5 text-[10px]"
                style={{ color: "var(--sh-success)" }}
              >
                Save 20%
              </span>
            </button>
          </div>
        )}
      </div>

      <div
        className={`grid gap-4 ${
          tiers.length === 1
            ? "max-w-[400px] mx-auto"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="relative rounded-xl p-6 transition-all duration-[280ms] hover:-translate-y-1"
            style={{
              background: tier.popular
                ? "linear-gradient(135deg, var(--sh-glass-bg-strong), var(--sh-info-bg))"
                : "var(--sh-glass-bg)",
              border: tier.popular
                ? "1px solid var(--sh-info)"
                : "1px solid var(--sh-glass-border)",
              boxShadow: tier.popular ? "var(--sh-glow-sm)" : undefined,
            }}
          >
            {/* Popular badge */}
            {tier.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{
                    background: "var(--sh-info)",
                    color: "#fff",
                  }}
                >
                  <Sparkles className="size-3" />
                  Most popular
                </span>
              </div>
            )}

            {/* Tier name & price */}
            <div className="text-center mb-5">
              <h3
                className="text-sm font-bold mb-1"
                style={{ color: "var(--ink)" }}
              >
                {tier.name}
              </h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-[clamp(28px,4vw,40px)] font-bold" style={{ color: "var(--ink)" }}>
                  £{annual ? tier.annual : tier.monthly}
                </span>
                {tier.monthly > 0 && (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    /{annual ? "month, billed annually" : "month"}
                  </span>
                )}
              </div>
              {tier.monthly === 0 && (
                <span className="text-xs" style={{ color: "var(--sh-success)" }}>
                  No credit card required
                </span>
              )}
              <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>
                {tier.description}
              </p>
            </div>

            {/* Features */}
            <ul className="grid gap-2 mb-6">
              {tier.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-xs">
                  <CheckCircle2
                    className="size-4 shrink-0 mt-0.5"
                    style={{ color: "var(--sh-success)" }}
                  />
                  <span style={{ color: "var(--muted)" }}>{feat}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href={tier.ctaHref}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                tier.popular
                  ? "hover:-translate-y-0.5"
                  : "hover:bg-[var(--sh-glass-bg-strong)]"
              }`}
              style={
                tier.popular
                  ? {
                      background: "var(--ink)",
                      color: "var(--paper)",
                    }
                  : {
                      background: "var(--sh-glass-bg)",
                      color: "var(--ink)",
                      border: "1px solid var(--sh-glass-border)",
                    }
              }
            >
              {tier.cta} <ArrowUpRight className="size-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
