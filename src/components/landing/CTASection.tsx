"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const SH_BLUE = "#0b63ce";
const SH_AMBER = "#f59e0b";

interface CTASectionProps {
  persona: "candidate" | "company";
}

export default function CTASection({ persona }: CTASectionProps) {
  return (
    <section className="py-12 sm:py-16 px-6 max-w-6xl mx-auto max-sm:px-4">
      <div
        className="relative overflow-hidden rounded-xl p-8 sm:p-12 text-center shLandingGlassHover"
        style={{
          backgroundColor: "var(--sh-glass-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${persona === "company" ? `${SH_AMBER}30` : `${SH_BLUE}30`}`,
        }}
      >
        {/* Ambient gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: `radial-gradient(ellipse at 30% 0%, ${SH_BLUE}12, transparent 60%), radial-gradient(ellipse at 70% 100%, ${SH_AMBER}0A, transparent 50%)`,
          }}
        />

        <div className="relative z-[1] max-w-xl mx-auto">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase"
            style={{
              color: persona === "company" ? SH_AMBER : SH_BLUE,
              backgroundColor: persona === "company" ? `${SH_AMBER}12` : `${SH_BLUE}12`,
            }}
          >
            <Sparkles className="size-3" />
            {persona === "company" ? "Start hiring today" : "Start your journey"}
          </span>

          <h2
            className="text-[clamp(22px,2.8vw,30px)] font-bold mt-3 mb-2 leading-tight tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            {persona === "company"
              ? "Your next hire is one post away."
              : "Your next role is one profile away."}
          </h2>

          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--muted)" }}>
            {persona === "company"
              ? "Set up in under 5 minutes and get matched with vetted students by our recruitment team."
              : "Create your free profile in 3 minutes. No CV required. Our staff recruiters do the matching."}
          </p>

          <Link
            href={{ pathname: "/signup", query: { role: persona === "company" ? "company" : "candidate" } }}
            className="shLandingBtnPrimary group"
            style={{
              backgroundColor: persona === "company" ? SH_AMBER : SH_BLUE,
              boxShadow: persona === "company"
                ? `0 4px 14px ${SH_AMBER}50`
                : `0 4px 14px ${SH_BLUE}40`,
            }}
          >
            {persona === "company" ? "Set up company account" : "Create your free profile"}{" "}
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
            {persona === "company"
              ? "No agency fees · Staff-matched · Supported by recruiters"
              : "Free · 3 minutes · No CV required"}
          </p>
        </div>
      </div>
    </section>
  );
}
