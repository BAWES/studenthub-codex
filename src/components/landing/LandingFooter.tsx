"use client";

import Link from "next/link";

interface LandingFooterProps {
  persona: "candidate" | "company";
}

export default function LandingFooter({ persona }: LandingFooterProps) {
  const role = persona === "company" ? "company" : "candidate";
  return (
    <footer className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                style={{ backgroundColor: "var(--sh-coral)" }}
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
          </div>

          {/* For students */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>
              For students
            </p>
            <div className="space-y-2">
              {["Create profile", "Sign in", "How it works", "Testimonials"].map((link) => (
                <p key={link} className="text-xs" style={{ color: "var(--muted)" }}>
                  {link}
                </p>
              ))}
            </div>
          </div>

          {/* For employers */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>
              For employers
            </p>
            <div className="space-y-2">
              {["Set up account", "Sign in", "Post openings", "Pricing"].map((link) => (
                <p key={link} className="text-xs" style={{ color: "var(--muted)" }}>
                  {link}
                </p>
              ))}
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
          style={{ borderColor: "var(--border)" }}
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
              href={`/signup?role=${role}`}
              className="text-xs no-underline font-medium transition-colors duration-150"
              style={{ color: "var(--sh-coral)" }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
