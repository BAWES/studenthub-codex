"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Sparkles, GraduationCap, Building2, Search, Check,
  Star, Users, Briefcase, BarChart3, Fingerprint, Menu, X,
  Clock, Zap, Shield, ChevronRight, Eye, CreditCard, FileText
} from "lucide-react";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";

type Persona = "candidate" | "company";

interface LandingContentProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

// ── Scroll reveal (IntersectionObserver — lightweight) ─────────

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

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── Zendesk Garden-inspired palette ───────────────────────────
// Primary blue: #1f73b7 (Zendesk primary)
// Neutral greys: warm-toned, not pure #0a0a0b
// Elevation: subtle shadows, not harsh borders
// Hierarchy: blue for interactive, grey for static

const theme = {
  bg: "#1a1a1d",
  surface: "#232326",
  surfaceHover: "#2a2a2e",
  border: "#333338",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  dim: "#71717a",
  primary: "#1f73b7",
  primaryHover: "#1a64a0",
  primaryLight: "rgba(31,115,183,0.12)",
  success: "#228e6c",
  successLight: "rgba(34,142,108,0.12)",
  warning: "#c4841d",
  danger: "#c42a2a",
  black: "#18181b",
};

// ═══════════════════════════════════════════════════════════════
// NAV — Zendesk Garden: clean, minimal, primary blue accent
// ═══════════════════════════════════════════════════════════════

function Nav({ session, persona }: { session: any; persona: Persona }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: "rgba(26,26,29,0.92)", borderColor: theme.border, backdropFilter: "blur(16px)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <span className="w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold" style={{ backgroundColor: theme.primary, color: "white" }}>SH</span>
            <span className="font-semibold text-sm" style={{ color: theme.text }}>StudentHub</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 ml-8">
            {["How it works", "Features", "Testimonials"].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3 py-1.5 rounded-md text-sm no-underline hover:no-underline transition-colors" style={{ color: theme.muted }}
                onMouseOver={e => e.currentTarget.style.color = theme.text}
                onMouseOut={e => e.currentTarget.style.color = theme.muted}>
                {item}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            {session ? (
              <Link href="/app" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium no-underline" style={{ backgroundColor: theme.primary, color: "white" }}>
                Open app <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm no-underline" style={{ color: theme.muted }}>Sign in</Link>
                <Link href={`/signup?role=${persona === "company" ? "company" : "candidate"}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium no-underline" style={{ backgroundColor: theme.primary, color: "white" }}>
                  {persona === "company" ? "Set up account" : "Get started"}
                  <ArrowRight className="size-3.5" />
                </Link>
              </>
            )}
            <button onClick={() => setOpen(!open)} className="md:hidden p-1.5 rounded-md" style={{ color: theme.text }}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden pb-3 space-y-1">
            {["How it works", "Features", "Testimonials"].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="block px-3 py-2 rounded-md text-sm no-underline" style={{ color: theme.muted }}>{item}</Link>
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
    { value: "candidate" as Persona, label: "I'm looking for work", icon: GraduationCap },
    { value: "company" as Persona, label: "I'm hiring", icon: Building2 },
  ];
  return (
    <div className="inline-flex p-0.5 rounded-lg" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
      {opts.map(opt => {
        const active = persona === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className="flex items-center gap-2 px-4 py-2 rounded-[7px] text-sm font-medium border-none cursor-pointer transition-all"
            style={{
              backgroundColor: active ? theme.primary : "transparent",
              color: active ? "white" : theme.dim,
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
// HERO — Zendesk Garden: clean hierarchy, blue primary, elevation
// ═══════════════════════════════════════════════════════════════

function Hero({ persona }: { persona: Persona }) {
  return (
    <section className="pt-16 pb-0 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Text column */}
        <div className="flex-1 min-w-0">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ backgroundColor: theme.primaryLight, color: "#6ab0e6" }}>
              <Sparkles className="size-3" />
              Two-sided marketplace
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-[clamp(32px,4.5vw,52px)] font-bold leading-[1.1] tracking-tight mb-4" style={{ color: theme.text }}>
              Connecting students with <span style={{ color: theme.primary }}>the right employers</span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: theme.dim }}>
              {persona === "company"
                ? "Post openings, get AI-matched candidates, and manage timesheets and payments — all in one platform."
                : "Create a profile seen by 500+ employers. Get AI-matched roles and one-tap payments."}
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="flex flex-wrap gap-3">
              <Link href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium no-underline transition-all hover:brightness-110"
                style={{ backgroundColor: theme.primary, color: "white" }}>
                {persona === "company" ? "Set up company account" : "Create free profile"}
                <ArrowRight className="size-3.5" />
              </Link>
              <Link href={persona === "company" ? "/signup?role=candidate" : "/signup?role=company"}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium no-underline border transition-colors hover:bg-white/[0.04]"
                style={{ borderColor: theme.border, color: theme.muted }}>
                {persona === "company" ? "I'm a student" : "I'm hiring"}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={290}>
            <div className="flex items-center gap-3 mt-6 text-sm" style={{ color: theme.dim }}>
              <div className="flex -space-x-2">
                {["A", "M", "K", "S"].map((l, i) => (
                  <div key={l} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                    style={{
                      borderColor: theme.bg,
                      color: "white",
                      background: `linear-gradient(135deg, hsl(${200 + i * 40}, 45%, 50%), hsl(${200 + i * 40}, 45%, 40%))`,
                    }}>{l}</div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                  style={{ borderColor: theme.bg, backgroundColor: theme.surface, color: theme.dim }}>+</div>
              </div>
              <span><strong style={{ color: theme.text }}>10,000+</strong> students · <strong style={{ color: theme.text }}>500+</strong> employers</span>
            </div>
          </Reveal>
        </div>

        {/* Mockup — Zendesk: clean card, subtle shadow, blue accent */}
        <Reveal delay={150}>
          <div className="w-full max-w-[520px] shrink-0 rounded-xl overflow-hidden shadow-2xl border" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
            {/* Chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: theme.border, backgroundColor: theme.black }}>
              <div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-red-600/60" /><span className="size-2.5 rounded-full bg-yellow-600/60" /><span className="size-2.5 rounded-full bg-green-600/60" /></div>
              <div className="flex-1 flex items-center justify-center gap-2 px-2.5 py-1 rounded text-xs" style={{ backgroundColor: theme.surface, color: theme.dim }}>
                <Search className="size-3" /> studenthub.co
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg mb-4" style={{ backgroundColor: theme.black }}>
                <Search className="size-3.5" style={{ color: theme.dim }} />
                <span className="text-xs" style={{ color: theme.dim }}>Search roles, companies, locations…</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: theme.surface, color: theme.dim }}>⌘K</span>
              </div>

              <div className="p-4 rounded-lg mb-3" style={{ backgroundColor: theme.black }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#6ab0e6" }}>✨ Matched for you</p>
                <p className="text-xl font-bold leading-none mb-0.5" style={{ color: theme.text }}>senior care assistant</p>
                <p className="text-xs" style={{ color: theme.dim }}>12 matching roles · KWD 3-5/hr</p>
                <div className="flex gap-2 mt-2.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.successLight, color: "#4ade80" }}>
                    <Check className="size-2.5" /> Profile ready
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.primaryLight, color: "#6ab0e6" }}>
                    <Star className="size-2.5" /> 3 saved
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Profile", value: "92%", color: "#6ab0e6" },
                  { label: "Apps", value: "4 pend", color: "#4ade80" },
                  { label: "Time", value: "This wk", color: "#fbbf24" },
                  { label: "Pay", value: "KWD 420", color: "#f472b6" },
                ].map(item => (
                  <div key={item.label} className="p-2.5 rounded-lg text-center" style={{ backgroundColor: theme.black }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: item.color }}>{item.label}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: theme.text }}>{item.value}</p>
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
// LOGO CLOUD / TRUST BAR — Zendesk: lightweight, simple
// ═══════════════════════════════════════════════════════════════

function TrustBar() {
  return (
    <section className="py-12 px-6 max-w-6xl mx-auto">
      <Reveal>
        <p className="text-center text-xs font-medium mb-6" style={{ color: theme.dim }}>Trusted by leading organizations across Kuwait</p>
        <div className="flex flex-wrap items-center justify-center gap-8 gap-y-4 opacity-40">
          {["Alshaya", "KIPCO", "NBK", "Zain", "Kuwait Airways", "GUST"].map(name => (
            <span key={name} className="text-sm font-semibold" style={{ color: theme.muted }}>{name}</span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATS — Zendesk: clean grid, minimal
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden" style={{ backgroundColor: theme.border }}>
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 80}>
            <div className="py-8 px-4 text-center" style={{ backgroundColor: theme.bg }}>
              <item.icon className="size-5 mx-auto mb-2" style={{ color: "#6ab0e6" }} />
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{item.value}</p>
              <p className="text-xs mt-1" style={{ color: theme.dim }}>{item.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOW IT WORKS — Zendesk: 3-column, cards with elevation
// ═══════════════════════════════════════════════════════════════

function HowItWorks({ persona }: { persona: Persona }) {
  const steps = persona === "company"
    ? [
        { num: "01", title: "Create your profile", desc: "Set up your company account in minutes. Add your details and tell us what you're looking for.", icon: Building2 },
        { num: "02", title: "Get matched candidates", desc: "Post a role and our AI instantly matches you with pre-vetted candidates from our network.", icon: Users },
        { num: "03", title: "Hire and manage", desc: "Review candidates, schedule interviews, and manage timesheets and payments — all in one place.", icon: Briefcase },
      ]
    : [
        { num: "01", title: "Create your profile", desc: "No CV required. Tell us about your experience, skills, and what you're looking for. Takes 3 minutes.", icon: GraduationCap },
        { num: "02", title: "Get matched with roles", desc: "Our AI finds roles that fit your profile. Review your matches and apply with one click.", icon: Zap },
        { num: "03", title: "Get hired and paid", desc: "Track applications, log timesheets, and receive payments directly through the platform.", icon: CreditCard },
      ];

  return (
    <section id="how-it-works" className="py-16 px-6 max-w-6xl mx-auto">
      <Reveal>
        <h2 className="text-xl font-bold text-center mb-2" style={{ color: theme.text }}>
          {persona === "company" ? "How hiring works" : "How it works"}
        </h2>
        <p className="text-sm text-center mb-10" style={{ color: theme.dim }}>
          {persona === "company" ? "Three steps to find your next hire" : "Three steps to find your next role"}
        </p>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <Reveal key={s.num} delay={i * 100}>
            <div className="p-6 rounded-xl" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg font-bold" style={{ color: theme.primary }}>{s.num}</span>
                <s.icon className="size-4" style={{ color: theme.dim }} />
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: theme.text }}>{s.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: theme.dim }}>{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FEATURES — Zendesk: clean grid, icon + text, no decorative crap
// ═══════════════════════════════════════════════════════════════

function Features() {
  const items = [
    { icon: Zap, title: "AI matching", desc: "Matches candidates to roles based on actual skills and experience, not just keywords." },
    { icon: Search, title: "Smart search", desc: "Find candidates or roles with faceted search across skills, location, and pay rate." },
    { icon: Clock, title: "Timesheets", desc: "Log hours, approve timesheets, and track attendance — all within the platform." },
    { icon: Shield, title: "Compliance", desc: "ID verification, document management, and compliance tracking built in." },
    { icon: Eye, title: "Analytics", desc: "Live dashboard with metrics on placements, payments, and pipeline activity." },
    { icon: Fingerprint, title: "Role portals", desc: "Dedicated views for staff, admin, inspector, candidate, and employer roles." },
  ];

  return (
    <section id="features" className="py-16 px-6 max-w-6xl mx-auto">
      <Reveal>
        <h2 className="text-xl font-bold text-center mb-2" style={{ color: theme.text }}>Platform features</h2>
        <p className="text-sm text-center mb-10" style={{ color: theme.dim }}>Everything you need to manage student placements</p>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((f, i) => (
          <Reveal key={f.title} delay={i * 60}>
            <div className="p-5 rounded-xl transition-colors" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
              <f.icon className="size-5 mb-3" style={{ color: "#6ab0e6" }} />
              <h3 className="text-sm font-semibold mb-1" style={{ color: theme.text }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: theme.dim }}>{f.desc}</p>
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
        { quote: "StudentHub transformed our hiring. The AI matching saves us hours every week.", author: "Noura Al-Sabah", role: "HR Director" },
        { quote: "Timesheets and payments alone are worth it. Everything in one dashboard.", author: "Faisal Al-Ali", role: "Operations Manager" },
      ]
    : [
        { quote: "Found my first job within a week. The AI matched me with a role I'd never have found.", author: "Amal Al-Mutairi", role: "Student, Kuwait University" },
        { quote: "Getting paid through the app is a game changer. No more chasing payments.", author: "Khalid Al-Rashid", role: "Student, GUST" },
      ];
  return (
    <section id="testimonials" className="py-16 px-6 max-w-6xl mx-auto">
      <Reveal>
        <h2 className="text-xl font-bold text-center mb-10" style={{ color: theme.text }}>Trusted by students and employers</h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((t, i) => (
          <Reveal key={i} delay={i * 100}>
            <div className="p-6 rounded-xl" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="size-3.5" style={{ color: "#f59e0b", fill: "#f59e0b" }} />)}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: theme.muted }}>&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: theme.primary }}>
                  {t.author.split(" ").map(s => s[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.text }}>{t.author}</p>
                  <p className="text-xs" style={{ color: theme.dim }}>{t.role}</p>
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
// COMPARISON TABLE — Zendesk: clean data display
// ═══════════════════════════════════════════════════════════════

function Comparison() {
  const rows = [
    ["AI-matched suggestions", true, false],
    ["One-tap timesheets", true, false],
    ["Consolidated invoicing", true, false],
    ["ID verification", true, false],
    ["Analytics dashboard", true, false],
    ["Role-based portals", true, false],
    ["Mobile-friendly", true, true],
    ["Free profiles", true, true],
  ];
  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      <Reveal>
        <h2 className="text-xl font-bold text-center mb-2" style={{ color: theme.text }}>Why StudentHub is different</h2>
        <p className="text-sm text-center mb-10" style={{ color: theme.dim }}>See how we compare to traditional job platforms</p>
      </Reveal>
      <Reveal>
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: theme.border }}>
          <div className="grid grid-cols-[1fr_100px_100px] border-b" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
            <div className="p-3.5 px-4" />
            <div className="p-3.5 px-4 text-center text-sm font-semibold" style={{ color: theme.text }}>StudentHub</div>
            <div className="p-3.5 px-4 text-center text-sm" style={{ color: theme.dim }}>Others</div>
          </div>
          {rows.map(([feature, sh, ot], i) => (
            <div key={String(feature)} className="grid grid-cols-[1fr_100px_100px] border-b last:border-b-0" style={{ borderColor: theme.border, backgroundColor: i % 2 === 0 ? "transparent" : theme.surface }}>
              <div className="p-3.5 px-4 flex items-center text-sm" style={{ color: theme.muted }}>{String(feature)}</div>
              <div className="p-3.5 px-4 flex items-center justify-center">
                {sh ? <Check className="size-4" style={{ color: "#4ade80" }} /> : <span className="text-xs" style={{ color: theme.dim }}>—</span>}
              </div>
              <div className="p-3.5 px-4 flex items-center justify-center">
                {ot ? <Check className="size-4" style={{ color: "#4ade80" }} /> : <span className="text-xs" style={{ color: theme.dim }}>—</span>}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// CTA — Zendesk: primary blue, clear action
// ═══════════════════════════════════════════════════════════════

function CTA({ persona }: { persona: Persona }) {
  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <Reveal>
        <div className="relative rounded-xl overflow-hidden p-10 sm:p-12 text-center" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6ab0e6" }}>
            {persona === "company" ? "Start hiring today" : "Start your journey"}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: theme.text }}>
            {persona === "company" ? "Your next hire is one post away." : "Your next role is one profile away."}
          </h2>
          <p className="text-sm mb-6" style={{ color: theme.dim }}>
            {persona === "company"
              ? "Set up in under 5 minutes and get matched with vetted candidates."
              : "Create your free profile in 3 minutes. No CV required."}
          </p>
          <Link href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium no-underline transition-all hover:brightness-110"
            style={{ backgroundColor: theme.primary, color: "white" }}>
            {persona === "company" ? "Set up company account" : "Create your free profile"} <ChevronRight className="size-3.5" />
          </Link>
          <p className="text-xs mt-3" style={{ color: theme.dim }}>
            {persona === "company" ? "No agency fees · AI-matched" : "Free · 3 minutes"}
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
    <footer className="border-t" style={{ borderColor: theme.border }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 flex items-center justify-center rounded text-[10px] font-bold text-white" style={{ backgroundColor: theme.primary }}>SH</span>
              <span className="text-sm font-semibold" style={{ color: theme.text }}>StudentHub</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: theme.dim }}>Connecting students with the right employers. Kuwait&apos;s platform for student placement.</p>
          </div>
          {[
            { t: "For students", links: ["Create profile", "Sign in"] },
            { t: "For employers", links: ["Set up account", "Sign in"] },
            { t: "Platform", links: ["Staff portal", "Admin dashboard", "Inspector portal"] },
          ].map(c => (
            <div key={c.t}>
              <p className="text-xs font-semibold mb-3" style={{ color: theme.muted }}>{c.t}</p>
              {c.links.map(l => <p key={l} className="text-xs mb-2" style={{ color: theme.dim }}>{l}</p>)}
            </div>
          ))}
        </div>
        <div className="mt-8 pt-5 flex items-center justify-between border-t" style={{ borderColor: theme.border }}>
          <p className="text-xs" style={{ color: theme.dim }}>&copy; {new Date().getFullYear()} StudentHub</p>
          <div className="flex gap-4">
            <Link href="/login" className="text-xs no-underline" style={{ color: theme.dim }}>Sign in</Link>
            <Link href={`/signup?role=${role}`} className="text-xs no-underline font-medium" style={{ color: theme.muted }}>Sign up</Link>
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
  const [persona, setPersona] = useState<Persona>("candidate");

  useEffect(() => { setPersona(sp.get("persona") === "company" ? "company" : "candidate"); }, [sp]);

  const handlePersonaChange = useCallback((p: Persona) => {
    const params = new URLSearchParams(sp.toString());
    if (p === "candidate") params.delete("persona"); else params.set("persona", p);
    router.replace(params.toString() ? `/?${params}` : "/", { scroll: false });
  }, [router, sp]);

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: "100svh" }}>
      <a href="#main-content" className="skipLink">Skip to content</a>
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
