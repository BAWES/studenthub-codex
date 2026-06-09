"use client";

import { useActionState, useEffect, useRef } from "react";
import { LogIn } from "lucide-react";
import { chooseAccountAction, loginAction } from "./actions";
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
    <div>
      <form action={action}>
        <div className="shLoginFormCardBody">
          <div className="shLoginStagger grid gap-2">
            <label
              htmlFor="login-email"
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              Email
            </label>
            <input
              ref={emailRef}
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.email ?? ""}
              placeholder="name@studenthub.app"
              required
              className="shLoginInput"
            />
          </div>

          <div className="shLoginStagger grid gap-2">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              required
              className="shLoginInput"
            />
          </div>

          {state.error ? (
            <div className="shLoginError">
              <span>{state.error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="shLoginCTA shLoginStagger"
          >
            <LogIn className="size-4" />
            {pending ? "Checking credentials..." : "Sign in"}
          </button>
        </div>
      </form>

      {accounts.length ? <VerifiedAccountChooser accounts={accounts} /> : null}
    </div>
  );
}

function VerifiedAccountChooser({ accounts }: { accounts: LoginAccountChoice[] }) {
  return (
    <div className="shLoginAccountSection">
      <div className="shLoginStagger grid gap-1">
        <strong>Verified accounts</strong>
        <p>Your password matched more than one active account. Choose where to continue.</p>
      </div>
      {accounts.map((account) => (
        <form action={chooseAccountAction} key={account.accountKey}>
          <input name="accountKey" type="hidden" value={account.accountKey} />
          <button
            type="submit"
            className="shLoginAccountBtn shLoginStagger"
          >
            <span className="grid gap-0.5 min-w-0">
              <strong>{account.name}</strong>
              <small>{account.email}</small>
            </span>
          </button>
        </form>
      ))}
    </div>
  );
}
