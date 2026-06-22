"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
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
      <div className="grid gap-5 text-center px-6 py-8">
        <div className="justify-self-center size-14 rounded-xl bg-[#24835b]/10 border border-[#24835b]/20 flex items-center justify-center text-[#24835b]">
          <CheckCircle className="size-7" />
        </div>

        <div className="grid gap-1">
          <h2 className="text-lg font-bold text-foreground m-0">Check your email</h2>
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
            className="w-full"
          >
            {pending ? "Sending..." : "Resend link"}
          </Button>
        </form>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-[#eb6651] no-underline transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </div>
    );
  }

  // ── Default form state ────────────────────────────────────────────
  return (
    <form action={action} className="grid gap-4 animate-[shLoginFormIn_500ms_var(--sh-easing)_both]">
      <div className="grid gap-2">
        <Label htmlFor="forgot-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Email
        </Label>
        <Input
          ref={emailRef}
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email ?? ""}
          placeholder="name@studenthub.app"
          required
          className="h-[50px]"
        />
      </div>

      {state.error ? (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
          <span>{state.error}</span>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="w-full h-[52px] bg-[#eb6651] hover:bg-[#d45441] text-white"
      >
        <Mail className="size-4" />
        {pending ? "Sending..." : "Send reset link"}
      </Button>

      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-[#eb6651] no-underline transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </Link>
    </form>
  );
}
