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
        <div className="px-7 pb-7 grid gap-4">
          <div className="grid gap-2 animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:140ms]">
            <label
              htmlFor="login-email"
              className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
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
              className="min-h-[50px] px-3.5 rounded-[var(--sh-radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[15px] text-[var(--ink)] transition-[border-color,box-shadow,background] duration-200 ease-[var(--sh-easing)] placeholder:text-[var(--muted)] focus:border-[#eb6651] focus:shadow-[0_0_0_3px_color-mix(in_srgb,#eb6651_15%,transparent)] focus:bg-[var(--surface)] focus:outline-none hover:border-[#d45441] hover:bg-[var(--surface-soft)]"
            />
          </div>

          <div className="grid gap-2 animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:200ms]">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
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
              className="min-h-[50px] px-3.5 rounded-[var(--sh-radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[15px] text-[var(--ink)] transition-[border-color,box-shadow,background] duration-200 ease-[var(--sh-easing)] placeholder:text-[var(--muted)] focus:border-[#eb6651] focus:shadow-[0_0_0_3px_color-mix(in_srgb,#eb6651_15%,transparent)] focus:bg-[var(--surface)] focus:outline-none hover:border-[#d45441] hover:bg-[var(--surface-soft)]"
            />
          </div>

          {state.error ? (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--sh-radius-sm)] bg-[var(--sh-error-bg)] border border-[color-mix(in_srgb,var(--sh-error)_20%,transparent)] text-[var(--sh-error)] text-[13px] font-semibold animate-[shLoginFormIn_300ms_var(--sh-easing)_both]">
              <span>{state.error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 border-none rounded-[var(--sh-radius-md)] bg-[#eb6651] text-white font-inherit text-[15px] font-semibold cursor-pointer transition-[transform,box-shadow,background] duration-200 ease-[var(--sh-easing)] hover:bg-[#d45441] hover:-translate-y-px hover:shadow-[0_0_12px_color-mix(in_srgb,#eb6651_25%,transparent)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-[0.56] animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:260ms]"
          >
            <LogIn className="size-4" />
            {pending ? "Checking credentials..." : "Sign in"}
          </button>
        </div>
      </form>

      {accounts.length > 0 ? (
        <section
          className="grid gap-3 px-7 pb-5 pt-5 border-t border-[var(--line)]"
          aria-label="Verified StudentHub accounts"
        >
          <div className="grid gap-0.5">
            <strong className="text-[15px] leading-[1.2] font-semibold text-[var(--ink)]">
              Multiple accounts found
            </strong>
            <p className="text-[13px] leading-relaxed m-0 text-[var(--muted)]">
              Choose where to continue.
            </p>
          </div>
          {accounts.map((account) => (
            <form action={chooseAccountAction} key={account.accountKey}>
              <input name="accountKey" type="hidden" value={account.accountKey} />
              <button
                type="submit"
                className="w-full min-h-[52px] flex items-center gap-3 px-3.5 py-2.5 border border-[var(--line)] rounded-[var(--sh-radius-md)] bg-[var(--surface)] text-left text-[var(--ink)] font-inherit cursor-pointer transition-[background,border-color] duration-[180ms] ease-[var(--sh-easing)] hover:bg-[var(--surface-soft)] hover:border-[var(--ink)] animate-[shLoginFormIn_500ms_var(--sh-easing)_both]"
              >
                <span className="grid gap-0.5 min-w-0">
                  <strong className="text-sm font-semibold">{account.name}</strong>
                  <small className="block text-xs text-[var(--muted)] font-normal">
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
