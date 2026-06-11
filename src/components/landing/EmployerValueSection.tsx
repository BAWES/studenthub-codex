"use client";

import { FadeInSection } from "@/components/marketing";
import { Users, Zap, Shield, FileText, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";

const BLUE = "#0b63ce";
const AMBER = "#f59e0b";

const benefits = [
  {
    icon: Users,
    title: "Access vetted students",
    description: "Every student on StudentHub is verified and actively seeking placement. Skip the screening — start interviewing pre-qualified talent.",
    color: BLUE,
  },
  {
    icon: Zap,
    title: "Staff-powered matching",
    description: "Our recruitment team finds the best students based on your requirements. No manual searching through hundreds of profiles.",
    color: AMBER,
  },
  {
    icon: Shield,
    title: "Built-in compliance",
    description: "Contracts, timesheets, and payments are handled automatically. Stay compliant with Kuwait labour regulations without extra paperwork.",
    color: "var(--success)",
  },
  {
    icon: FileText,
    title: "Consolidated invoicing",
    description: "All your hires in one monthly invoice. No chasing individual contractors or managing multiple payment schedules.",
    color: "var(--warning)",
  },
  {
    icon: Building2,
    title: "Dedicated account support",
    description: "Every employer gets a dedicated account manager to help with placements, compliance, and platform support.",
    color: BLUE,
  },
  {
    icon: ArrowRight,
    title: "Zero agency fees",
    description: "Post jobs and hire directly through the platform. No recruitment agency markups — pay only the agreed hourly or fixed rate.",
    color: BLUE,
  },
];

export default function EmployerValueSection() {
  return (
    <section id="for-employers" className="py-12 sm:py-16 px-6 max-w-6xl mx-auto max-sm:px-4" aria-label="For employers">
      <FadeInSection asDiv>
        <div className="text-center mb-10 sm:mb-12">
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-wider mb-2 px-3 py-1 rounded-full"
            style={{
              color: BLUE,
              backgroundColor: `color-mix(in srgb, ${BLUE} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${BLUE} 20%, transparent)`,
            }}
          >
            For employers
          </span>
          <h2
            className="text-[clamp(22px,3vw,32px)] font-bold leading-tight mb-2"
            style={{ color: "var(--ink)" }}
          >
            Hire the right students — faster
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--muted)" }}>
            Access a pool of pre-vetted students, manage placements, and handle compliance — 
            all from one dashboard. No agency fees, no paperwork headaches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: "color-mix(in srgb, var(--surface) 50%, transparent)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-10"
                aria-hidden="true"
                style={{
                  background: `radial-gradient(circle, ${benefit.color} 0%, transparent 70%)`,
                  transform: "translate(30%, -30%)",
                }}
              />
              <div className="relative z-[1]">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg mb-3"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--surface) 70%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                    color: benefit.color,
                  }}
                >
                  <benefit.icon className="size-4" />
                </span>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
                  {benefit.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/signup?role=company"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${AMBER}, #d97706)`,
              boxShadow: `0 4px 14px color-mix(in srgb, ${AMBER} 35%, transparent)`,
            }}
          >
            Start hiring today <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </FadeInSection>
    </section>
  );
}
