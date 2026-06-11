"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Sparkles, GraduationCap, Building2,
  Search, Zap, Shield, Clock, Check,
  Star, Users, Briefcase, BarChart3, Fingerprint,
  Menu, X
} from "lucide-react";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";

type Persona = "candidate" | "company";

interface LandingContentProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

// ── Scroll reveal hook ────────────────────────────────────────

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
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
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════

function Nav({ session, persona }: { session: any; persona: Persona }) {
  const [open, setOpen] = useState(false);
  const role = persona === "company" ? "company" : "candidate";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl"
      style={{ background: "rgba(10,10,11,0.85)" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span className="w-9 h-9 flex items-center justify-center rounded-lg font-black text-sm"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
              SH
            </span>
            <span className="font-bold text-sm text-white">StudentHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {["How it works", "Features", "Testimonials"].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3.5 py-2 rounded-lg text-sm text-white/60 hover:text-white no-underline transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <Link href="/app" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold no-underline text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                Open app <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm text-white/60 no-underline hover:text-white">Sign in</Link>
                <Link href={`/signup?role=${role}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold no-underline text-white"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {persona === "company" ? "Set up company" : "Get started"}
                  <ArrowRight className="size-3.5" />
                </Link>
              </>
            )}
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {["How it works", "Features", "Testimonials"].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="block px-3 py-2 rounded-lg text-sm text-white/70 no-underline">
                {item}
              </Link>
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
  return (
    <div className="flex gap-1 p-1 rounded-xl w-fit mx-auto bg-white/[0.06] border border-white/[0.08]">
      {[
        { value: "candidate" as Persona, label: "I'm a student", icon: GraduationCap },
        { value: "company" as Persona, label: "I'm an employer", icon: Building2 },
      ].map(opt => {
        const active = persona === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className={`flex items-center gap-2 px-[18px] py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-all duration-200 ${
              active ? "shadow-lg text-white" : "text-white/50"
            }`}
            style={{
              background: active ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
              boxShadow: active ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
            }}>
            <opt.icon className="size-4" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION WRAPPER
// ═══════════════════════════════════════════════════════════════

function Section({ children, id, className = "" }: { children: React.ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={`relative py-20 px-6 max-w-[1200px] mx-auto ${className}`}>
      {children}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════

function Hero({ persona }: { persona: Persona }) {
  return (
    <Section className="pt-10 pb-0">
      <div className="relative">
        {/* Backdrop glow */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.12] pointer-events-none blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.25), transparent)" }} aria-hidden="true" />

        <div className="relative z-[1]">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border"
              style={{ background: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.2)", color: "#6366f1" }}>
              <Sparkles className="size-3" />
              Two-sided marketplace for student talent
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-[clamp(36px,6.5vw,68px)] font-black leading-[1.05] tracking-[-0.03em] max-w-[800px] mb-4">
              <span className="text-white">Connecting students with </span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                the right employers
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-lg leading-relaxed max-w-[560px] text-white/50 mb-8">
              {persona === "company"
                ? "Post openings, get AI-matched candidates, manage timesheets and payments — all in one platform built for Kuwait."
                : "Create a profile seen by 500+ employers. Get AI-matched roles, one-tap timesheets, and direct payments."}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-wrap gap-3 mb-5">
              <Link href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
                className="group inline-flex items-center gap-1.5 px-7 py-3.5 rounded-xl text-base font-semibold no-underline text-white transition-all duration-300 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 24px rgba(99,102,241,0.3)" }}>
                {persona === "company" ? "Set up company account" : "Create your free profile"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href={persona === "company" ? "/signup?role=candidate" : "/signup?role=company"}
                className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-xl text-base font-medium no-underline text-white/60 border border-white/[0.08] hover:text-white transition-colors">
                {persona === "company" ? "I'm a student looking for work" : "I'm an employer hiring talent"}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="flex items-center gap-3 mb-12">
              <div className="flex">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0a0a0b] flex items-center justify-center text-[10px] font-bold text-white -ml-[8px] first:ml-0"
                    style={{ background: `linear-gradient(135deg, hsl(${200 + i * 40}, 70%, 50%), hsl(${200 + i * 40}, 70%, 40%))` }}>
                    {["A", "M", "K", "S"][i - 1]}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0b] flex items-center justify-center text-[10px] font-bold -ml-2 bg-white/[0.06] text-white/30">+</div>
              </div>
              <p className="text-sm text-white/50">
                <span className="text-white font-semibold">10,000+</span> students connected with{" "}
                <span className="text-white font-semibold">500+</span> employers
              </p>
            </div>
          </Reveal>

          {/* App mockup */}
          <Reveal delay={400}>
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)" }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-black/30">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-500/50" />
                  <span className="size-2.5 rounded-full bg-amber-500/50" />
                  <span className="size-2.5 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-md text-xs bg-white/[0.04] text-white/30">
                  <Search className="size-3" />
                  studenthub.co
                </div>
              </div>

              {/* Mockup body */}
              <div className="p-6 sm:p-7">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                  {/* Main content */}
                  <div>
                    {/* Search bar */}
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-5 bg-white/[0.03] border border-white/[0.06]">
                      <Search className="size-4 shrink-0 text-white/30" />
                      <span className="text-sm text-white/20">Search open roles, companies, locations...</span>
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded font-mono bg-white/[0.06] text-white/30">⌘K</span>
                    </div>

                    {/* Search result */}
                    <div className="rounded-xl p-5 mb-4 bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2 text-indigo-400">✨ Matched for you</p>
                      <p className="text-[clamp(20px,2.5vw,28px)] font-black text-white leading-none mb-1">senior care assistant</p>
                      <p className="text-sm text-white/50">12 matching roles · Kuwait City · KWD 3-5/hr · Starts ASAP</p>
                      <div className="flex gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-green-500/20"
                          style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                          <Check className="size-3" /> Profile ready
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-indigo-500/20"
                          style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
                          <Star className="size-3" /> 3 saved roles
                        </span>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Profile", value: "92% complete", color: "#6366f1" },
                        { label: "Applications", value: "4 pending", color: "#22c55e" },
                        { label: "Timesheet", value: "This week", color: "#f59e0b" },
                        { label: "Payment", value: "KWD 420", color: "#ec4899" },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06] transition-all hover:-translate-y-0.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1" style={{ color: item.color }}>{item.label}</p>
                          <p className="text-sm font-bold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: Users, label: "Applications", value: "12 new", color: "#6366f1" },
                      { icon: Briefcase, label: "Saved jobs", value: "8 matches", color: "#22c55e" },
                      { icon: BarChart3, label: "Profile views", value: "47 this week", color: "#f59e0b" },
                      { icon: Fingerprint, label: "Verification", value: "ID pending", color: "#ec4899" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="size-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}15` }}>
                          <item.icon className="size-4" style={{ color: item.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{item.label}</p>
                          <p className="text-[11px] text-white/50">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════

function Stats() {
  const stats = [
    { value: "10,000+", label: "Active students", icon: Users },
    { value: "500+", label: "Employer partners", icon: Building2 },
    { value: "48h", label: "Avg time-to-match", icon: Zap },
    { value: "99.7%", label: "Profile completion", icon: Shield },
    { value: "Since 2022", label: "Serving Kuwait", icon: Clock },
  ];
  return (
    <Section>
      <div className="grid grid-cols-5 gap-px rounded-2xl overflow-hidden border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.06)" }}>
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 60} className="bg-[#0a0a0b]">
            <div className="py-8 px-4 text-center">
              <s.icon className="size-5 mx-auto mb-2 text-indigo-400" />
              <p className="text-[clamp(18px,1.8vw,24px)] font-black text-white">{s.value}</p>
              <p className="text-xs text-white/50 mt-1">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════════════════════════════

function HowItWorks({ persona }: { persona: Persona }) {
  const steps = persona === "company"
    ? [
        { step: "01", title: "Create your company profile", desc: "Set up your account in under 5 minutes. Add your company details, tell us what you're looking for." },
        { step: "02", title: "Post openings and get matches", desc: "Describe the role you need filled. Our AI instantly matches you with pre-vetted candidates." },
        { step: "03", title: "Review, hire, and manage", desc: "Review matched candidates, schedule interviews, and manage timesheets and payments — all in one place." },
      ]
    : [
        { step: "01", title: "Create your free profile", desc: "No CV required. Just tell us about your experience, skills, and what you're looking for. Takes 3 minutes." },
        { step: "02", title: "Get AI-matched with roles", desc: "Our matching engine finds roles that fit your profile. Review matches and apply with one click." },
        { step: "03", title: "Get hired and get paid", desc: "Track applications, log timesheets, and receive payments directly through the platform." },
      ];

  return (
    <Section id="how-it-works">
      <Reveal>
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-400 mb-3">How it works</p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-black text-white">
            {persona === "company" ? "Hire in three simple steps" : "Get started in three simple steps"}
          </h2>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={i * 120}>
            <div className="p-8 rounded-2xl h-full bg-white/[0.03] border border-white/[0.06] transition-all hover:-translate-y-0.5">
              <p className="text-4xl font-black mb-4 bg-gradient-to-r from-indigo-500/30 to-transparent bg-clip-text text-transparent">
                {s.step}
              </p>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FEATURES
// ═══════════════════════════════════════════════════════════════

function Features() {
  const items = [
    { icon: Zap, title: "AI-powered matching", desc: "Matches candidates to roles based on skills, experience, and preferences — not keywords.", color: "#6366f1" },
    { icon: Search, title: "Advanced search & filters", desc: "Find what you need with faceted search across skills, location, pay rate, and more.", color: "#22c55e" },
    { icon: Clock, title: "Integrated timesheets", desc: "Log hours, approve timesheets, and track attendance — no spreadsheets.", color: "#f59e0b" },
    { icon: Shield, title: "Compliance & verification", desc: "ID verification, document management, and compliance tracking in every workflow.", color: "#ec4899" },
    { icon: BarChart3, title: "Real-time analytics", desc: "Live metrics on placements, payments, and pipeline activity for every role.", color: "#06b6d4" },
    { icon: Fingerprint, title: "Role-based portals", desc: "Staff, admin, inspector, candidate, and employer — each with the right tools.", color: "#a855f7" },
  ];
  return (
    <Section id="features">
      <Reveal>
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-400 mb-3">Platform features</p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-black text-white max-w-[520px] mx-auto">Everything you need to manage student placements</h2>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((f, i) => (
          <Reveal key={f.title} delay={i * 60}>
            <div className="p-7 rounded-2xl h-full bg-white/[0.03] border border-white/[0.06] transition-all hover:-translate-y-0.5">
              <div className="size-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}15` }}>
                <f.icon className="size-5" style={{ color: f.color }} />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════════════════════════

function Testimonials({ persona }: { persona: Persona }) {
  const ts = persona === "company"
    ? [
        { quote: "We've been using StudentHub for 6 months. The AI matching saves us hours every week.", author: "Noura Al-Sabah", role: "HR Director" },
        { quote: "Timesheets and payments alone are worth it. No more chasing spreadsheets.", author: "Faisal Al-Ali", role: "Operations Manager" },
      ]
    : [
        { quote: "I found my first job within a week. The AI matched me with a role I wouldn't have found on my own.", author: "Amal Al-Mutairi", role: "Student, Kuwait University" },
        { quote: "Tracking applications and getting paid directly through the app is a game changer.", author: "Khalid Al-Rashid", role: "Student, GUST" },
      ];

  return (
    <Section id="testimonials">
      <Reveal>
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-400 mb-3">Testimonials</p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-black text-white">Trusted by students and employers</h2>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ts.map((t, i) => (
          <Reveal key={i} delay={i * 120}>
            <div className="p-7 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="size-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-[15px] leading-relaxed mb-5 text-white/80">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {t.author.split(" ").map(s => s[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.author}</p>
                  <p className="text-xs text-white/50">{t.role}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPARISON
// ═══════════════════════════════════════════════════════════════

function Comparison() {
  const rows = [
    { f: "AI-matched candidate suggestions", sh: true, ot: false },
    { f: "One-tap timesheets and approvals", sh: true, ot: false },
    { f: "Consolidated monthly invoicing", sh: true, ot: false },
    { f: "ID verification & compliance", sh: true, ot: false },
    { f: "Real-time analytics dashboard", sh: true, ot: false },
    { f: "Role-based portals", sh: true, ot: false },
    { f: "Mobile-friendly interface", sh: true, ot: true },
    { f: "Free candidate profiles", sh: true, ot: true },
  ];
  return (
    <Section>
      <Reveal>
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-400 mb-3">Comparison</p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-black text-white max-w-[480px] mx-auto">Why StudentHub is different</h2>
        </div>
      </Reveal>
      <Reveal>
        <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
          <div className="grid grid-cols-[1fr_120px_120px] border-b border-white/[0.06] bg-white/[0.06]">
            <div className="p-4 sm:p-5" />
            <div className="p-4 sm:p-5 text-center"><span className="font-bold text-sm text-white">StudentHub</span></div>
            <div className="p-4 sm:p-5 text-center"><span className="text-sm text-white/50">Others</span></div>
          </div>
          {rows.map((r, i) => (
            <div key={r.f} className={`grid grid-cols-[1fr_120px_120px] border-b border-white/[0.04] ${i % 2 === 0 ? "" : "bg-white/[0.03]"}`}>
              <div className="p-4 sm:p-5 flex items-center"><span className="text-sm text-white/60">{r.f}</span></div>
              <div className="p-4 sm:p-5 flex items-center justify-center">
                {r.sh
                  ? <div className="size-6 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}><Check className="size-3.5 text-green-500" /></div>
                  : <span className="text-xs text-white/20">—</span>}
              </div>
              <div className="p-4 sm:p-5 flex items-center justify-center">
                {r.ot
                  ? <div className="size-6 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}><Check className="size-3.5 text-green-500" /></div>
                  : <span className="text-xs text-white/20">—</span>}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FINAL CTA
// ═══════════════════════════════════════════════════════════════

function FinalCTA({ persona }: { persona: Persona }) {
  return (
    <Section>
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl py-16 px-8 sm:px-12 text-center border border-indigo-500/15"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))" }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-20 blur-[120px] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent)" }} />
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-400 mb-3">
              {persona === "company" ? "Start hiring today" : "Start your journey"}
            </p>
            <h2 className="text-[clamp(24px,3vw,36px)] font-black text-white max-w-[450px] mx-auto">
              {persona === "company" ? "Your next hire is one post away." : "Your next role is one profile away."}
            </h2>
            <p className="mt-3 mb-8 max-w-[440px] mx-auto text-sm text-white/50">
              {persona === "company" ? "Set up your company account in under 5 minutes and get matched with vetted candidates." : "Create your free profile in under 3 minutes. No CV required."}
            </p>
            <Link href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
              className="group inline-flex items-center gap-1.5 px-7 py-3.5 rounded-xl text-base font-semibold no-underline text-white transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 24px rgba(99,102,241,0.3)" }}>
              {persona === "company" ? "Set up company account" : "Create your free profile"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="mt-3 text-[11px] text-white/30">
              {persona === "company" ? "No agency fees · AI-matched candidates" : "Free · 3 minutes · No CV needed"}
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════

function Footer({ persona }: { persona: Persona }) {
  const role = persona === "company" ? "company" : "candidate";
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="size-8 flex items-center justify-center rounded-lg font-black text-[11px] text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>SH</span>
              <span className="font-bold text-sm text-white">StudentHub</span>
            </div>
            <p className="text-xs leading-relaxed text-white/50">Connecting students with the right employers. Two-sided marketplace for Kuwait.</p>
          </div>
          {[
            { t: "For students", l: ["Create free profile", "Sign in"] },
            { t: "For employers", l: ["Set up company account", "Sign in"] },
            { t: "Platform", l: ["Staff tools", "Admin dashboard", "Inspector portal"] },
          ].map(c => (
            <div key={c.t}>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 mb-3">{c.t}</p>
              {c.l.map(l => <p key={l} className="text-xs text-white/50 mb-2">{l}</p>)}
            </div>
          ))}
        </div>
        <div className="mt-10 pt-5 flex items-center justify-between border-t border-white/[0.06]">
          <p className="text-[11px] text-white/30">&copy; {new Date().getFullYear()} StudentHub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="text-[11px] text-white/30 no-underline hover:text-white/60">Sign in</Link>
            <Link href={`/signup?role=${role}`} className="text-[11px] text-white/50 no-underline font-medium hover:text-white">Sign up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

export default function LandingContent({ session }: LandingContentProps) {
  const sp = useSearchParams();
  const router = useRouter();
  const [persona, setPersona] = useState<Persona>("candidate");

  useEffect(() => {
    setPersona(sp.get("persona") === "company" ? "company" : "candidate");
  }, [sp]);

  const handlePersonaChange = useCallback((p: Persona) => {
    const params = new URLSearchParams(sp.toString());
    if (p === "candidate") params.delete("persona");
    else params.set("persona", p);
    router.replace(params.toString() ? `/?${params}` : "/", { scroll: false });
  }, [router, sp]);

  return (
    <div className="bg-[#0a0a0b] min-h-svh">
      <a href="#main-content" className="skipLink">Skip to content</a>
      <Nav session={session} persona={persona} />
      <main id="main-content">
        <div className="pt-6 pb-2 flex justify-center">
          <PersonaToggle persona={persona} onChange={handlePersonaChange} />
        </div>
        <Hero persona={persona} />
        <Stats />
        <HowItWorks persona={persona} />
        <Features />
        <Testimonials persona={persona} />
        <Comparison />
        <FinalCTA persona={persona} />
      </main>
      <Footer persona={persona} />
    </div>
  );
}

export type { LandingContentProps };
