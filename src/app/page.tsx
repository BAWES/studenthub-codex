import Link from "next/link";
import type { Route } from "next";
import {
  UserRound,
  Briefcase,
  Building2,
  Shield,
  ClipboardCheck,
  Search,
  ListChecks,
  Workflow,
  DollarSign,
  Sparkles,
  ArrowRight,
  Command
} from "lucide-react";
import { getSession } from "@/modules/auth/session";
import { portalContent } from "@/modules/auth/portalContent";
import { ThemeToggle } from "@/modules/theme/ThemeToggle";

export const dynamic = "force-dynamic";

const benefits = [
  {
    title: "Purpose-built portals",
    body: "Each role gets exactly the right tools — no clutter, no missing features, no one-size-fits-all compromises.",
    icon: Sparkles
  },
  {
    title: "Smart candidate search",
    body: "Typo-tolerant, filter-rich search across countries, skills, and statuses. Saved searches for repeat workflows.",
    icon: Search
  },
  {
    title: "End-to-end workflows",
    body: "From profile readiness to timesheets and payments — every step is connected in one system.",
    icon: Workflow
  },
  {
    title: "Production-grade foundation",
    body: "Built for real data volumes, real teams, and real compliance — not a prototype.",
    icon: ListChecks
  }
];

const portalRoles = ["candidate", "staff", "company", "admin", "inspector"] as const;

const portalIcons: Record<(typeof portalRoles)[number], React.ComponentType<{ className?: string }>> = {
  candidate: UserRound,
  staff: Briefcase,
  company: Building2,
  admin: Shield,
  inspector: ClipboardCheck
};

const portalColors: Record<(typeof portalRoles)[number], string> = {
  candidate: "var(--blue)",
  staff: "var(--green)",
  company: "var(--amber)",
  admin: "var(--blue-deep)",
  inspector: "var(--rose)"
};

function Orb({ className = "", color = "var(--blue)", size = 400, style = {} }: { className?: string; color?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <div
      className={`sh-orb ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity: 0.15,
        ...style
      }}
      aria-hidden="true"
    />
  );
}

export default async function Home() {
  const session = await getSession();

  return (
    <main className="min-h-svh relative overflow-hidden"
      style={{
        background: "var(--paper)",
      }}
    >
      {/* ===== AMBIENT ORBS ===== */}
      <Orb color="var(--blue)" size={500} className="top-[-120px] left-[-100px]" />
      <Orb color="var(--green)" size={350} className="top-[40%] right-[-80px]" style={{ animationDelay: "-3s" }} />
      <Orb color="var(--blue)" size={300} className="bottom-[-60px] left-[20%]" style={{ animationDelay: "-7s" }} />

      <div className="relative z-[2] w-full max-w-[1320px] mx-auto px-5 sm:px-6 lg:px-8 pb-16">

        {/* ===== GLASS NAV ===== */}
        <nav
          className="sh-glass sh-glass-strong sticky top-4 z-30 flex items-center justify-between gap-3 px-4 py-2.5 my-4"
          aria-label="StudentHub public navigation"
          style={{ animation: "sh-fade-in-down 0.6s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <Link
            className="inline-flex items-center gap-2.5 no-underline min-h-11 px-1"
            href="/"
            style={{ color: "var(--ink)" }}
          >
            <span
              className="size-9 inline-flex items-center justify-center rounded-xl font-black text-sm tracking-tight"
              style={{
                background: "linear-gradient(135deg, var(--blue), var(--blue-deep))",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(11, 99, 206, 0.3)"
              }}
            >
              SH
            </span>
            <strong className="text-base tracking-tight">StudentHub</strong>
            <span
              className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
              style={{
                background: "color-mix(in srgb, var(--blue) 14%, transparent)",
                color: "var(--blue)"
              }}
            >
              OS
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            {/* Cmd+K hint */}
            <span
              className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
              style={{
                background: "color-mix(in srgb, var(--surface) 60%, transparent)",
                color: "var(--muted)",
                border: "1px solid color-mix(in srgb, var(--line) 50%, transparent)"
              }}
            >
              <Command className="size-3" aria-hidden="true" />
              <span>Cmd+K</span>
            </span>

            {session ? (
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 min-h-9 px-3.5 rounded-xl text-sm font-semibold no-underline transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, var(--blue), var(--blue-deep))",
                  color: "#fff",
                  boxShadow: "0 2px 12px color-mix(in srgb, var(--blue) 30%, transparent)"
                }}
              >
                Open app
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 min-h-9 px-3.5 rounded-xl text-sm font-semibold no-underline transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, var(--blue), var(--blue-deep))",
                  color: "#fff",
                  boxShadow: "0 2px 12px color-mix(in srgb, var(--blue) 30%, transparent)"
                }}
              >
                Sign in
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            )}
            <ThemeToggle />
          </div>
        </nav>

        {/* ===== HERO SECTION ===== */}
        <section
          className="relative overflow-hidden rounded-3xl min-h-[620px] sm:min-h-[700px] flex items-center px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20"
          style={{
            background: [
              "linear-gradient(135deg, var(--paper) 0%, color-mix(in srgb, var(--blue) 6%, var(--paper)) 50%, var(--paper) 100%)",
            ].join(""),
          }}
          aria-label="Hero"
        >
          {/* Animated gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                "linear-gradient(135deg,",
                "color-mix(in srgb, var(--blue) 8%, transparent) 0%,",
                "color-mix(in srgb, var(--green) 4%, transparent) 30%,",
                "color-mix(in srgb, var(--blue) 3%, transparent) 60%,",
                "transparent 100%",
                ")",
              ].join(""),
              backgroundSize: "200% 200%",
              animation: "sh-gradient-shift 12s cubic-bezier(0.45, 0, 0.55, 1) infinite",
            }}
          />

          {/* Decorative grid lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: [
                "linear-gradient(90deg, var(--ink) 1px, transparent 1px)",
                ", linear-gradient(180deg, var(--ink) 1px, transparent 1px)",
              ].join(""),
              backgroundSize: "64px 64px",
            }}
          />

          {/* Floating UI mockup panel */}
          <div
            className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-[480px]"
            aria-hidden="true"
            style={{
              animation: "sh-fade-in-up 1s 0.3s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <div className="sh-glass sh-glass-strong p-4">
              {/* Panel header */}
              <div className="flex items-center gap-2 pb-3 mb-3" style={{ borderBottom: "1px solid color-mix(in srgb, var(--line) 40%, transparent)" }}>
                <span className="size-2.5 rounded-full" style={{ background: "var(--rose)" }} />
                <span className="size-2.5 rounded-full" style={{ background: "var(--amber)" }} />
                <span className="size-2.5 rounded-full" style={{ background: "var(--green)" }} />
                <span className="ml-2 text-[11px] font-semibold" style={{ color: "var(--muted)" }}>
                  Dashboard — Staff
                </span>
              </div>

              {/* Mock search bar */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: "color-mix(in srgb, var(--surface) 50%, transparent)", border: "1px solid color-mix(in srgb, var(--line) 30%, transparent)" }}>
                <Search className="size-3.5" style={{ color: "var(--muted)" }} />
                <span className="text-xs" style={{ color: "var(--muted)" }}>Search candidates, requests, companies...</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: "color-mix(in srgb, var(--line) 30%, transparent)", color: "var(--muted)" }}>⌘K</span>
              </div>

              {/* Mock data rows */}
              <div className="grid gap-2">
                {[
                  { name: "Jaafar Ahmad", role: "Nurse — FAD", status: "Profile ready", statusColor: "var(--green)" },
                  { name: "Layla Hassan", role: "Lab Tech — MLT", status: "Docs pending", statusColor: "var(--amber)" },
                  { name: "Omar Khalid", role: "Driver — HSD", status: "In review", statusColor: "var(--blue)" },
                  { name: "Noor Saad", role: "Engineer — CET", status: "Live", statusColor: "var(--green)" },
                ].map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200"
                    style={{
                      background: i === 0 ? "color-mix(in srgb, var(--blue) 6%, transparent)" : "transparent",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <div
                      className="size-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{
                        background: `color-mix(in srgb, ${item.statusColor} 14%, transparent)`,
                        color: item.statusColor,
                      }}
                    >
                      {item.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{item.name}</div>
                      <div className="text-[11px]" style={{ color: "var(--muted)" }}>{item.role}</div>
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                      style={{
                        background: `color-mix(in srgb, ${item.statusColor} 14%, transparent)`,
                        color: item.statusColor,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Glow behind the mock panel */}
            <div
              className="absolute -top-8 -right-8 -bottom-8 -left-8 -z-10 rounded-3xl pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--blue) 6%, transparent) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Hero text */}
          <div className="relative max-w-[580px] lg:max-w-[520px]">
            <p
              className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest mb-2 px-3 py-1 rounded-full"
              style={{
                color: "var(--blue)",
                background: "color-mix(in srgb, var(--blue) 10%, transparent)",
                animation: "sh-fade-in-up 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              <Sparkles className="size-3" aria-hidden="true" />
              Next-generation StudentHub
            </p>

            <h1
              className="mt-0 mb-3 text-[clamp(40px,6vw,80px)] leading-[0.92] tracking-[-0.03em] font-black"
              style={{
                color: "var(--ink)",
                animation: "sh-fade-in-up 0.7s 0.15s cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              One modern platform,
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, var(--blue), var(--green))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                purpose-built
              </span>{" "}
              portals.
            </h1>

            <p
              className="max-w-[560px] text-base sm:text-lg leading-relaxed mb-6"
              style={{
                color: "var(--muted)",
                animation: "sh-fade-in-up 0.7s 0.25s cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              A Silicon Valley-grade rebuild for candidates, staff, companies, inspectors, and admins.
              One login opens the right workspace, while shared modules keep search, documents, payments,
              and reporting unified.
            </p>

            <div
              className="flex flex-wrap items-center gap-3 mb-4"
              style={{
                animation: "sh-fade-in-up 0.7s 0.35s cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              {session ? (
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 min-h-11 px-5 rounded-xl text-sm font-bold no-underline transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, var(--blue), var(--blue-deep))",
                    color: "#fff",
                    boxShadow: "0 4px 16px color-mix(in srgb, var(--blue) 30%, transparent)",
                  }}
                >
                  Open dashboard
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 min-h-11 px-5 rounded-xl text-sm font-bold no-underline transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, var(--blue), var(--blue-deep))",
                    color: "#fff",
                    boxShadow: "0 4px 16px color-mix(in srgb, var(--blue) 30%, transparent)",
                  }}
                >
                  Sign in
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-xl text-sm font-semibold no-underline transition-all duration-200"
                style={{
                  color: "var(--muted)",
                  border: "1px solid color-mix(in srgb, var(--line) 50%, transparent)",
                }}
              >
                View portals
              </Link>
            </div>

            <div
              className="flex flex-wrap gap-2"
              style={{
                animation: "sh-fade-in-up 0.7s 0.45s cubic-bezier(0.16,1,0.3,1) both",
              }}
              aria-label="StudentHub platform goals"
            >
              {["Role-specific workspaces", "Shared search and documents", "Production-data migration path"].map(
                (stat) => (
                  <span
                    key={stat}
                    className="inline-flex items-center gap-1 min-h-7 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{
                      color: "var(--muted)",
                      background: "color-mix(in srgb, var(--surface) 60%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--line) 30%, transparent)",
                    }}
                  >
                    {stat}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* ===== PORTAL GRID ===== */}
        <section
          className="mt-6"
          aria-label="StudentHub portals"
          style={{
            animation: "sh-fade-in-up 0.8s 0.5s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-lg font-black m-0" style={{ color: "var(--ink)" }}>
              Choose your portal
            </h2>
            <div className="flex-1 h-px" style={{ background: "color-mix(in srgb, var(--line) 30%, transparent)" }} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {portalRoles.map((role, idx) => {
              const portal = portalContent[role];
              const Icon = portalIcons[role];
              const accent = portalColors[role];
              return (
                <Link
                  href={portal.href as Route}
                  key={role}
                  className="sh-glass group no-underline flex flex-col gap-2 p-5 min-h-[160px]"
                  style={{
                    animation: `sh-fade-in-up 0.6s ${0.5 + idx * 0.08}s cubic-bezier(0.16,1,0.3,1) both`,
                  }}
                >
                  <div
                    className="size-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                      color: accent,
                    }}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>

                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: accent }}>
                      {portal.label}
                    </span>
                    <strong className="text-sm leading-tight mt-0.5" style={{ color: "var(--ink)" }}>
                      {portal.audience}
                    </strong>
                    <p className="text-xs leading-relaxed mt-1 mb-0" style={{ color: "var(--muted)" }}>
                      {portal.promise}
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-1 text-xs font-semibold transition-all duration-300"
                    style={{ color: accent, opacity: 0, transform: "translateX(-4px)", transition: "opacity 0.3s ease, transform 0.3s ease" }}
                  >
                    <span className="group-hover:opacity-100 group-hover:translate-x-0" style={{ opacity: "inherit", transform: "inherit" }}>Enter portal</span>
                    <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform duration-300" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ===== BENEFITS SECTION ===== */}
        <section
          className="mt-10 rounded-3xl overflow-hidden p-8 sm:p-10 lg:p-14"
          style={{
            background: [
              "linear-gradient(135deg,",
              "color-mix(in srgb, var(--blue) 4%, var(--paper)) 0%,",
              "var(--paper) 100%",
              ")",
            ].join(""),
            border: "1px solid color-mix(in srgb, var(--line) 20%, transparent)",
            animation: "sh-fade-in-up 0.8s 0.7s cubic-bezier(0.16,1,0.3,1) both",
          }}
          aria-label="Why StudentHub"
        >
          <div className="max-w-3xl mb-8">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest mb-2 px-3 py-1 rounded-full" style={{ color: "var(--blue)", background: "color-mix(in srgb, var(--blue) 10%, transparent)" }}>
              <Sparkles className="size-3" aria-hidden="true" />
              Why StudentHub
            </p>
            <h2 className="text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-0.02em] font-black m-0" style={{ color: "var(--ink)" }}>
              Built for how staffing{" "}
              <span style={{
                background: "linear-gradient(135deg, var(--blue), var(--green))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                actually works.
              </span>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mt-2 max-w-2xl" style={{ color: "var(--muted)" }}>
              Not a generic dashboard. Every feature is shaped by real placement workflows — search, shortlisting,
              document exchange, timesheets, and payments run in one system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="sh-glass p-6 flex gap-4 items-start"
                  style={{
                    animation: `sh-fade-in-up 0.6s ${0.8 + idx * 0.1}s cubic-bezier(0.16,1,0.3,1) both`,
                  }}
                >
                  <div
                    className="size-10 rounded-xl shrink-0 flex items-center justify-center"
                    style={{
                      background: "color-mix(in srgb, var(--blue) 10%, transparent)",
                      color: "var(--blue)",
                    }}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <strong className="text-sm block mb-1" style={{ color: "var(--ink)" }}>{b.title}</strong>
                    <p className="text-xs leading-relaxed m-0" style={{ color: "var(--muted)" }}>{b.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer
          className="mt-12 flex items-center justify-between pt-6 pb-2"
          style={{
            borderTop: "1px solid color-mix(in srgb, var(--line) 20%, transparent)",
            animation: "sh-fade-in 0.6s 1s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <span className="text-xs" style={{ color: "var(--faint)" }}>
            &copy; {new Date().getFullYear()} StudentHub OS
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: "var(--faint)" }}>
            <Command className="size-2.5" aria-hidden="true" />
            Press <kbd className="px-1 py-0.5 rounded text-[10px] font-mono" style={{ background: "color-mix(in srgb, var(--line) 30%, transparent)" }}>Cmd+K</kbd> to navigate
          </span>
        </footer>
      </div>
    </main>
  );
}
