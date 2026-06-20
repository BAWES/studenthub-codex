"use client";

import { useActionState, useEffect, useRef } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPasswordAction } from "@/modules/auth/forgotPasswordActions";
import type { ForgotPasswordState } from "@/modules/auth/forgotPasswordActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            <h2 className="text-2xl font-bold text-foreground m-0">Check your email</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If an account exists for{" "}
              <span className="font-semibold text-foreground">{state.email}</span>,
              we&apos;ve sent a password reset link.
            </p>
          </div>

          <form action={action}>
            <input name="email" type="hidden" value={state.email} />
            <Button
              type="submit"
              disabled={pending}
              variant="outline"
              size="lg"
              className="w-full"
            >
              {pending ? "Sending..." : "Resend link"}
            </Button>
          </form>

          <a
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 mt-4 text-sm text-muted-foreground hover:text-[var(--sh-coral)] no-underline transition-colors"
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
        <div className="grid gap-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            ref={emailRef}
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email ?? ""}
            placeholder="name@studenthub.app"
            required
            className="min-h-[50px]"
          />
        </div>

        {state.error ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
            <span>{state.error}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          size="lg"
          className="w-full min-h-[52px]"
          style={{ backgroundColor: "var(--sh-coral)" }}
        >
          <Mail className="size-4" />
          {pending ? "Sending..." : "Send reset link"}
        </Button>

        <a
          href="/login"
          className="inline-flex items-center gap-1.5 mt-4 text-sm text-muted-foreground hover:text-[var(--sh-coral)] no-underline transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </a>
      </div>
    </form>
  );
}
