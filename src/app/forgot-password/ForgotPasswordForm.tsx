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
          <div className="justify-self-center size-14 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
            <CheckCircle className="size-7" />
          </div>

          <div className="grid gap-1">
            <h2 className="text-xl font-bold text-foreground m-0">Check your email</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If an account exists for{" "}
              <span className="font-semibold text-foreground">{state.email}</span>,
              we&apos;ve sent a password reset link.
            </p>
          </div>

          <form action={action}>
            <input name="email" type="hidden" value={state.email} />
            <button
              type="submit"
              disabled={pending}
              className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-lg text-[15px] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_16px_rgba(235,102,81,0.30)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 bg-transparent border border-border text-foreground"
            >
              {pending ? "Sending..." : "Resend link"}
            </button>
          </form>

          <a
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 mt-4 text-sm text-muted-foreground transition-colors duration-150 hover:text-[#eb6651] no-underline"
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
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
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
            className="min-h-[50px] px-3.5 rounded-lg border border-border bg-card text-[15px] text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:border-[#eb6651] focus:shadow-[0_0_0_3px_rgba(235,102,81,0.15)] focus:bg-card focus:outline-none hover:border-[#d45441] hover:bg-background"
          />
        </div>

        {state.error ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-[13px] font-semibold animate-[shLoginFormIn_300ms_var(--sh-easing)_both]">
            <span>{state.error}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 border-none rounded-lg bg-[#eb6651] text-white font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#d45441] hover:-translate-y-px hover:shadow-[0_0_16px_rgba(235,102,81,0.30)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 animate-[shLoginFormIn_500ms_var(--sh-easing)_both]"
        >
          <Mail className="size-4" />
          {pending ? "Sending..." : "Send reset link"}
        </button>

        <a
          href="/login"
          className="inline-flex items-center gap-1.5 mt-4 text-sm text-muted-foreground transition-colors duration-150 hover:text-[#eb6651] no-underline animate-[shLoginFormIn_500ms_var(--sh-easing)_both]"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </a>
      </div>
    </form>
  );
}
