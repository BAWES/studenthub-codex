"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Building2, Menu, X, ArrowRight } from "lucide-react";

export type Persona = "candidate" | "company";

interface LandingNavProps {
  session: { id: string; email: string; role: string; name: string } | null;
  persona: Persona;
  onPersonaChange: (p: Persona) => void;
}

const BLUE = "#0b63ce";

const tabs: { value: Persona; label: string; icon: typeof GraduationCap }[] = [
  { value: "candidate", label: "Students", icon: GraduationCap },
  { value: "company", label: "Companies", icon: Building2 },
];

export default function LandingNav({ session, persona, onPersonaChange }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50" aria-label="StudentHub public navigation">
      <div
        className="border-b"
        style={{
          backgroundColor: "color-mix(in srgb, var(--surface) 72%, transparent)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderColor: "color-mix(in srgb, var(--border) 50%, transparent)",
        }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                style={{ backgroundColor: BLUE }}
              >
                SH
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                StudentHub
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 ml-8">
              <Link
                href="#how-it-works"
                className="px-3 py-1.5 rounded-md text-sm no-underline transition-colors"
                style={{ color: "var(--muted)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                How it works
              </Link>
              {persona === "company" && (
                <Link
                  href="#for-employers"
                  className="px-3 py-1.5 rounded-md text-sm no-underline transition-colors"
                  style={{ color: "var(--muted)" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--ink)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
                >
                  For employers
                </Link>
              )}
              <Link
                href="#testimonials"
                className="px-3 py-1.5 rounded-md text-sm no-underline transition-colors"
                style={{ color: "var(--muted)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                Testimonials
              </Link>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {session ? (
                <Link
                  href="/app"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: BLUE }}
                >
                  Open app <ArrowRight className="size-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm no-underline"
                    style={{ color: "var(--muted)" }}
                  >
                    Sign in
                  </Link>
                  <Link
                    href={`/signup?role=${persona === "company" ? "company" : "candidate"}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110"
                    style={{ backgroundColor: BLUE }}
                  >
                    {persona === "company" ? "Set up company account" : "Create free profile"}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-1.5 rounded-md"
                style={{ color: "var(--ink)" }}
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          {/* Persona tabs */}
          <div className="flex items-center gap-0 -mb-px">
            {tabs.map((tab) => {
              const active = persona === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => onPersonaChange(tab.value)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer"
                  style={{
                    color: active ? BLUE : "var(--muted)",
                    borderBottomColor: active ? BLUE : "transparent",
                    backgroundColor: active
                      ? `color-mix(in srgb, ${BLUE} 8%, transparent)`
                      : "transparent",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                    marginBottom: "-1px",
                  }}
                >
                  <tab.icon className="size-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden pb-3 space-y-1 px-6"
            style={{ borderTop: "1px solid color-mix(in srgb, var(--border) 50%, transparent)" }}
          >
            <Link
              href="#how-it-works"
              className="block px-3 py-2 rounded-md text-sm no-underline"
              style={{ color: "var(--muted)" }}
            >
              How it works
            </Link>
            <Link
              href="#testimonials"
              className="block px-3 py-2 rounded-md text-sm no-underline"
              style={{ color: "var(--muted)" }}
            >
              Testimonials
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
