"use client";

import { useActionState, useEffect, useRef } from "react";
import { LogIn } from "lucide-react";
import { chooseAccountAction, loginAction } from "./actions";
import type { LoginAccountChoice } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const accounts = state.accounts ?? [];
  const emailRef = useRef<HTMLInputElement>(null);

  // Auto-focus email field on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <div>
      <form action={action} className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            ref={emailRef}
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email ?? ""}
            placeholder="name@studenthub.app"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
          />
        </div>

        {state.error ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md text-[13px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
            <span>{state.error}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-[#eb6651] text-white hover:bg-[#d45441]"
        >
          <LogIn className="size-4" />
          {pending ? "Checking credentials..." : "Sign in"}
        </Button>
      </form>

      {accounts.length > 0 ? (
        <section
          className="grid gap-3 pt-5 mt-5 border-t border-border"
          aria-label="Verified StudentHub accounts"
        >
          <div className="grid gap-0.5">
            <strong className="text-[15px] leading-[1.2] font-semibold text-foreground">
              Multiple accounts found
            </strong>
            <p className="text-[13px] leading-relaxed m-0 text-muted-foreground">
              Choose where to continue.
            </p>
          </div>
          {accounts.map((account) => (
            <form
              action={chooseAccountAction}
              key={account.accountKey}
              className="contents"
            >
              <input name="accountKey" type="hidden" value={account.accountKey} />
              <button
                type="submit"
                className="w-full min-h-[52px] flex items-center gap-3 px-3.5 py-2.5 rounded-md text-left text-[15px] cursor-pointer transition-all duration-[180ms] border border-border bg-card text-foreground hover:border-foreground hover:bg-muted"
              >
                <span className="grid gap-0.5 min-w-0">
                  <strong className="text-sm font-semibold">
                    {account.name}
                  </strong>
                  <small className="block text-xs font-normal text-muted-foreground">
                    {account.email}
                  </small>
                </span>
              </button>
            </form>
          ))}
        </section>
      ) : null}
    </div>
  );
}
