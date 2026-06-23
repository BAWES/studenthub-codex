"use client";

import { useActionState } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { chooseAccountAction, loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginAccountChoice } from "./types";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const accounts = state.accounts ?? [];

  return (
    <div className="grid gap-[14px]">
      <form action={action} className="grid gap-5 p-6">
        <div className="flex flex-col items-center text-center gap-1 pb-2">
          <span className="size-10 inline-flex items-center justify-center rounded-xl bg-foreground text-card font-black text-lg mb-1">
            SH
          </span>
          <strong className="text-xl leading-snug">Sign in to StudentHub</strong>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
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

        {state.error ? <p className="text-destructive font-medium text-sm m-0">{state.error}</p> : null}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          {pending ? "Checking credentials..." : "Sign in"}
        </Button>
      </form>

      {accounts.length ? <VerifiedAccountChooser accounts={accounts} /> : null}
    </div>
  );
}

function VerifiedAccountChooser({ accounts }: { accounts: LoginAccountChoice[] }) {
  return (
    <section className="grid gap-5 p-8 pt-0 border-t border-border" aria-label="Verified StudentHub accounts">
      <div className="grid gap-2">
        <span className="text-blue text-xs font-black uppercase">Verified accounts</span>
        <strong className="text-[28px] leading-[1.1]">Choose where to continue</strong>
        <p className="text-muted-foreground leading-relaxed m-0">Your password matched more than one active account. Only verified accounts are shown here.</p>
      </div>
      {accounts.map((account) => (
        <form action={chooseAccountAction} key={account.accountKey}>
          <input name="accountKey" type="hidden" value={account.accountKey} />
          <Button
            type="submit"
            variant="outline"
            className="w-full min-h-[62px] justify-start h-auto p-3 gap-3 text-left"
          >
            <span className="grid gap-1 min-w-0">
              <strong className="text-sm">{account.name}</strong>
              <small className="text-muted-foreground text-xs font-normal">{account.email}</small>
            </span>
          </Button>
        </form>
      ))}
    </section>
  );
}
