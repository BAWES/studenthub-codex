"use client";

import { useActionState, useEffect, useRef } from "react";
import { LogIn } from "lucide-react";
import { chooseAccountAction, loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginAccountChoice } from "./types";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const accounts = state.accounts ?? [];
  const emailRef = useRef<HTMLInputElement>(null);

  // Auto-focus email field on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <div className="grid gap-0">
      <form action={action} className="grid gap-5 p-7 sm:p-9">
        <div className="grid gap-1.5">
          <span className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-[0.04em]">
            Secure sign in
          </span>
          <strong className="text-[var(--ink)] text-[24px] leading-[1.15] font-bold tracking-[-0.02em]">
            Continue to StudentHub
          </strong>
          <p className="text-[var(--muted)] text-[14px] leading-relaxed m-0">
            Use your existing production credentials to access your workspace.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="login-email" className="text-[13px] font-semibold text-[var(--ink)]">
            Email
          </Label>
          <Input
            ref={emailRef}
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email ?? ""}
            placeholder="name@studenthub.app"
            required
            className="min-h-[48px] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] border border-[var(--sh-glass-border)] focus:border-[var(--sh-info)] focus:shadow-[var(--sh-glow-sm)] transition-all duration-200"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="login-password" className="text-[13px] font-semibold text-[var(--ink)]">
            Password
          </Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
            className="min-h-[48px] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] border border-[var(--sh-glass-border)] focus:border-[var(--sh-info)] focus:shadow-[var(--sh-glow-sm)] transition-all duration-200"
          />
        </div>

        {state.error ? (
          <p className="text-[var(--destructive)] font-bold m-0 text-sm">{state.error}</p>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          size="lg"
          className="min-h-[50px] w-full text-[15px] font-semibold transition-all duration-200 cursor-pointer hover:translate-y-[-1px] hover:shadow-lg"
        >
          <LogIn className="size-4" />
          {pending ? "Checking credentials..." : "Sign in"}
        </Button>
      </form>

      {accounts.length > 0 ? (
        <section
          className="grid gap-3 p-7 sm:p-9 pt-0 border-t border-[var(--sh-glass-border)]"
          aria-label="Verified StudentHub accounts"
        >
          <div className="grid gap-1.5">
            <span className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-[0.04em]">
              Verified accounts
            </span>
            <strong className="text-[var(--ink)] text-[20px] leading-[1.15] font-bold">
              Choose where to continue
            </strong>
            <p className="text-[var(--muted)] text-[14px] leading-relaxed m-0">
              Your password matched more than one active account.
            </p>
          </div>
          {accounts.map((account) => (
            <form action={chooseAccountAction} key={account.accountKey}>
              <input name="accountKey" type="hidden" value={account.accountKey} />
              <Button
                type="submit"
                variant="outline"
                className="w-full min-h-[58px] justify-start h-auto p-3 gap-3 text-left border-[var(--sh-glass-border)] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] hover:bg-[var(--sh-glass-bg-strong)] hover:border-[var(--sh-glass-border-strong)] transition-all duration-200 cursor-pointer"
              >
                <span className="grid gap-1 min-w-0">
                  <strong className="text-sm">{account.name}</strong>
                  <small className="text-[var(--muted)] text-xs font-normal">{account.email}</small>
                </span>
              </Button>
            </form>
          ))}
        </section>
      ) : null}
    </div>
  );
}
