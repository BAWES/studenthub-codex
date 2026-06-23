"use client";

import { useState } from "react";
import { Check, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ── Types ────────────────────────────────────────────────

export interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  features: string[];
  cta: string;
  ctaHref: string;
}

export interface PricingCardProps {
  persona?: "candidate" | "staff" | "company" | "admin" | "inspector";
  className?: string;
}

// ── Persona-tuned pricing ────────────────────────────────

const candidateTiers: PricingTier[] = [
  {
    name: "Free",
    description: "Completely free for students. No hidden fees, no subscriptions.",
    monthlyPrice: 0,
    annualPrice: 0,
    popular: true,
    features: [
      "Full candidate profile",
      "Staff-matched work placements",
      "3-month rotation positions",
      "Multiple placements across industries",
      "Build a stacked CV by graduation",
      "ID card with QR code for compliance",
      "Email notifications",
    ],
    cta: "Create your free profile",
    ctaHref: "/signup?role=candidate",
  },
];

const companyTiers: PricingTier[] = [
  {
    name: "Starter",
    description: "Post openings and hire directly.",
    monthlyPrice: 299,
    annualPrice: 249,
    features: [
      "Post unlimited openings",
      "Browse candidate profiles",
      "Timesheet management",
      "Invoice consolidation",
      "Email support",
    ],
    cta: "Start hiring",
    ctaHref: "/signup?role=company",
  },
  {
    name: "Professional",
    description: "Staff matching and priority placement.",
    monthlyPrice: 599,
    annualPrice: 499,
    popular: true,
    features: [
      "Everything in Starter",
      "Staff-matched candidate suggestions",
      "Priority shortlisting",
      "Multi-branch management",
      "Custom branded portal",
      "Dedicated account manager",
    ],
    cta: "Scale your hiring",
    ctaHref: "/signup?role=company&plan=professional",
  },
  {
    name: "Enterprise",
    description: "Full platform integration and compliance.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Everything in Growth",
      "API access and custom integrations",
      "Bulk candidate import/export",
      "Compliance and audit tools",
      "SLA and priority support",
      "Custom pricing",
    ],
    cta: "Contact sales",
    ctaHref: "/contact",
  },
];

const staffTiers: PricingTier[] = [
  {
    name: "Starter",
    description: "For small agencies getting started with shift management.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Staff shift scheduling",
      "Candidate shortlisting",
      "Basic reporting",
      "Email support",
    ],
    cta: "Start for free",
    ctaHref: "/signup?role=staff",
  },
  {
    name: "Professional",
    description: "Advanced tools for growing staffing operations.",
    monthlyPrice: 49,
    annualPrice: 39,
    popular: true,
    features: [
      "Everything in Starter",
      "Staff candidate matching",
      "Priority placement tools",
      "Multi-agency management",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Go Professional",
    ctaHref: "/signup?role=staff&plan=professional",
  },
  {
    name: "Enterprise",
    description: "Full platform integration for large agencies.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Everything in Professional",
      "API access and custom integrations",
      "Bulk candidate import/export",
      "Compliance and audit tools",
      "SLA and dedicated support",
      "Custom pricing",
    ],
    cta: "Contact sales",
    ctaHref: "/contact",
  },
];

const inspectorTiers: PricingTier[] = [
  {
    name: "Starter",
    description: "Essential tools for independent inspectors.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Inspect and verify candidates",
      "Document review tools",
      "Basic reporting",
      "Email support",
    ],
    cta: "Start for free",
    ctaHref: "/signup?role=inspector",
  },
  {
    name: "Professional",
    description: "Advanced tools for professional inspection firms.",
    monthlyPrice: 79,
    annualPrice: 65,
    popular: true,
    features: [
      "Everything in Starter",
      "Bulk document processing",
      "Staff-reviewed verification",
      "Multi-client management",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Go Professional",
    ctaHref: "/signup?role=inspector&plan=professional",
  },
];

const personaTiers: Record<string, PricingTier[]> = {
  candidate: candidateTiers,
  staff: staffTiers,
  company: companyTiers,
  admin: companyTiers,
  inspector: inspectorTiers,
};

// ── Component ────────────────────────────────────────────

export default function PricingCard({ persona = "candidate", className }: PricingCardProps) {
  const [annual, setAnnual] = useState(false);
  const tiers = personaTiers[persona] ?? candidateTiers;

  return (
    <section className={cn(className)} aria-label="Pricing plans">
      {/* Header */}
      <div className="text-center mb-8 md:mb-10">
        <p className="text-[#1f73b7] text-[11px] font-black uppercase tracking-wider mb-2">
          Simple pricing
        </p>
        <h2 className="text-[clamp(22px,3.4vw,38px)] font-black leading-[1.08] tracking-tight text-foreground text-center">
          {persona === "candidate"
            ? "Completely free for students. Always."
            : "Plans that scale with your team."}
        </h2>
        <p className="max-w-[520px] mx-auto mt-2 leading-relaxed text-muted-foreground">
          {persona === "candidate"
            ? "Registration is completely free for students. No hidden fees, no subscriptions — ever."
            : "From single openings to enterprise compliance — we have a plan for every stage."}
        </p>
      </div>

      {/* Annual/Monthly toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={cn("text-sm font-medium", annual ? "text-muted-foreground" : "text-foreground")}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
            annual ? "bg-[var(--sh-info)]" : "bg-border"
          )}
          aria-label={`Switch to ${annual ? "monthly" : "annual"} billing`}
        >
          <span
            className="inline-block size-5 rounded-full bg-white shadow-sm transition-transform"
            style={{ transform: annual ? "translateX(26px)" : "translateX(3px)" }}
          />
        </button>
        <span className={cn("text-sm font-medium", annual ? "text-foreground" : "text-muted-foreground")}>
          Annual
          <span className="ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#24835b]/10 text-[#24835b]">
            Save up to 20%
          </span>
        </span>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[1100px] mx-auto">
        {tiers.map((tier) => {
          const price = annual ? tier.annualPrice : tier.monthlyPrice;
          const isEnterprise = tier.name === "Enterprise" && persona !== "candidate";

          return (
            <div
              key={tier.name}
              className={cn(
                "relative rounded-xl p-6 transition-all duration-[280ms] flex flex-col",
                "hover:-translate-y-1",
                tier.popular
                  ? "bg-gradient-to-br from-card to-[var(--sh-info-bg)] border-[1.5px] border-[var(--sh-info)] shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
                  : "bg-card border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              )}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#1f73b7] text-white">
                  <Sparkles className="size-3" />
                  Most popular
                </div>
              )}

              {/* Tier name & description */}
              <strong className="text-lg text-foreground">
                {tier.name}
              </strong>
              <p className="text-xs mt-1 mb-4 text-muted-foreground">
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-5">
                {isEnterprise ? (
                  <strong className="text-2xl text-foreground">
                    Custom
                  </strong>
                ) : (
                  <>
                    <span className="text-4xl font-black text-foreground">
                      £{price}
                    </span>
                    <span className="text-sm ml-1 text-muted-foreground">
                      /{annual ? "year" : "month"}
                    </span>
                    {price > 0 && annual && (
                      <div className="text-xs mt-1 text-[#24835b]">
                        £{tier.monthlyPrice}/mo billed annually
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Features */}
              <ul className="grid gap-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="size-4 mt-0.5 shrink-0 text-[#24835b]" />
                     {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isEnterprise ? (
                <Button variant="ghost" size="default" asChild className="w-full justify-center">
                  <Link href={tier.ctaHref as any}>
                    {tier.cta} <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant={tier.popular ? "default" : "ghost"}
                  size="default"
                  asChild
                  className="w-full justify-center"
                >
                  <Link href={tier.ctaHref as any}>
                    {tier.cta} <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
