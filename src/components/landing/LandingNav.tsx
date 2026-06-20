"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

const SH_BLUE = "#1f73b7";

interface LandingNavProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

export default function LandingNav({ session }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
      }}
      aria-label="StudentHub public navigation"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold text-white"
              style={{ backgroundColor: SH_BLUE }}
            >
              SH
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              StudentHub
            </span>
          </Link>

          <div className="flex items-center gap-2 ml-auto">
            {session ? (
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110"
                style={{ backgroundColor: SH_BLUE }}
              >
                Open app <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm no-underline transition-colors"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium no-underline text-white transition-all hover:brightness-110 hover:-translate-y-0.5"
                  style={{ backgroundColor: SH_BLUE }}
                >
                  Create free profile
                  <ArrowRight className="size-3.5" />
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-md"
              style={{ color: "var(--muted)" }}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden pb-3 space-y-1 px-6"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Link
            href="/login"
            className="block px-3 py-2 rounded-md text-sm no-underline"
            style={{ color: "var(--muted)" }}
            onClick={() => setMobileOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="block px-3 py-2 rounded-md text-sm font-medium no-underline"
            style={{ color: SH_BLUE }}
            onClick={() => setMobileOpen(false)}
          >
            Sign up
          </Link>
        </div>
      )}
    </nav>
  );
}
