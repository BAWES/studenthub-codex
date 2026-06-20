"use client";

import { useActionState, useEffect, useRef } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const emailRef = useRef<HTMLInputElement>(null);

  // Auto-focus email field on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <form action={action}>
      <div className="px-6 pb-6 grid gap-4">
        {/* ── Email ──────────────────────────────────────────── */}
        <div className="grid gap-1.5">
          <label
            htmlFor="login-email"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email ?? ""}
            placeholder="name@studenthub.app"
            required
            className="min-h-[48px] px-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[15px] text-[var(--ink)] transition-colors duration-200 placeholder:text-[var(--muted)] focus:border-[#1f73b7] focus:shadow-[0_0_0_3px_rgba(31,115,183,0.12)] focus:bg-[var(--surface)] focus:outline-none hover:border-[var(--muted)]"
          />
        </div>

        {/* ── Password ───────────────────────────────────────── */}
        <div className="grid gap-1.5">
          <label
            htmlFor="login-password"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
          >
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
            className="min-h-[48px] px-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[15px] text-[var(--ink)] transition-colors duration-200 placeholder:text-[var(--muted)] focus:border-[#1f73b7] focus:shadow-[0_0_0_3px_rgba(31,115,183,0.12)] focus:bg-[var(--surface)] focus:outline-none hover:border-[var(--muted)]"
          />
        </div>

        {/* ── Error ──────────────────────────────────────────── */}
        {state.error ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
            {state.error}
          </div>
        ) : null}

        {/* ── Submit ─────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={pending}
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 border-none rounded-lg bg-[#1f73b7] text-white text-[15px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#1a5e99] active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
        >
          <LogIn className="size-4" />
          {pending ? "Checking credentials..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}
