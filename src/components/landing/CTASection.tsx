"use client";

import { FadeInSection } from "@/components/marketing";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface CTASectionProps {
  persona: "candidate" | "company";
}

export default function CTASection({ persona }: CTASectionProps) {
  return (
    <section className="py-12 sm:py-16 px-6 max-w-6xl mx-auto max-sm:px-4">
      <FadeInSection asDiv>
        <div
          className="relative overflow-hidden rounded-xl p-8 sm:p-10 text-center"
          style={{
            backgroundColor: "color-mix(in srgb, var(--surface) 50%, transparent)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Gradient background */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--sh-coral) 10%, transparent), transparent 70%)`,
            }}
          />

          <div className="relative z-[1]">
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-wider mb-2 px-3 py-1 rounded-full"
              style={{
                color: "var(--sh-coral)",
                backgroundColor: "color-mix(in srgb, var(--sh-coral) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--sh-coral) 20%, transparent)",
              }}
            >
              {persona === "company" ? "Start hiring today" : "Start your journey"}
            </span>

            <h2
              className="text-[clamp(20px,2.5vw,28px)] font-bold mt-3 mb-2"
              style={{ color: "var(--ink)" }}
            >
              {persona === "company"
                ? "Your next hire is one post away."
                : "Your next role is one profile away."}
            </h2>

            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--muted)" }}>
              {persona === "company"
                ? "Set up in under 5 minutes and get matched with vetted candidates."
                : "Create your free profile in 3 minutes. No CV required."}
            </p>

            <Link
              href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
              style={{ backgroundColor: "var(--sh-coral)" }}
            >
              {persona === "company" ? "Set up company account" : "Create your free profile"}{" "}
              <ChevronRight className="size-3.5" />
            </Link>

            <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
              {persona === "company" ? "No agency fees · AI-matched" : "Free · 3 minutes"}
            </p>
          </div>
        </div>
      </FadeInSection>
    </section>
  );
}
