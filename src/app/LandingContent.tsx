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

// ── Types ─────────────────────────────────────────────────────

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

function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Theme colors ──────────────────────────────────────────────

const theme = {
  bg: "#0a0a0b",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  borderLight: "rgba(255,255,255,0.06)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.3)",
  accent: "#6366f1",
  accentLight: "rgba(99,102,241,0.12)",
  green: "#22c55e",
  greenLight: "rgba(34,197,94,0.12)",
  amber: "#f59e0b",
  pink: "#ec4899",
  cyan: "#06b6d4",
  purple: "#a855f7",
};

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════

function Nav({ session, persona }: { session: any; persona: Persona }) {
  const [open, setOpen] = useState(false);
  const role = persona === "company" ? "company" : "candidate";
  const linkStyle: React.CSSProperties = {
    padding: "8px 14px", borderRadius: 8, fontSize: 13, textDecoration: "none",
    color: theme.muted, cursor: "pointer",
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      borderBottom: `1px solid ${theme.borderLight}`,
      background: "rgba(10,10,11,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8, fontWeight: 900, fontSize: 13,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white",
            }}>SH</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>StudentHub</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {["How it works", "Features", "Testimonials"].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} style={linkStyle}>{item}</Link>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            {session ? (
              <Link href="/app" style={btnPrimary}>Open app <ArrowRight style={{ width: 14, height: 14, marginLeft: 4 }} /></Link>
            ) : (
              <>
                <Link href="/login" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, textDecoration: "none", color: theme.muted }}>Sign in</Link>
                <Link href={`/signup?role=${role}`} style={btnPrimary}>
                  {persona === "company" ? "Set up company" : "Get started"}
                  <ArrowRight style={{ width: 14, height: 14, marginLeft: 4 }} />
                </Link>
              </>
            )}
            <button onClick={() => setOpen(!open)} style={{ display: "none", padding: 8, background: "none", border: "none", color: theme.text, cursor: "pointer" }} className="mobile-menu-toggle">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open && (
          <div style={{ paddingBottom: 16 }}>
            {["How it works", "Features", "Testimonials"].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} style={{ display: "block", padding: "10px 14px", borderRadius: 8, fontSize: 14, textDecoration: "none", color: theme.muted }}>{item}</Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
  textDecoration: "none",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white", border: "none", cursor: "pointer",
};

// ═══════════════════════════════════════════════════════════════
// PERSONA TOGGLE
// ═══════════════════════════════════════════════════════════════

function PersonaToggle({ persona, onChange }: { persona: Persona; onChange: (p: Persona) => void }) {
  return (
    <div style={{
      display: "flex", gap: 4, padding: 4, borderRadius: 12, width: "fit-content", margin: "0 auto",
      background: theme.surfaceHover, border: `1px solid ${theme.borderLight}`,
    }}>
      {[
        { value: "candidate" as Persona, label: "I'm a student", icon: GraduationCap },
        { value: "company" as Persona, label: "I'm an employer", icon: Building2 },
      ].map(opt => {
        const active = persona === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: "none", cursor: "pointer", transition: "all 0.2s",
              background: active ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
              color: active ? "white" : theme.muted,
              boxShadow: active ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
            }}>
            <opt.icon style={{ width: 16, height: 16 }} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION
// ═══════════════════════════════════════════════════════════════

function Section({ children, id, style = {} }: { children: React.ReactNode; id?: string; style?: React.CSSProperties }) {
  return (
    <section id={id} style={{
      position: "relative", padding: "80px 24px", maxWidth: 1200, margin: "0 auto", ...style,
    }}>
      {children}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════

function Hero({ persona }: { persona: Persona }) {
  return (
    <Section style={{ paddingTop: 40, paddingBottom: 0 }}>
      <div style={{ position: "relative" }}>
        {/* Backdrop glow */}
        <div style={{
          position: "absolute", top: "-160px", right: "-160px",
          width: 600, height: 600, borderRadius: "50%", opacity: 0.12,
          background: "radial-gradient(circle, rgba(99,102,241,0.25), transparent)",
          filter: "blur(120px)", pointerEvents: "none", zIndex: 0,
        }} aria-hidden="true" />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Reveal>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 999,
              background: theme.accentLight,
              border: `1px solid rgba(99,102,241,0.2)`,
              color: theme.accent, fontSize: 12, fontWeight: 600, marginBottom: 24,
            }}>
              <Sparkles style={{ width: 12, height: 12 }} />
              Two-sided marketplace for student talent
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 style={{
              fontSize: "clamp(36px, 6.5vw, 68px)", fontWeight: 900,
              lineHeight: 1.05, letterSpacing: "-0.03em",
              maxWidth: 800, margin: 0, marginBottom: 16,
            }}>
              <span style={{ color: theme.text }}>Connecting students with </span>
              <span style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>the right employers</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 560, color: theme.muted, marginBottom: 32 }}>
              {persona === "company"
                ? "Post openings, get AI-matched candidates, manage timesheets and payments — all in one platform built for Kuwait."
                : "Create a profile seen by 500+ employers. Get AI-matched roles, one-tap timesheets, and direct payments."}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <Link href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
                style={{
                  ...btnPrimary, padding: "14px 28px", fontSize: 15, borderRadius: 12,
                  boxShadow: "0 4px 24px rgba(99,102,241,0.3)",
                }}>
                {persona === "company" ? "Set up company account" : "Create your free profile"}
                <ArrowRight style={{ width: 16, height: 16, marginLeft: 4 }} />
              </Link>
              <Link href={persona === "company" ? "/signup?role=candidate" : "/signup?role=company"}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 500,
                  textDecoration: "none", color: theme.muted,
                  border: `1px solid ${theme.border}`,
                }}>
                {persona === "company" ? "I'm a student looking for work" : "I'm an employer hiring talent"}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
              <div style={{ display: "flex" }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: `2px solid ${theme.bg}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "white", marginLeft: i > 0 ? -8 : 0,
                    background: `linear-gradient(135deg, hsl(${200 + i * 40}, 70%, 50%), hsl(${200 + i * 40}, 70%, 40%))`,
                  }}>{["A", "M", "K", "S"][i - 1]}</div>
                ))}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: `2px solid ${theme.bg}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, marginLeft: -8,
                  background: theme.surfaceHover, color: theme.dim,
                }}>+</div>
              </div>
              <p style={{ fontSize: 13, color: theme.muted, margin: 0 }}>
                <span style={{ color: theme.text, fontWeight: 600 }}>10,000+</span> students connected with{" "}
                <span style={{ color: theme.text, fontWeight: 600 }}>500+</span> employers
              </p>
            </div>
          </Reveal>

          {/* App mockup */}
          <Reveal delay={400}>
            <div style={{
              borderRadius: 16, overflow: "hidden",
              border: `1px solid ${theme.border}`,
              background: "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)",
              boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 20px",
                borderBottom: `1px solid ${theme.borderLight}`,
                background: "rgba(0,0,0,0.3)",
              }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(239,68,68,0.5)" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(245,158,11,0.5)" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(34,197,94,0.5)" }} />
                </div>
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "6px 14px", borderRadius: 6, fontSize: 12,
                  background: "rgba(255,255,255,0.04)", color: theme.dim,
                }}>
                  <Search style={{ width: 12, height: 12 }} />
                  studenthub.co
                </div>
              </div>

              <div style={{ padding: "24px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }} className="mockup-grid">
                  <div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 16px", borderRadius: 12, marginBottom: 20,
                      background: theme.surface, border: `1px solid ${theme.borderLight}`,
                    }}>
                      <Search style={{ width: 16, height: 16, color: theme.dim, flexShrink: 0 }} />
                      <span style={{ color: theme.dim, fontSize: 13 }}>Search open roles, companies, locations...</span>
                      <span style={{
                        marginLeft: "auto", fontSize: 10, padding: "4px 8px", borderRadius: 4,
                        background: "rgba(255,255,255,0.06)", color: theme.dim, fontFamily: "monospace",
                      }}>⌘K</span>
                    </div>

                    <div style={{
                      borderRadius: 12, padding: 20, marginBottom: 16,
                      background: theme.surface, border: `1px solid ${theme.borderLight}`,
                    }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, color: theme.accent }}>✨ Matched for you</p>
                      <p style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 900, color: theme.text, margin: 0, marginBottom: 4, lineHeight: 1 }}>senior care assistant</p>
                      <p style={{ fontSize: 13, color: theme.muted, margin: 0 }}>12 matching roles · Kuwait City · KWD 3-5/hr · Starts ASAP</p>
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 600,
                          background: theme.greenLight, color: theme.green,
                          border: "1px solid rgba(34,197,94,0.2)",
                        }}><Check style={{ width: 12, height: 12 }} /> Profile ready</span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 600,
                          background: theme.accentLight, color: theme.accent,
                          border: "1px solid rgba(99,102,241,0.2)",
                        }}><Star style={{ width: 12, height: 12 }} /> 3 saved roles</span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                      {[
                        { label: "Profile", value: "92% complete", color: theme.accent },
                        { label: "Applications", value: "4 pending", color: theme.green },
                        { label: "Timesheet", value: "This week", color: theme.amber },
                        { label: "Payment", value: "KWD 420", color: theme.pink },
                      ].map(item => (
                        <div key={item.label} style={{
                          borderRadius: 12, padding: 16,
                          background: theme.surface, border: `1px solid ${theme.borderLight}`,
                        }}>
                          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, marginBottom: 4, color: item.color }}>{item.label}</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: theme.text, margin: 0 }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { icon: Users, label: "Applications", value: "12 new", color: theme.accent },
                      { icon: Briefcase, label: "Saved jobs", value: "8 matches", color: theme.green },
                      { icon: BarChart3, label: "Profile views", value: "47 this week", color: theme.amber },
                      { icon: Fingerprint, label: "Verification", value: "ID pending", color: theme.pink },
                    ].map(item => (
                      <div key={item.label} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: 12, borderRadius: 12,
                        background: theme.surface, border: `1px solid ${theme.borderLight}`,
                      }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: `${item.color}15` }}>
                          <item.icon style={{ width: 16, height: 16, color: item.color }} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 500, color: theme.text, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</p>
                          <p style={{ fontSize: 11, color: theme.muted, margin: 0 }}>{item.value}</p>
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
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1,
        borderRadius: 16, overflow: "hidden",
        border: `1px solid ${theme.borderLight}`,
        background: theme.borderLight,
      }}>
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 60} style={{ background: theme.bg }}>
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <s.icon style={{ width: 20, height: 20, margin: "0 auto 8px", color: theme.accent }} />
              <p style={{ fontSize: "clamp(18px, 1.8vw, 24px)", fontWeight: 900, color: theme.text, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: theme.muted, margin: "4px 0 0" }}>{s.label}</p>
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
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: theme.accent, marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: theme.text, margin: 0 }}>
            {persona === "company" ? "Hire in three simple steps" : "Get started in three simple steps"}
          </h2>
        </div>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={i * 120}>
            <div style={{
              padding: "32px 28px", borderRadius: 16, height: "100%",
              background: theme.surface, border: `1px solid ${theme.borderLight}`,
            }}>
              <p style={{
                fontSize: 40, fontWeight: 900, marginBottom: 16,
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), transparent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>{s.step}</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: theme.muted, margin: 0 }}>{s.desc}</p>
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
    { icon: Zap, title: "AI-powered matching", desc: "Our algorithm matches candidates to roles based on skills, experience, and preferences — not keywords.", color: theme.accent },
    { icon: Search, title: "Advanced search & filters", desc: "Find exactly what you need with faceted search across skills, location, pay rate, and more.", color: theme.green },
    { icon: Clock, title: "Integrated timesheets", desc: "Log hours, approve timesheets, and track attendance — all within the platform, no spreadsheets.", color: theme.amber },
    { icon: Shield, title: "Compliance & verification", desc: "ID verification, document management, and compliance tracking built into every workflow.", color: theme.pink },
    { icon: BarChart3, title: "Real-time analytics", desc: "Dashboard with live metrics on placements, payments, and pipeline activity for every role.", color: theme.cyan },
    { icon: Fingerprint, title: "Role-based access", desc: "Staff, admin, inspector, candidate, and employer portals — each with the right tools and permissions.", color: theme.purple },
  ];
  return (
    <Section id="features">
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: theme.accent, marginBottom: 12 }}>Platform features</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: theme.text, margin: "0 auto", maxWidth: 520 }}>Everything you need to manage student placements</h2>
        </div>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {items.map((f, i) => (
          <Reveal key={f.title} delay={i * 60}>
            <div style={{ padding: "28px 24px", borderRadius: 16, height: "100%", background: theme.surface, border: `1px solid ${theme.borderLight}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, background: `${f.color}15` }}>
                <f.icon style={{ width: 20, height: 20, color: f.color }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: theme.muted, margin: 0 }}>{f.desc}</p>
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
        { quote: "We've been using StudentHub for 6 months and it's transformed our hiring process. The AI matching saves us hours every week.", author: "Noura Al-Sabah", role: "HR Director, Alshaya Group" },
        { quote: "The timesheet and payment features alone are worth it. No more chasing spreadsheets. Everything is in one dashboard.", author: "Faisal Al-Ali", role: "Operations Manager, KIPCO" },
      ]
    : [
        { quote: "I found my first job within a week of creating my profile. The AI matched me with a role I wouldn't have found on my own.", author: "Amal Al-Mutairi", role: "Student, Kuwait University" },
        { quote: "The platform made it so easy to track my applications and timesheets. Getting paid directly through the app is a game changer.", author: "Khalid Al-Rashid", role: "Student, GUST" },
      ];

  return (
    <Section id="testimonials">
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: theme.accent, marginBottom: 12 }}>Testimonials</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: theme.text, margin: 0 }}>Trusted by students and employers</h2>
        </div>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
        {ts.map((t, i) => (
          <Reveal key={i} delay={i * 120}>
            <div style={{ padding: "28px 32px", borderRadius: 16, background: theme.surface, border: `1px solid ${theme.borderLight}` }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, j) => <Star key={j} style={{ width: 16, height: 16, color: theme.amber, fill: theme.amber }} />)}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20, color: "rgba(255,255,255,0.8)" }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {t.author.split(" ").map(s => s[0]).join("")}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>{t.author}</p>
                  <p style={{ fontSize: 12, color: theme.muted, margin: 0 }}>{t.role}</p>
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
  const Cell = (ok: boolean) => (
    <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {ok ? (
        <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: theme.greenLight }}>
          <Check style={{ width: 14, height: 14, color: theme.green }} />
        </div>
      ) : (
        <span style={{ color: theme.dim, fontSize: 12 }}>—</span>
      )}
    </div>
  );

  return (
    <Section>
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: theme.accent, marginBottom: 12 }}>Comparison</p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: theme.text, margin: "0 auto", maxWidth: 480 }}>Why StudentHub is different</h2>
        </div>
      </Reveal>
      <Reveal>
        <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${theme.borderLight}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", borderBottom: `1px solid ${theme.borderLight}`, background: theme.surfaceHover }}>
            <div style={{ padding: "16px 20px" }} />
            <div style={{ padding: "16px 20px", textAlign: "center" }}><span style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>StudentHub</span></div>
            <div style={{ padding: "16px 20px", textAlign: "center" }}><span style={{ fontSize: 13, color: theme.muted }}>Others</span></div>
          </div>
          {rows.map((r, i) => (
            <div key={r.f} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", borderBottom: `1px solid ${theme.borderLight}`, background: i % 2 === 0 ? "transparent" : theme.surface }}>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center" }}><span style={{ fontSize: 13, color: theme.muted }}>{r.f}</span></div>
              {Cell(r.sh)}
              {Cell(r.ot)}
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
        <div style={{
          position: "relative", overflow: "hidden", borderRadius: 16,
          padding: "64px 48px", textAlign: "center",
          background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))",
          border: "1px solid rgba(99,102,241,0.15)",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400, height: 400, borderRadius: "50%", opacity: 0.2,
            background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent)",
            filter: "blur(120px)", pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: theme.accent, marginBottom: 12 }}>
              {persona === "company" ? "Start hiring today" : "Start your journey"}
            </p>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: theme.text, margin: "0 auto", maxWidth: 450 }}>
              {persona === "company" ? "Your next hire is one post away." : "Your next role is one profile away."}
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: theme.muted, margin: "12px auto 28px", maxWidth: 440 }}>
              {persona === "company" ? "Set up your company account in under 5 minutes and get matched with vetted candidates." : "Create your free profile in under 3 minutes. No CV required."}
            </p>
            <Link href={persona === "company" ? "/signup?role=company" : "/signup?role=candidate"}
              style={{
                ...btnPrimary, padding: "14px 28px", fontSize: 15, borderRadius: 12,
                boxShadow: "0 4px 24px rgba(99,102,241,0.3)",
              }}>
              {persona === "company" ? "Set up company account" : "Create your free profile"}
              <ArrowRight style={{ width: 16, height: 16, marginLeft: 4 }} />
            </Link>
            <p style={{ fontSize: 11, color: theme.dim, marginTop: 12 }}>
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
    <footer style={{ borderTop: `1px solid ${theme.borderLight}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontWeight: 900, fontSize: 11, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>SH</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>StudentHub</span>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: theme.muted, margin: 0 }}>Connecting students with the right employers. Two-sided marketplace for Kuwait.</p>
          </div>
          {[
            { t: "For students", l: ["Create free profile", "Sign in"] },
            { t: "For employers", l: ["Set up company account", "Sign in"] },
            { t: "Platform", l: ["Staff tools", "Admin dashboard", "Inspector portal"] },
          ].map(c => (
            <div key={c.t}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>{c.t}</p>
              {c.l.map(l => <p key={l} style={{ fontSize: 12, color: theme.muted, margin: "0 0 8px" }}>{l}</p>)}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${theme.borderLight}` }}>
          <p style={{ fontSize: 11, color: theme.dim, margin: 0 }}>&copy; {new Date().getFullYear()} StudentHub. All rights reserved.</p>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/login" style={{ fontSize: 11, color: theme.dim, textDecoration: "none" }}>Sign in</Link>
            <Link href={`/signup?role=${role}`} style={{ fontSize: 11, color: theme.muted, textDecoration: "none", fontWeight: 500 }}>Sign up</Link>
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
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }, [router, sp]);

  return (
    <div style={{ background: theme.bg, minHeight: "100svh" }}>
      <a href="#main-content" className="skipLink" style={{ color: theme.text }}>Skip to content</a>
      <Nav session={session} persona={persona} />
      <main id="main-content">
        <div style={{ paddingTop: 24, paddingBottom: 8, display: "flex", justifyContent: "center" }}>
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
