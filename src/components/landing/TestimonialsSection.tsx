"use client";

import { useState, useEffect, useCallback } from "react";
import { FadeInSection } from "@/components/marketing";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const SH_BLUE = "#0b63ce";
const SH_AMBER = "#f59e0b";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  persona: "candidate" | "company";
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Noura Al-Sabah",
    role: "Computer Science Student",
    company: "Kuwait University",
    quote:
      "StudentHub matched me with a part-time role at a fintech startup within 48 hours. The timesheet and payment system makes everything effortless — I just focus on the work.",
    persona: "candidate",
    rating: 5,
  },
  {
    name: "Faisal Al-Rashid",
    role: "HR Director",
    company: "Alshaya Group",
    quote:
      "We've hired 12 students through StudentHub this year. The staff matching saves us hours of screening, and the compliance handling means we never miss a step.",
    persona: "company",
    rating: 5,
  },
  {
    name: "Layla Al-Mutairi",
    role: "Business Administration Student",
    company: "GUST",
    quote:
      "I was nervous about finding work while studying. StudentHub made it simple — one profile, multiple offers. The flexibility is exactly what a student needs.",
    persona: "candidate",
    rating: 5,
  },
  {
    name: "Abdulaziz Al-Khalid",
    role: "Founder & CEO",
    company: "Tamees Tech",
    quote:
      "As a startup, we need reliable talent without the overhead of full-time hires. StudentHub gives us access to bright students who bring fresh ideas and real energy.",
    persona: "company",
    rating: 5,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="size-3.5 fill-current" style={{ color: SH_AMBER }} />
      ))}
    </div>
  );
}

interface TestimonialsSectionProps {
  personas?: ("candidate" | "company")[];
}

export default function TestimonialsSection({
  personas = ["candidate", "company"],
}: TestimonialsSectionProps) {
  const activePersonas = new Set(personas);
  const [activeTab, setActiveTab] = useState<"all" | "candidate" | "company">("all");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered =
    activeTab === "all"
      ? testimonials.filter((t) => activePersonas.has(t.persona))
      : testimonials.filter((t) => t.persona === activeTab);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeTab]);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % filtered.length);
  }, [filtered.length]);

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  }, [filtered.length]);

  if (filtered.length === 0) return null;

  const current = filtered[activeIndex];

  return (
    <section
      id="testimonials"
      className="py-12 sm:py-16 px-6 max-w-6xl mx-auto max-sm:px-4"
      aria-label="Customer testimonials"
    >
      <FadeInSection asDiv>
        <div className="text-center mb-8 sm:mb-10">
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-wider mb-2 px-3 py-1 rounded-full"
            style={{
              color: SH_BLUE,
              backgroundColor: `color-mix(in srgb, ${SH_BLUE} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${SH_BLUE} 20%, transparent)`,
            }}
          >
            Testimonials
          </span>
          <h2
            className="text-[clamp(22px,3vw,32px)] font-bold leading-tight mb-2"
            style={{ color: "var(--ink)" }}
          >
            Real stories from real placements.
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--muted)" }}>
            Hear from students who found their path and employers who built their teams.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { value: "all" as const, label: "All" },
            { value: "candidate" as const, label: "Students" },
            { value: "company" as const, label: "Employers" },
          ].map((tab) => {
            const accent = tab.value === "company" ? SH_AMBER : SH_BLUE;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer"
                style={{
                  backgroundColor:
                    activeTab === tab.value
                      ? `color-mix(in srgb, ${accent} 12%, transparent)`
                      : "transparent",
                  color: activeTab === tab.value ? accent : "var(--muted)",
                  border: `1px solid ${
                    activeTab === tab.value
                      ? `color-mix(in srgb, ${accent} 25%, transparent)`
                      : "var(--border)"
                  }`,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Testimonial card */}
        <div className="max-w-2xl mx-auto">
          <div
            className="relative overflow-hidden rounded-xl p-7 sm:p-9 transition-all duration-300 hover:shadow-md"
            style={{
              backgroundColor: "color-mix(in srgb, var(--surface) 50%, transparent)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Decorative quote icon */}
            <Quote
              className="absolute top-4 right-4 size-10 opacity-[0.06]"
              style={{ color: SH_BLUE }}
              aria-hidden="true"
            />

            {/* Persona indicator stripe */}
            <div
              className="absolute top-0 left-0 bottom-0 w-1 rounded-l-xl"
              style={{
                backgroundColor: current.persona === "company" ? SH_AMBER : SH_BLUE,
              }}
              aria-hidden="true"
            />

            <div className="relative z-[1] pl-3">
              <Stars rating={current.rating} />
              <blockquote className="mt-3 mb-5">
                <p
                  className="text-[15px] leading-relaxed italic"
                  style={{ color: "var(--ink)" }}
                >
                  &ldquo;{current.quote}&rdquo;
                </p>
              </blockquote>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                  style={{
                    backgroundColor: current.persona === "company" ? SH_AMBER : SH_BLUE,
                  }}
                >
                  {current.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <span className="block text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {current.name}
                  </span>
                  <span className="block text-xs" style={{ color: "var(--muted)" }}>
                    {current.role} &middot; {current.company}
                  </span>
                </div>
                {/* Persona tag */}
                <span
                  className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${current.persona === "company" ? SH_AMBER : SH_BLUE} 10%, transparent)`,
                    color: current.persona === "company" ? SH_AMBER : SH_BLUE,
                  }}
                >
                  {current.persona === "candidate" ? "Student" : "Employer"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer hover:-translate-x-0.5"
              style={{
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="size-3" />
              Previous
            </button>
            <div className="flex gap-1.5">
              {filtered.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    width: i === activeIndex ? 20 : 6,
                    backgroundColor:
                      i === activeIndex ? SH_BLUE : "var(--border)",
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer hover:translate-x-0.5"
              style={{
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
              aria-label="Next testimonial"
            >
              Next
              <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      </FadeInSection>
    </section>
  );
}
