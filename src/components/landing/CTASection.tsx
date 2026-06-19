"use client";

import { ArrowRight } from "lucide-react";
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
        className="relative overflow-hidden rounded-xl p-8 sm:p-12 text-center"
        style={{
          backgroundColor: "var(--surface)",
          border: `1px solid ${SH_BLUE}20`,
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
            className="inline-block text-[11px] font-bold uppercase tracking-wider mb-2 px-3 py-1 rounded-full"
            style={{
              color: SH_BLUE,
              backgroundColor: `${SH_BLUE}12`,
            }}
          >
            {persona === "company" ? "Start hiring today" : "Start your journey"}
          </span>

          <h2
            className="text-[clamp(22px,2.8vw,30px)] font-bold mt-3 mb-2 leading-tight"
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
            href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 group"
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
