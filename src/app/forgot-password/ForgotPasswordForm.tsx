"use client";

import { useActionState, useEffect, useRef } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPasswordAction } from "@/modules/auth/forgotPasswordActions";
import type { ForgotPasswordState } from "@/modules/auth/forgotPasswordActions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, {});
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // ── Sent state — show success card ────────────────────────────────
  if (state.sent) {
    return (
      <div className="px-7 pb-7 grid gap-4 max-md:px-5 max-md:pb-5">
        <div className="grid gap-5 text-center px-6 py-8">
          <div className="justify-self-center size-14 rounded-[var(--radius-xl)] bg-[var(--sh-success-bg)] border border-[color-mix(in_srgb,var(--sh-success)_20%,transparent)] flex items-center justify-center text-[var(--sh-success)]">
            <CheckCircle className="size-7" />
          </div>

          <div className="grid gap-1">
            <h2 className="text-[var(--fs-h3)] font-bold text-[var(--ink)] m-0">Check your email</h2>
            <p className="text-[var(--fs-body)] text-[var(--muted)] leading-relaxed">
              If an account exists for{" "}
              <span className="font-semibold text-[var(--ink)]">{state.email}</span>,
              we&apos;ve sent a password reset link.
            </p>
          </div>

          <form action={action}>
            <input name="email" type="hidden" value={state.email} />
            <button
              type="submit"
              disabled={pending}
              className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-[var(--sh-radius-md)] text-[15px] font-semibold cursor-pointer transition-[transform,box-shadow,background] duration-200 ease-[var(--sh-easing)] hover:-translate-y-px hover:shadow-[var(--sh-coral-glow)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-[0.56]"
              style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--ink)" }}
            >
              {pending ? "Sending..." : "Resend link"}
            </button>
          </form>

          <a
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 mt-4 text-[var(--fs-sm)] text-[var(--muted)] transition-colors duration-[160ms] ease-[var(--sh-easing)] hover:text-[var(--sh-coral)] no-underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  // ── Default form state ────────────────────────────────────────────
  return (
    <form action={action}>
      <div className="px-7 pb-7 grid gap-4 max-md:px-5 max-md:pb-5">
        <div className="grid gap-2 animate-[shLoginFormIn_500ms_var(--sh-easing)_both]">
          <label
            htmlFor="forgot-email"
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted)" }}
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email ?? ""}
            placeholder="name@studenthub.app"
            required
            className="min-h-[50px] px-3.5 rounded-[var(--sh-radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[15px] text-[var(--ink)] transition-[border-color,box-shadow,background] duration-200 ease-[var(--sh-easing)] placeholder:text-[var(--muted)] focus:border-[var(--sh-coral)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sh-coral)_15%,transparent)] focus:bg-[var(--surface)] focus:outline-none hover:border-[var(--sh-coral-hover)] hover:bg-[var(--surface-soft)]"
          />
        </div>

        {state.error ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--sh-radius-sm)] bg-[var(--sh-error-bg)] border border-[color-mix(in_srgb,var(--sh-error)_20%,transparent)] text-[var(--sh-error)] text-[13px] font-semibold animate-[shLoginFormIn_300ms_var(--sh-easing)_both]">
            <span>{state.error}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 border-none rounded-[var(--sh-radius-md)] bg-[var(--sh-coral)] text-white font-inherit text-[15px] font-semibold cursor-pointer transition-[transform,box-shadow,background] duration-200 ease-[var(--sh-easing)] hover:bg-[var(--sh-coral-hover)] hover:-translate-y-px hover:shadow-[var(--sh-coral-glow)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-[0.56] animate-[shLoginFormIn_500ms_var(--sh-easing)_both]"
        >
          <Mail className="size-4" />
          {pending ? "Sending..." : "Send reset link"}
        </button>

        <a
          href="/login"
          className="inline-flex items-center gap-1.5 mt-4 text-[var(--fs-sm)] text-[var(--muted)] transition-colors duration-[160ms] ease-[var(--sh-easing)] hover:text-[var(--sh-coral)] no-underline animate-[shLoginFormIn_500ms_var(--sh-easing)_both]"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </a>
      </div>
    </form>
  );
}
