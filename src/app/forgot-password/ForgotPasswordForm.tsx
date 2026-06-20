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
      <div className="grid gap-4 px-7 pb-7">
        <div className="grid gap-4 text-center animate-[shLoginFormIn_500ms_var(--sh-easing)_both]">
          <div className="mx-auto flex items-center justify-center size-14 rounded-full bg-[var(--sh-success-bg)] text-[var(--sh-success)]">
            <CheckCircle className="size-7" />
          </div>

          <div className="grid gap-1">
            <h2 className="text-xl font-bold text-[var(--ink)]">Check your email</h2>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
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
              className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-[var(--sh-radius-md)] bg-transparent border border-[var(--line)] text-[var(--ink)] font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 ease-[var(--sh-easing)] hover:bg-[var(--surface-soft)] hover:border-[var(--ink)] disabled:pointer-events-none disabled:opacity-[0.56]"
            >
              {pending ? "Sending..." : "Resend link"}
            </button>
          </form>

          <a
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors no-underline"
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
      <div className="grid gap-4 px-7 pb-7">
        <div className="grid gap-2 animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:140ms]">
          <label
            htmlFor="forgot-email"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
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
          className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 border-none rounded-[var(--sh-radius-md)] bg-[var(--sh-coral)] text-white font-inherit text-[15px] font-semibold cursor-pointer transition-[transform,box-shadow,background] duration-200 ease-[var(--sh-easing)] hover:bg-[var(--sh-coral-hover)] hover:-translate-y-px hover:shadow-[var(--sh-coral-glow)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-[0.56] animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:200ms]"
        >
          <Mail className="size-4" />
          {pending ? "Sending..." : "Send reset link"}
        </button>

        <a
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors no-underline animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:260ms]"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </a>
      </div>
    </form>
  );
}
