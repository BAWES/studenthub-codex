"use client";

import { useState, useEffect, useCallback } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Persona } from "./HeroSection";

// ── Testimonials per persona ─────────────────────────────────────────────

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  rating: number;
  initials: string;
}

const testimonialsByPersona: Record<Persona, Testimonial[]> = {
  candidate: [
    {
      quote:
        "I used to send my CV to agencies and never hear back. With StudentHub, I applied to three roles in one morning and had two interviews booked by lunch.",
      name: "Aisha M.",
      title: "Care Assistant",
      company: "Placed at Care UK",
      rating: 5,
      initials: "AM",
    },
    {
      quote:
        "The timesheet feature alone saves me an hour a week. I log my hours on my phone, my manager approves them, and I get paid. Simple.",
      name: "James K.",
      title: "Support Worker",
      company: "Placed at Mencap",
      rating: 5,
      initials: "JK",
    },
    {
      quote:
        "I had my profile set up in 10 minutes. Within a week, I had three offers. This is how job searching should work.",
      name: "Priya S.",
      title: "Senior Care Assistant",
      company: "Placed at Bupa",
      rating: 4,
      initials: "PS",
    },
  ],
  staff: [
    {
      quote:
        "We used to spend hours manually searching CV databases. StudentHub's typo-tolerant search finds the right candidates in seconds, even when the job titles are spelled wrong.",
      name: "David R.",
      title: "Recruitment Manager",
      company: "StaffForce Agency",
      rating: 5,
      initials: "DR",
    },
    {
      quote:
        "Bulk CV export and shortlisting cut our placement time by over 60%. One person can now manage what used to take a team of three.",
      name: "Sarah L.",
      title: "Operations Director",
      company: "Premier Staffing",
      rating: 5,
      initials: "SL",
    },
    {
      quote:
        "The integrated timesheets and payroll eliminated our end-of-month reconciliation nightmare. It's all in one system now.",
      name: "Mark T.",
      title: "Branch Manager",
      company: "CareFirst Recruitment",
      rating: 4,
      initials: "MT",
    },
  ],
  company: [
    {
      quote:
        "We were drowning in spreadsheets — different agencies sent different invoices, different formats. StudentHub gives us one consolidated invoice per location.",
      name: "Helen W.",
      title: "HR Director",
      company: "London Care Group",
      rating: 5,
      initials: "HW",
    },
    {
      quote:
        "The AI-matched candidates are scarily accurate. We posted a role and had qualified candidates to review within 24 hours. That used to take two weeks.",
      name: "Tom B.",
      title: "Operations Manager",
      company: "Southern Cross Healthcare",
      rating: 5,
      initials: "TB",
    },
    {
      quote:
        "Approving timesheets in real-time has saved us from payroll disputes. Both sides see the same numbers at the same time.",
      name: "Claire D.",
      title: "Finance Director",
      company: "Nightingale Care Homes",
      rating: 4,
      initials: "CD",
    },
  ],
  admin: [
    {
      quote:
        "Managing compliance across 15,000+ worker records was a full-time job. Now it's a dashboard I check once a day.",
      name: "Marcus J.",
      title: "Compliance Officer",
      company: "National Care Alliance",
      rating: 5,
      initials: "MJ",
    },
    {
      quote:
        "The audit trail is exactly what our regulators expect. Every action is logged, timestamped, and exportable. Inspections went from stressful to routine.",
      name: "Amara O.",
      title: "Head of Compliance",
      company: "UK Care Standards",
      rating: 5,
      initials: "AO",
    },
  ],
  inspector: [
    {
      quote:
        "We were reviewing documents across three different systems. Now it's one queue, one workspace, one source of truth for every batch.",
      name: "Fatima H.",
      title: "Senior Inspector",
      company: "Care Quality Commission",
      rating: 5,
      initials: "FH",
    },
    {
      quote:
        "The batch review workflow cut our processing time by 40%. We clear the queue faster without sacrificing audit quality.",
      name: "Robert C.",
      title: "Lead Auditor",
      company: "Skills for Care",
      rating: 4,
      initials: "RC",
    },
  ],
};

// ── Props ────────────────────────────────────────────────────────────────

export interface TestimonialCarouselProps {
  persona?: Persona;
  autoRotateInterval?: number; // ms between auto-rotates (default 5000)
}

// ── Component ────────────────────────────────────────────────────────────

export default function TestimonialCarousel({
  persona = "candidate",
  autoRotateInterval = 5000,
}: TestimonialCarouselProps) {
  const testimonials = testimonialsByPersona[persona] ?? testimonialsByPersona.candidate;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Auto-rotate
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    const timer = setInterval(next, autoRotateInterval);
    return () => clearInterval(timer);
  }, [isPaused, next, autoRotateInterval, testimonials.length]);

  const t = testimonials[activeIndex];

  return (
    <section
      className="shSection"
      aria-label={`What ${persona}s say about StudentHub`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="text-center max-w-[640px] mx-auto mb-8">
        <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
          Testimonials
        </p>
        <h2 className="text-[clamp(22px,3.2vw,38px)] font-bold leading-[1.1] mb-2">
          Trusted by {persona === "candidate" ? "candidates" : `${persona}s`}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Real stories from real people using StudentHub every day.
        </p>
      </div>

      <div
        className="relative max-w-[720px] mx-auto rounded-xl overflow-hidden transition-all duration-[280ms] hover:-translate-y-0.5"
        style={{
          background: "var(--sh-glass-bg)",
          border: "1px solid var(--sh-glass-border)",
        }}
      >
        {/* Decorative quote icon */}
        <Quote
          className="absolute top-4 left-4 size-8 opacity-[0.08]"
          style={{ color: "var(--sh-info)" }}
          aria-hidden="true"
        />

        <div className="p-8 sm:p-10 text-center">
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${
                  i < t.rating
                    ? "fill-[var(--amber)] text-[var(--amber)]"
                    : "fill-none text-[var(--line)]"
                }`}
              />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-base sm:text-lg leading-relaxed font-medium mb-6">
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          {/* Author */}
          <div className="flex items-center justify-center gap-3">
            <span
              className="size-10 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: "var(--sh-info-bg)",
                color: "var(--sh-info)",
              }}
            >
              {t.initials}
            </span>
            <div className="text-left">
              <strong className="text-sm" style={{ color: "var(--ink)" }}>
                {t.name}
              </strong>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {t.title} &middot; {t.company}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-center gap-4 pb-6">
          <button
            onClick={prev}
            className="size-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background: "var(--sh-glass-bg-strong)" }}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-4" style={{ color: "var(--muted)" }} />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="size-2 rounded-full transition-all duration-200"
                style={{
                  background:
                    i === activeIndex ? "var(--sh-info)" : "var(--sh-glass-border-strong)",
                  width: i === activeIndex ? 20 : 8,
                }}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="size-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background: "var(--sh-glass-bg-strong)" }}
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-4" style={{ color: "var(--muted)" }} />
          </button>
        </div>
      </div>
    </section>
  );
}
