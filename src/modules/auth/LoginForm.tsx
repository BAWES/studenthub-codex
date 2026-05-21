"use client";

import { useActionState } from "react";
import { chooseAccountAction, loginAction } from "./actions";
import type { LoginAccountChoice } from "./types";

export function LoginForm({ hint }: { hint?: string }) {
  const [state, action, pending] = useActionState(loginAction, {});
  const accounts = state.accounts ?? [];

  return (
    <div className="loginStack">
      <form action={action} className="loginForm">
        <div className="loginFormHeader">
          <span>Secure sign in</span>
          <strong>Continue to StudentHub</strong>
          <p>
            Use your existing production credentials. StudentHub will detect the right account and permissions after
            your password is verified.
          </p>
          {hint ? <small>{hint}</small> : null}
        </div>

        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email ?? ""}
            placeholder="name@studenthub.app"
            required
          />
        </label>

        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" placeholder="Your password" required />
        </label>

        {state.error ? <p className="formError">{state.error}</p> : null}

        <button type="submit" disabled={pending} className="primaryButton">
          {pending ? "Checking credentials..." : "Sign in"}
        </button>
      </form>

      {accounts.length ? <VerifiedAccountChooser accounts={accounts} /> : null}
    </div>
  );
}

function VerifiedAccountChooser({ accounts }: { accounts: LoginAccountChoice[] }) {
  return (
    <section className="verifiedAccounts" aria-label="Verified StudentHub accounts">
      <div>
        <span>Verified accounts</span>
        <strong>Choose where to continue</strong>
        <p>Your password matched more than one active account. Only verified accounts are shown here.</p>
      </div>
      {accounts.map((account) => (
        <form action={chooseAccountAction} key={account.accountKey}>
          <input name="accountKey" type="hidden" value={account.accountKey} />
          <button type="submit">
            <span>{account.label}</span>
            <strong>{account.name}</strong>
            <small>{account.email}</small>
          </button>
        </form>
      ))}
    </section>
  );
}
