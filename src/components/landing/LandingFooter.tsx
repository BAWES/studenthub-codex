"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

const SH_BLUE = "#0b63ce";
const SH_AMBER = "#f59e0b";

interface LandingFooterProps {
  persona: "candidate" | "company";
}

export default function LandingFooter({ persona }: LandingFooterProps) {
  const role = persona === "company" ? "company" : "candidate";
  return (
    <footer className="border-t" style={{ borderColor: "var(--sh-glass-border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                style={{ backgroundColor: SH_BLUE }}
              >
                SH
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                StudentHub
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              Connecting students with the right employers. Kuwait&apos;s platform for student
              placement.
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] font-medium">
              <Sparkles className="size-3" style={{ color: SH_AMBER }} />
              <span style={{ color: "var(--muted)" }}>Staff-powered · Kuwait</span>
            </div>
          </div>

          {/* For students */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>
              For students
            </p>
            <div className="space-y-2">
              <Link href={{ pathname: "/signup", query: { role: "candidate" } }} className="block text-xs no-underline transition-colors hover:opacity-80" style={{ color: "var(--muted)" }}>Create profile</Link>
              <Link href="/login" className="block text-xs no-underline transition-colors hover:opacity-80" style={{ color: "var(--muted)" }}>Sign in</Link>
              <Link href="#how-it-works" className="block text-xs no-underline transition-colors hover:opacity-80" style={{ color: "var(--muted)" }}>How it works</Link>
              <Link href="#testimonials" className="block text-xs no-underline transition-colors hover:opacity-80" style={{ color: "var(--muted)" }}>Testimonials</Link>
            </div>
          </div>

          {/* For employers */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>
              For employers
            </p>
            <div className="space-y-2">
              <Link href={{ pathname: "/signup", query: { role: "company" } }} className="block text-xs no-underline transition-colors hover:opacity-80" style={{ color: "var(--muted)" }}>Set up account</Link>
              <Link href="/login" className="block text-xs no-underline transition-colors hover:opacity-80" style={{ color: "var(--muted)" }}>Sign in</Link>
              <Link href="#for-employers" className="block text-xs no-underline transition-colors hover:opacity-80" style={{ color: "var(--muted)" }}>Post openings</Link>
              <Link href="#comparison" className="block text-xs no-underline transition-colors hover:opacity-80" style={{ color: "var(--muted)" }}>Comparison</Link>
            </div>
          </div>

          {/* Internal roles */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>
              Internal roles
            </p>
            <div className="space-y-2.5">
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                <span className="font-medium" style={{ color: "var(--ink)" }}>
                  Staff:
                </span>{" "}
                Tools for agencies placing candidates faster.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                <span className="font-medium" style={{ color: "var(--ink)" }}>
                  Admin:
                </span>{" "}
                Compliance and operations management.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                <span className="font-medium" style={{ color: "var(--ink)" }}>
                  Inspector:
                </span>{" "}
                Review and certification workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 pt-5 flex items-center justify-between border-t"
          style={{ borderColor: "var(--sh-glass-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            &copy; {new Date().getFullYear()} StudentHub
          </p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-xs no-underline transition-colors duration-150 hover:opacity-80"
              style={{ color: "var(--muted)" }}
            >
              Sign in
            </Link>
            <Link
              href={{ pathname: "/signup", query: { role } }}
              className="text-xs no-underline font-medium transition-colors duration-150"
              style={{ color: SH_BLUE }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
