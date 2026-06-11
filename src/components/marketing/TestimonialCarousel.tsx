"use client";

import { useState, useEffect, useCallback } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  avatar: string; // initials fallback
  rating: number;
}

export type TestimonialPersona = "candidate" | "staff" | "company" | "admin" | "inspector";

// ── Persona-tuned testimonials ───────────────────────────

const candidateTestimonials: Testimonial[] = [
  {
    quote:
      "StudentHub matched me with a role I wouldn't have found anywhere else. My profile was visible to 60+ employers within 24 hours — and I had three interview requests by the end of the week.",
    name: "Aisha M.",
    title: "Care Assistant",
    company: "Placed via StudentHub",
    avatar: "AM",
    rating: 5,
  },
  {
    quote:
      "The timesheet and payment system is seamless. I log my hours on my phone, my manager approves in seconds, and the money hits my account on payday. No chasing, no spreadsheets.",
    name: "James K.",
    title: "Support Worker",
    company: "Placed via StudentHub",
    avatar: "JK",
    rating: 5,
  },
  {
    quote:
      "I went from registering to shortlisted in 6 hours. The application tracking showed me exactly where I stood at every step — no black hole applications here.",
    name: "Priya R.",
    title: "Senior Care Assistant",
    company: "Placed via StudentHub",
    avatar: "PR",
    rating: 5,
  },
  {
    quote:
      "StudentHub saved me hours every week. Instead of visiting 5 different agency websites, I have one profile that all employers can see. The matching algorithm actually works.",
    name: "Daniel O.",
    title: "Healthcare Worker",
    company: "Placed via StudentHub",
    avatar: "DO",
    rating: 4,
  },
];

const staffTestimonials: Testimonial[] = [
  {
    quote:
      "We went from paper files to digital placement in one week. Typo-tolerant search finds candidates even when names are misspelled — a huge win for our team.",
    name: "Sarah L.",
    title: "Operations Manager",
    company: "MedStaff Agency — Kuwait",
    avatar: "SL",
    rating: 5,
  },
  {
    quote:
      "Bulk CV export and integrated timesheets cut our admin time by 62%. My consultants spend more time placing people and less time pushing paper.",
    name: "Tom W.",
    title: "Director",
    company: "CareConnect Staffing — KW",
    avatar: "TW",
    rating: 5,
  },
  {
    quote:
      "The margin tracking alone paid for itself in the first month. I can see exactly what we're earning on every placement, in real time.",
    name: "Nadia K.",
    title: "Finance Manager",
    company: "Premier Staff Solutions — Kuwait",
    avatar: "NK",
    rating: 5,
  },
  {
    quote:
      "Commission reconciliation used to take me a full day at month end. Now it's automated — I just review and approve.",
    name: "Carlos M.",
    title: "Operations Lead",
    company: "HealthForce Staffing — KW",
    avatar: "CM",
    rating: 4,
  },
];

const companyTestimonials: Testimonial[] = [
  {
    quote:
      "Posting openings on StudentHub gets us matched candidates within 48 hours, not weeks. The timesheet approval workflow alone saved our HR team 10 hours a week.",
    name: "Noura A.",
    title: "HR Manager",
    company: "Kuwait City Medical Group",
    avatar: "NA",
    rating: 5,
  },
  {
    quote:
      "We get consolidated invoices per branch instead of chasing paper across 12 locations. The difference in month-end close is night and day.",
    name: "Fahad M.",
    title: "Finance Director",
    company: "Premier Healthcare KW",
    avatar: "FM",
    rating: 5,
  },
  {
    quote:
      "AI-matched candidates are surprisingly accurate. We hired three staff members in the first week — all matched by the algorithm, all still with us 6 months on.",
    name: "Layla A.",
    title: "Operations Director",
    company: "BrightCare Kuwait",
    avatar: "LA",
    rating: 5,
  },
  {
    quote:
      "Compliance tracking used to be a spreadsheet nightmare. Now I get auto-notifications when certifications are about to expire — no more last-minute surprises.",
    name: "Bader R.",
    title: "Compliance Officer",
    company: "Al-Mana Group",
    avatar: "BR",
    rating: 4,
  },
];

const inspectorTestimonials: Testimonial[] = [
  {
    quote:
      "Batch document review cut our inspection time by 60%. The full audit trail means every decision I make is automatically logged and exportable.",
    name: "Fatima R.",
    title: "Senior Compliance Officer",
    company: "Kuwait National Inspection Services",
    avatar: "FR",
    rating: 5,
  },
  {
    quote:
      "Queue clearance went from days to hours. I can batch-approve 50 inspection reports in one pass and the system flags anything that needs a second look.",
    name: "Salem T.",
    title: "Lead Inspector",
    company: "Regulatory Compliance Kuwait",
    avatar: "ST",
    rating: 5,
  },
  {
    quote:
      "The automated compliance alerts caught three expiring certifications last month that would have slipped through our manual process. That alone justified the platform.",
    name: "Hanan W.",
    title: "Quality Assurance Manager",
    company: "Kuwait Care Standards Authority",
    avatar: "HW",
    rating: 5,
  },
  {
    quote:
      "Export-ready audit trails mean I spend minutes preparing for regulatory reviews instead of digging through spreadsheets for hours.",
    name: "Mishaal O.",
    title: "Compliance Auditor",
    company: "Health & Safety Authority — Kuwait",
    avatar: "MO",
    rating: 4,
  },
];

// ── Map ──────────────────────────────────────────────────

const adminTestimonials: Testimonial[] = [
  {
    quote:
      "We manage permissions across 200+ users and 15 departments. Role-based access control means every admin sees exactly what they need — and nothing they shouldn't.",
    name: "Jennifer W.",
    title: "Head of Operations",
    company: "CareTrust Management — Kuwait",
    avatar: "JW",
    rating: 5,
  },
  {
    quote:
      "The compliance dashboard consolidated alerts from six separate systems into one view. We caught three expiring certifications before they lapsed — that alone paid for the platform.",
    name: "Mark S.",
    title: "Compliance Director",
    company: "National Care Group — KW",
    avatar: "MS",
    rating: 5,
  },
  {
    quote:
      "Month-end reconciliation went from a three-day slog to an automated process. Consolidated reporting across all 8 branches, one click to export.",
    name: "Lena K.",
    title: "Finance Controller",
    company: "Premier Healthcare KW",
    avatar: "LK",
    rating: 5,
  },
  {
    quote:
      "Data validation catches anomalies before they reach production. It flagged a timesheet discrepancy that would have cost us 12K KWD — the system paid for itself in the first month.",
    name: "Omar H.",
    title: "Systems Administrator",
    company: "SecureStaff Solutions — Kuwait",
    avatar: "OH",
    rating: 4,
  },
];

/** Shuffle array using Fisher-Yates */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Mixed testimonials — employer + candidate perspectives together */
const mixedTestimonials: Testimonial[] = shuffleArray([
  ...candidateTestimonials,
  ...companyTestimonials,
]);

const personaTestimonials: Record<TestimonialPersona, Testimonial[]> = {
  candidate: mixedTestimonials,
  staff: staffTestimonials,
  company: companyTestimonials,
  admin: adminTestimonials,
  inspector: inspectorTestimonials,
};

// ── Props ────────────────────────────────────────────────

export interface TestimonialCarouselProps {
  persona?: TestimonialPersona;
  testimonials?: Testimonial[];
  autoRotateInterval?: number;
  className?: string;
}

// ── Component ────────────────────────────────────────────

export default function TestimonialCarousel({
  persona = "candidate",
  testimonials: customTestimonials,
  autoRotateInterval = 5000,
  className,
}: TestimonialCarouselProps) {
  const items = customTestimonials ?? personaTestimonials[persona];
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Auto-rotate
  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const id = setInterval(next, autoRotateInterval);
    return () => clearInterval(id);
  }, [isPaused, next, autoRotateInterval, items.length]);

  if (items.length === 0) return null;

  const t = items[active];

  return (
    <section
      className={cn("shSection", className)}
      aria-label="Customer testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="text-center mb-8 md:mb-10">
        <p className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-wider mb-2">
          {persona === "candidate" && "Trusted by candidates and employers"}
          {persona === "staff" && "Trusted by staffing agencies nationwide"}
          {persona === "company" && "Trusted by leading employers"}
          {persona === "admin" && "Trusted by compliance and ops teams"}
          {persona === "inspector" && "Trusted by inspection teams"}
        </p>
        <h2 className="shBenefitsTitle text-center">
          {persona === "candidate" && "Real stories from real placements."}
          {persona === "staff" && "Staffing agencies that moved faster."}
          {persona === "company" && "Employers that found their team."}
          {persona === "admin" && "Operations that run on StudentHub."}
          {persona === "inspector" && "Compliance that stands up to scrutiny."}
        </h2>
      </div>

      <div className="relative mx-auto max-w-[800px]">
        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 size-10 rounded-full flex items-center justify-center bg-[var(--sh-glass-bg-strong)] border border-[var(--sh-glass-border)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--sh-glass-border-strong)] transition-all duration-200 max-sm:hidden"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="size-4" />
        </button>

        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 size-10 rounded-full flex items-center justify-center bg-[var(--sh-glass-bg-strong)] border border-[var(--sh-glass-border)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--sh-glass-border-strong)] transition-all duration-200 max-sm:hidden"
          aria-label="Next testimonial"
        >
          <ChevronRight className="size-4" />
        </button>

        {/* Testimonial card */}
        <div
          key={active}
          className="shCard rounded-xl p-8 md:p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            background: "var(--sh-glass-bg)",
            border: "1px solid var(--sh-glass-border)",
          }}
        >
          <Quote
            className="size-8 mx-auto mb-4"
            style={{ color: "var(--sh-info)" }}
            aria-hidden="true"
          />

          <blockquote className="text-[clamp(17px,2vw,22px)] leading-relaxed mb-6 font-medium" style={{ color: "var(--ink)" }}>
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          {/* Star rating */}
          <div className="flex items-center justify-center gap-1 mb-4" aria-label={`${t.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="size-4"
                style={{
                  color: i < t.rating ? "var(--sh-warning)" : "var(--sh-glass-border-strong)",
                  fill: i < t.rating ? "var(--sh-warning)" : "transparent",
                }}
              />
            ))}
          </div>

          {/* Author */}
          <div className="flex items-center justify-center gap-3">
            <div
              className="size-10 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: "var(--sh-info-bg)",
                color: "var(--sh-info)",
              }}
            >
              {t.avatar}
            </div>
            <div className="text-left">
              <strong className="block text-sm" style={{ color: "var(--ink)" }}>
                {t.name}
              </strong>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {t.title} — {t.company}
              </span>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="size-2 rounded-full transition-all duration-300"
              style={{
                background: i === active ? "var(--sh-info)" : "var(--sh-glass-border)",
                width: i === active ? 24 : 8,
              }}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
