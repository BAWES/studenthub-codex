"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Sparkles, GraduationCap, Building2, Search, Check,
  Star, Users, Briefcase, BarChart3, Fingerprint, Menu, X,
  Clock, Zap, Shield, ChevronRight, Eye, CreditCard, UsersRound,
  Handshake, ClipboardCheck, FileCheck
} from "lucide-react";

type Persona = "student" | "company";

interface LandingContentProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

// ── Scroll reveal ─────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Zendesk-inspired palette ──────────────────────────────────
// Zendesk brand: coral/red accent, clean whites, warm tones
// Uses CSS variables for proper light/dark theme support

const zd = {
  accent: "#eb6651",       // Zendesk coral/red brand color
  accentLight: "#fef1ef",
  accentDark: "#d45441",
  teal: "#2d4d4a",         // Zendesk kale
  green: "#228e6c",
};

// ═══════════════════════════════════════════════════════════════
// NAV — Zendesk: clean white nav, coral CTA
// ═══════════════════════════════════════════════════════════════

function Nav({ session, persona }: { session: any; persona: Persona }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <span className="w-8 h-8 flex items-center justify-center rounded-md text-[11px] font-bold text-white"
              style={{ backgroundColor: zd.accent }}>SH</span>
            <span className="font-semibold text-sm" style={{ color: "var(--ink)" }}>StudentHub</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 ml-8">
            {["How it works", "Features", "Testimonials"].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3 py-1.5 rounded-md text-sm no-underline hover:no-underline transition-colors"
                style={{ color: "var(--muted)" }}
                onMouseOver={e => e.currentTarget.style.color = "var(--ink)"}
                onMouseOut={e => e.currentTarget.style.color = "var(--muted)"}>
                {item}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {session ? (
              <Link href="/app" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110"
                style={{ backgroundColor: zd.accent }}>
                Open app <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm no-underline" style={{ color: "var(--muted)" }}>Sign in</Link>
                <Link href={`/signup?role=${persona === "company" ? "company" : "candidate"}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: zd.accent }}>
                  {persona === "company" ? "Set up account" : "Get started"}
                  <ArrowRight className="size-3.5" />
                </Link>
              </>
            )}
            <button onClick={() => setOpen(!open)} className="md:hidden p-1.5 rounded-md" style={{ color: "var(--ink)" }}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden pb-3 space-y-1">
            {["How it works", "Features", "Testimonials"].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="block px-3 py-2 rounded-md text-sm no-underline" style={{ color: "var(--muted)" }}>{item}</Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// PERSONA TOGGLE
// ═══════════════════════════════════════════════════════════════

function PersonaToggle({ persona, onChange }: { persona: Persona; onChange: (p: Persona) => void }) {
  const opts = [
    { value: "student" as Persona, label: "I'm looking for work", icon: GraduationCap },
    { value: "company" as Persona, label: "I'm hiring", icon: Building2 },
  ];
  return (
    <div className="inline-flex p-0.5 rounded-lg border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      {opts.map(opt => {
        const active = persona === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className="flex items-center gap-2 px-4 py-2 rounded-[7px] text-sm font-medium border-none cursor-pointer transition-all"
            style={{
              backgroundColor: active ? zd.accent : "transparent",
              color: active ? "white" : "var(--muted)",
            }}>
            <opt.icon className="size-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO — Zendesk: white/light bg, colorful gradient shapes,
//         large bold typography, coral accent CTA
// ═══════════════════════════════════════════════════════════════

function Hero({ persona }: { persona: Persona }) {
  return (
    <section className="pt-16 sm:pt-20 pb-0 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        <div className="flex-1 min-w-0">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
              style={{ backgroundColor: zd.accentLight, color: zd.accent }}>
              <Sparkles className="size-3" />
              {persona === "company" ? "Hire student talent in Kuwait" : "Take control of your career"}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-[clamp(34px,4.8vw,54px)] font-bold leading-[1.08] tracking-tight mb-4 max-w-[640px]"
              style={{ color: "var(--ink)" }}>
              {persona === "company"
                ? <>Find pre-vetted student talent — <span style={{ color: zd.accent }}>matched by our staff</span></>
                : <>Our staff recruiters match you with <span style={{ color: zd.accent }}>the right opportunities</span></>}
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-base sm:text-lg leading-relaxed mb-8 max-w-[520px]" style={{ color: "var(--muted)" }}>
              {persona === "company"
                ? "Post openings and get matched with pre-vetted students by our recruitment team. Manage timesheets, approvals, and payments — all in one platform."
                : "Create a profile seen by 500+ employers. Our staff recruiters match you with roles that fit your skills and schedule. AI assists every step of the way."}
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="flex flex-wrap gap-3">
              <Link href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110"
                style={{ backgroundColor: zd.accent }}>
                {persona === "company" ? "Set up company account" : "Create free profile"}
                <ArrowRight className="size-3.5" />
              </Link>
              <Link href={persona === "company" ? "/signup?role=candidate" : "/signup?role=company"}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium no-underline border transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                {persona === "company" ? "I'm a student" : "I'm hiring"}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={290}>
            <div className="flex items-center gap-3 mt-6 text-sm" style={{ color: "var(--muted)" }}>
              <div className="flex -space-x-2">
                {["A", "M", "K", "S"].map((l, i) => (
                  <div key={l} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{
                      borderColor: "var(--surface)",
                      background: `linear-gradient(135deg, hsl(${200 + i * 40}, 45%, 50%), hsl(${200 + i * 40}, 45%, 40%))`,
                    }}>{l}</div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                  style={{ borderColor: "var(--surface)", backgroundColor: "var(--surface-soft)", color: "var(--muted)" }}>+</div>
              </div>
              <span><strong style={{ color: "var(--ink)" }}>10,000+</strong> students · <strong style={{ color: "var(--ink)" }}>500+</strong> employers</span>
            </div>
          </Reveal>
        </div>

        {/* Mockup card — Zendesk: white card, subtle shadow */}
        <Reveal delay={150}>
          <div className="w-full max-w-[500px] shrink-0 rounded-xl overflow-hidden shadow-lg border"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow)",
            }}>
            {/* Chrome header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-soft)" }}>
              <div className="flex gap-1.5"><span className="size-2.5 rounded-full" style={{ backgroundColor: zd.accent }} /><span className="size-2.5 rounded-full bg-yellow-400" /><span className="size-2.5 rounded-full bg-green-500" /></div>
              <div className="flex-1 flex items-center justify-center gap-2 px-2.5 py-1 rounded text-xs" style={{ backgroundColor: "var(--paper)", color: "var(--muted)" }}>
                <Search className="size-3" /> studenthub.co
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg mb-4" style={{ backgroundColor: "var(--paper)" }}>
                <Search className="size-3.5" style={{ color: "var(--muted)" }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>Search roles, companies, locations…</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "var(--surface)", color: "var(--muted)" }}>⌘K</span>
              </div>

              <div className="p-4 rounded-lg mb-3" style={{ backgroundColor: "var(--paper)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: zd.accent }}>✨ &nbsp;Staff-recommended for you</p>
                <p className="text-xl font-bold leading-none mb-0.5" style={{ color: "var(--ink)" }}>senior care assistant</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>12 matching roles · KWD 3-5/hr</p>
                <div className="flex gap-2 mt-2.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: zd.green }}>
                    <Check className="size-2.5" /> Profile ready
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: zd.accentLight, color: zd.accent }}>
                    <Star className="size-2.5" /> Matched by recruiter
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Profile", value: "92%", color: zd.accent },
                  { label: "Apps", value: "4 active", color: zd.green },
                  { label: "Time", value: "This wk", color: "#f59e0b" },
                  { label: "Pay", value: "KWD 420", color: "#ec4899" },
                ].map(item => (
                  <div key={item.label} className="p-2.5 rounded-lg text-center" style={{ backgroundColor: "var(--paper)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: item.color }}>{item.label}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: "var(--ink)" }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// TRUST BAR — Zendesk: grayscale logos, clean
// ═══════════════════════════════════════════════════════════════

function TrustBar() {
  return (
    <section className="py-12 sm:py-16 px-6 max-w-6xl mx-auto">
      <Reveal>
        <p className="text-center text-xs font-medium mb-6" style={{ color: "var(--muted)" }}>Trusted by leading organizations across Kuwait</p>
        <div className="flex flex-wrap items-center justify-center gap-8 gap-y-4 opacity-40">
          {["Alshaya", "KIPCO", "NBK", "Zain", "Kuwait Airways", "GUST"].map(name => (
            <span key={name} className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{name}</span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════

function Stats() {
  const items = [
    { value: "10,000+", label: "Active students", icon: Users },
    { value: "500+", label: "Employer partners", icon: Building2 },
    { value: "48h", label: "Avg time-to-match", icon: Clock },
    { value: "99.7%", label: "Profile completion", icon: Shield },
  ];
  return (
    <section className="py-12 px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--border)" }}>
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 80}>
            <div style={{ backgroundColor: "var(--surface)" }} className="py-8 px-4 text-center">
              <item.icon className="size-5 mx-auto mb-2" style={{ color: zd.accent }} />
              <p className="text-2xl font-bold" style={{ color: "var(--ink)" }}>{item.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{item.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOW IT WORKS — based on actual StudentHub business process
// Staff-recruiters drive matching. AI assists. Confirmed via Dosu.
// ═══════════════════════════════════════════════════════════════

function HowItWorks({ persona }: { persona: Persona }) {
  const steps = persona === "company"
    ? [
        { num: "01", title: "Set up your account", desc: "Create your company profile in minutes. Our staff verifies your details and activates your account.", icon: Building2 },
        { num: "02", title: "Get matched students", desc: "Post a role and our recruitment team finds pre-vetted students from our network. AI assists with matching.", icon: UsersRound },
        { num: "03", title: "Hire and manage", desc: "Review students, manage timesheets, approve transfers, and track compliance — all in one dashboard.", icon: ClipboardCheck },
      ]
    : [
        { num: "01", title: "Create your profile", desc: "No CV required. Tell us about your experience, skills, and preferences. Our staff recruiters review your profile. Takes 3 minutes.", icon: GraduationCap },
        { num: "02", title: "Get matched by our staff", desc: "Our recruitment team matches you with roles that fit your profile. AI assists by finding the best-fit opportunities.", icon: Handshake },
        { num: "03", title: "Get hired and paid", desc: "Track applications, log timesheets, and receive payments directly through the platform.", icon: CreditCard },
      ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 px-6 max-w-6xl mx-auto">
      <Reveal>
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2" style={{ color: "var(--ink)" }}>
          {persona === "company" ? "How hiring works" : "How it works"}
        </h2>
        <p className="text-sm text-center mb-10" style={{ color: "var(--muted)" }}>
          {persona === "company" ? "Three steps to find your next hire" : "Three steps to find your next role"}
        </p>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <Reveal key={s.num} delay={i * 100}>
            <div className="p-6 rounded-xl border transition-shadow hover:shadow-md"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg font-bold" style={{ color: zd.accent }}>{s.num}</span>
                <s.icon className="size-4" style={{ color: "var(--muted)" }} />
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }}>{s.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FEATURES — accurate to actual StudentHub platform
// ═══════════════════════════════════════════════════════════════

function Features() {
  const items = [
    { icon: UsersRound, title: "Staff-driven matching", desc: "Our recruitment team personally reviews and matches students to roles. AI assists by finding the best-fit opportunities based on skills and experience." },
    { icon: Search, title: "Smart search", desc: "Find students or roles with faceted search across skills, location, and pay rate." },
    { icon: Clock, title: "Timesheets", desc: "Log hours, approve timesheets, and track attendance — all within the platform." },
    { icon: Shield, title: "Compliance", desc: "ID verification, right-to-work checks, document management, and certification tracking built in." },
    { icon: BarChart3, title: "Reports & analytics", desc: "Live dashboard with metrics on placements, payments, pipeline activity, and compliance status." },
    { icon: Fingerprint, title: "Role-based portals", desc: "Dedicated views for staff, admin, inspector, student, and employer — each tailored to their workflow." },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 px-6 max-w-6xl mx-auto">
      <Reveal>
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2" style={{ color: "var(--ink)" }}>Platform features</h2>
        <p className="text-sm text-center mb-10" style={{ color: "var(--muted)" }}>Everything you need to manage student placements</p>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((f, i) => (
          <Reveal key={f.title} delay={i * 60}>
            <div className="p-5 rounded-xl border transition-shadow hover:shadow-md"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <f.icon className="size-5 mb-3" style={{ color: zd.accent }} />
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════════════════════════

function Testimonials({ persona }: { persona: Persona }) {
  const list = persona === "company"
    ? [
        { quote: "The staff recruitment team found us students we would never have discovered on our own. The matching is thoughtful and relevant — not just keyword spamming.",
          author: "Noura Al-Sabah", role: "HR Director, Kuwait City Medical Group" },
        { quote: "Timesheets and payments in one dashboard. Our HR team saves 10 hours a week on admin alone.",
          author: "Faisal Al-Ali", role: "Operations Manager, Premier Healthcare" },
      ]
    : [
        { quote: "Staff took the time to understand my skills and found a role that actually fit. I went from registering to shortlisted in 6 hours.",
          author: "Amal Al-Mutairi", role: "Student, Kuwait University" },
        { quote: "The staff recruiters matched me with a role I'd never have found on my own. Getting paid through the app is seamless.",
          author: "Khalid Al-Rashid", role: "Student, GUST" },
      ];
  return (
    <section id="testimonials" className="py-16 sm:py-20 px-6 max-w-6xl mx-auto">
      <Reveal>
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-10" style={{ color: "var(--ink)" }}>
          {persona === "company" ? "Trusted by leading employers" : "Real stories from real placements"}
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((t, i) => (
          <Reveal key={i} delay={i * 100}>
            <div className="p-6 rounded-xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="size-3.5" style={{ color: "#f59e0b", fill: "#f59e0b" }} />)}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--muted)" }}>&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: zd.accent }}>
                  {t.author.split(" ").map(s => s[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>{t.author}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{t.role}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPARISON
// ═══════════════════════════════════════════════════════════════

function Comparison() {
  const rows: [string, boolean, boolean][] = [
    ["Staff-driven student matching", true, false],
    ["AI-assisted role suggestions", true, false],
    ["Integrated timesheets", true, false],
    ["Consolidated invoicing", true, false],
    ["ID verification & compliance", true, false],
    ["Role-based portals", true, false],
    ["Mobile-friendly", true, true],
    ["Free profiles", true, true],
  ];
  return (
    <section className="py-16 sm:py-20 px-6 max-w-3xl mx-auto">
      <Reveal>
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2" style={{ color: "var(--ink)" }}>Why StudentHub is different</h2>
        <p className="text-sm text-center mb-10" style={{ color: "var(--muted)" }}>See how we compare to traditional job platforms</p>
      </Reveal>
      <Reveal>
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
          <div className="grid grid-cols-[1fr_100px_100px] border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-soft)" }}>
            <div className="p-3.5 px-4" />
            <div className="p-3.5 px-4 text-center text-sm font-semibold" style={{ color: "var(--ink)" }}>StudentHub</div>
            <div className="p-3.5 px-4 text-center text-sm" style={{ color: "var(--muted)" }}>Others</div>
          </div>
          {rows.map(([feature, sh, ot], i) => (
            <div key={String(feature)} className="grid grid-cols-[1fr_100px_100px] border-b last:border-b-0"
              style={{ borderColor: "var(--border)", backgroundColor: i % 2 === 0 ? "var(--surface)" : "var(--surface-soft)" }}>
              <div className="p-3.5 px-4 flex items-center text-sm" style={{ color: "var(--muted)" }}>{String(feature)}</div>
              <div className="p-3.5 px-4 flex items-center justify-center">
                {sh ? <Check className="size-4" style={{ color: zd.green }} /> : <span className="text-xs" style={{ color: "var(--muted)" }}>—</span>}
              </div>
              <div className="p-3.5 px-4 flex items-center justify-center">
                {ot ? <Check className="size-4" style={{ color: zd.green }} /> : <span className="text-xs" style={{ color: "var(--muted)" }}>—</span>}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// CTA — Zendesk: coral accent, clean
// ═══════════════════════════════════════════════════════════════

function CTA({ persona }: { persona: Persona }) {
  return (
    <section className="py-16 sm:py-20 px-6 max-w-6xl mx-auto">
      <Reveal>
        <div className="relative overflow-hidden rounded-xl p-10 sm:p-12 text-center border"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: zd.accent }}>
            {persona === "company" ? "Start hiring today" : "Start your journey"}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: "var(--ink)" }}>
            {persona === "company" ? "Your next hire is one post away." : "Your next role is one profile away."}
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            {persona === "company"
              ? "Set up in under 5 minutes. Our recruitment team matches you with vetted candidates."
              : "Create your free profile in 3 minutes. No CV required. Staff recruiters do the matching."}
          </p>
          <Link href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110"
            style={{ backgroundColor: zd.accent }}>
            {persona === "company" ? "Set up company account" : "Create your free profile"} <ChevronRight className="size-3.5" />
          </Link>
          <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
            {persona === "company" ? "No agency fees · Staff-matched" : "Free · 3 minutes"}
          </p>
        </div>
      </Reveal>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════

function Footer({ persona }: { persona: Persona }) {
  const role = persona === "company" ? "company" : "candidate";
  return (
    <footer className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 flex items-center justify-center rounded text-[10px] font-bold text-white" style={{ backgroundColor: zd.accent }}>SH</span>
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>StudentHub</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>Connecting students with the right employers. Kuwait&apos;s platform for student placement.</p>
          </div>
          {[
            { t: "For students", links: ["Create profile", "Sign in"] },
            { t: "For employers", links: ["Set up account", "Sign in"] },
            { t: "Platform", links: ["Staff portal", "Admin dashboard", "Inspector portal"] },
          ].map(c => (
            <div key={c.t}>
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>{c.t}</p>
              {c.links.map(l => <p key={l} className="text-xs mb-2" style={{ color: "var(--muted)" }}>{l}</p>)}
            </div>
          ))}
        </div>
        <div className="mt-8 pt-5 flex items-center justify-between border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--muted)" }}>&copy; {new Date().getFullYear()} StudentHub</p>
          <div className="flex gap-4">
            <Link href="/login" className="text-xs no-underline" style={{ color: "var(--muted)" }}>Sign in</Link>
            <Link href={`/signup?role=${role}`} className="text-xs no-underline font-medium" style={{ color: "var(--muted)" }}>Sign up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════

export default function LandingContent({ session }: LandingContentProps) {
  const sp = useSearchParams();
  const router = useRouter();
  const [persona, setPersona] = useState<Persona>("student");

  useEffect(() => { setPersona(sp.get("persona") === "company" ? "company" : "student"); }, [sp]);

  const handlePersonaChange = useCallback((p: Persona) => {
    const params = new URLSearchParams(sp.toString());
    if (p === "student") params.delete("persona"); else params.set("persona", p);
    router.replace(params.toString() ? `/?${params}` : "/", { scroll: false });
  }, [router, sp]);

  return (
    <div
      data-theme="light"
      style={{
        "--ink": "#182230",
        "--muted": "#667085",
        "--paper": "#f5f7fa",
        "--surface": "#ffffff",
        "--surface-soft": "#f7f8fa",
        "--border": "#d6dce7",
        "--shadow": "0 4px 24px rgba(0,0,0,0.08)",
        backgroundColor: "#f5f7fa",
        minHeight: "100svh",
      } as React.CSSProperties}
    >
      <a href="#main-content" className="skipLink" style={{ color: "var(--ink)" }}>Skip to content</a>
      <Nav session={session} persona={persona} />
      <main id="main-content">
        <div className="pt-5 pb-1 flex justify-center">
          <PersonaToggle persona={persona} onChange={handlePersonaChange} />
        </div>
        <Hero persona={persona} />
        <TrustBar />
        <Stats />
        <HowItWorks persona={persona} />
        <Features />
        <Testimonials persona={persona} />
        <Comparison />
        <CTA persona={persona} />
      </main>
      <Footer persona={persona} />
    </div>
  );
}

export type { LandingContentProps };
