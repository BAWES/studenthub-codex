"use client";

import { useActionState, useEffect, useRef } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPasswordAction } from "@/modules/auth/forgotPasswordActions";
import type { ForgotPasswordState } from "@/modules/auth/forgotPasswordActions";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, {});
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // ── Sent state — show success card ────────────────────────────────
  if (state.sent) {
    return (
      <div className="p-6 pt-0">
        <div className="flex flex-col items-center text-center gap-5 px-6 py-8">
          <div className="flex size-14 items-center justify-center rounded-xl bg-success/10 border border-success/20 text-success">
            <CheckCircle className="size-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">
              Check your email
            </h2>
            <p className="text-sm text-muted-foreground">
              If an account exists for{" "}
              <span className="font-semibold text-foreground">
                {state.email}
              </span>
              , we&apos;ve sent a password reset link.
            </p>
          </div>

          <form action={action}>
            <input name="email" type="hidden" value={state.email} />
            <Button
              type="submit"
              variant="outline"
              disabled={pending}
              size="sm"
            >
              {pending ? "Sending..." : "Resend link"}
            </Button>
          </form>

          <a
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
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
    <form action={action} className="p-6 pt-2">
      <div className="space-y-4">
        <div className="space-y-2">
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {state.error ? (
          <div className="rounded-md bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
            {state.error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          className="w-full gap-2"
        >
          <Mail className="size-4" />
          {pending ? "Sending..." : "Send reset link"}
        </Button>

        <a
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors w-full mt-4"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </a>
      </div>
    </form>
  );
}
