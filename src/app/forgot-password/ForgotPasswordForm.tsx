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
      <div className="shLoginFormCardBody">
        <div className="shLoginSuccessCard shLoginStagger">
          <div className="shLoginSuccessIcon">
            <CheckCircle className="size-7" />
          </div>

          <div className="grid gap-1">
            <h2 className="shLoginSuccessTitle">Check your email</h2>
            <p className="shLoginSuccessBody">
              If an account exists for{" "}
              <span className="shLoginSuccessEmail">{state.email}</span>,
              we&apos;ve sent a password reset link.
            </p>
          </div>

          <form action={action}>
            <input name="email" type="hidden" value={state.email} />
            <button
              type="submit"
              disabled={pending}
              className="shLoginCTA"
              style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--ink)" }}
            >
              {pending ? "Sending..." : "Resend link"}
            </button>
          </form>

          <a href="/login" className="shLoginBackLink" style={{ justifyContent: "center" }}>
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
      <div className="shLoginFormCardBody">
        <div className="shLoginStagger grid gap-2">
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
            className="shLoginInput"
          />
        </div>

        {state.error ? (
          <div className="shLoginError shLoginStagger">
            <span>{state.error}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="shLoginCTA shLoginStagger"
        >
          <Mail className="size-4" />
          {pending ? "Sending..." : "Send reset link"}
        </button>

        <a href="/login" className="shLoginBackLink shLoginStagger">
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </a>
      </div>
    </form>
  );
}