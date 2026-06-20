"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { ShieldCheck, ArrowLeft, Check, X } from "lucide-react";
import {
  validateResetTokenAction,
  resetPasswordAction,
} from "@/modules/auth/forgotPasswordActions";
import type {
  ValidateTokenState,
  ResetPasswordState,
} from "@/modules/auth/forgotPasswordActions";

// ── Requirements checker ────────────────────────────────────────────────

type Req = { key: string; label: string; test: (v: string) => boolean };

const requirements: Req[] = [
  { key: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { key: "uppercase", label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  {
    key: "special",
    label: "Number or special character",
    test: (v) => /[\d!@#$%^&*()_\-+=[\]{}|;:'",.<>?/`~]/.test(v),
  },
];

function PasswordReqs({ password }: { password: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {requirements.map((req) => {
        const met = req.test(password);
        return (
          <span
            key={req.key}
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              met
                ? "bg-[var(--sh-success-bg)] text-[var(--sh-success)]"
                : "bg-[var(--surface-soft)] text-[var(--muted)]"
            } ${password.length > 0 ? "animate-[shLoginFormIn_300ms_var(--sh-easing)_both]" : ""}`}
          >
            {met ? <Check className="size-3" /> : <X className="size-3" />}
            {req.label}
          </span>
        );
      })}
    </div>
  );
}

// ── Skeleton shimmer ────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="grid gap-4 px-7 pb-7">
      <div className="flex flex-col gap-3">
        <div className="h-4 rounded-md bg-[var(--surface-soft)] animate-pulse" />
        <div className="h-4 w-[80%] rounded-md bg-[var(--surface-soft)] animate-pulse" />
        <div className="h-4 w-[45%] rounded-md bg-[var(--surface-soft)] animate-pulse" />
      </div>
    </div>
  );
}

// ── Props ───────────────────────────────────────────────────────────────

type Props = {
  token: string;
};

// ── ResetPasswordForm ───────────────────────────────────────────────────

export function ResetPasswordForm({ token }: Props) {
  const [tokenState, setTokenState] = useState<ValidateTokenState>({});
  const [tokenLoading, setTokenLoading] = useState(true);
  const [resetState, resetAction, resetPending] = useActionState(
    resetPasswordAction,
    {}
  );

  const [password, setPassword] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  // Validate token on mount
  useEffect(() => {
    let cancelled = false;
    async function validate() {
      try {
        const result = await validateResetTokenAction(token);
        if (!cancelled) {
          setTokenState(result);
          setTokenLoading(false);
        }
      } catch {
        if (!cancelled) {
          setTokenState({ error: "Could not validate reset link." });
          setTokenLoading(false);
        }
      }
    }
    validate();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Focus password field when token becomes valid
  useEffect(() => {
    if (tokenState.valid) {
      passwordRef.current?.focus();
    }
  }, [tokenState.valid]);

  // ── Loading state ──────────────────────────────────────────────────
  if (tokenLoading) {
    return <SkeletonCard />;
  }

  // ── Invalid token ──────────────────────────────────────────────────
  if (tokenState.error && !tokenState.expired) {
    return (
      <div className="grid gap-4 px-7 pb-7">
        <div className="grid gap-4 text-center animate-[shLoginFormIn_500ms_var(--sh-easing)_both]">
          <div className="mx-auto flex items-center justify-center size-14 rounded-full bg-[color-mix(in_srgb,var(--sh-error)_15%,transparent)] text-[var(--sh-error)]">
            <X className="size-7" />
          </div>

          <div className="grid gap-1">
            <h2 className="text-xl font-bold text-[var(--ink)]">Invalid link</h2>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {tokenState.error}
            </p>
          </div>

          <a
            href="/forgot-password"
            className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-[var(--sh-radius-md)] bg-[var(--sh-coral)] text-white font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 ease-[var(--sh-easing)] hover:bg-[var(--sh-coral-hover)] hover:-translate-y-px hover:shadow-[var(--sh-coral-glow)] active:translate-y-0 no-underline"
          >
            Request a new link
          </a>
        </div>
      </div>
    );
  }

  // ── Expired token ──────────────────────────────────────────────────
  if (tokenState.expired) {
    return (
      <div className="grid gap-4 px-7 pb-7">
        <div className="grid gap-4 text-center animate-[shLoginFormIn_500ms_var(--sh-easing)_both]">
          <div className="mx-auto flex items-center justify-center size-14 rounded-full bg-[color-mix(in_srgb,var(--sh-warning)_15%,transparent)] text-[var(--sh-warning)]">
            <X className="size-7" />
          </div>

          <div className="grid gap-1">
            <h2 className="text-xl font-bold text-[var(--ink)]">Link expired</h2>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              This reset link has expired. Request a new one to continue.
            </p>
          </div>

          <a
            href="/forgot-password"
            className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-[var(--sh-radius-md)] bg-[var(--sh-coral)] text-white font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 ease-[var(--sh-easing)] hover:bg-[var(--sh-coral-hover)] hover:-translate-y-px hover:shadow-[var(--sh-coral-glow)] active:translate-y-0 no-underline"
          >
            Request a new link
          </a>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────
  if (resetState.success) {
    return (
      <div className="grid gap-4 px-7 pb-7">
        <div className="grid gap-4 text-center animate-[shLoginFormIn_500ms_var(--sh-easing)_both]">
          <div className="mx-auto flex items-center justify-center size-14 rounded-full bg-[var(--sh-success-bg)] text-[var(--sh-success)]">
            <ShieldCheck className="size-7" />
          </div>

          <div className="grid gap-1">
            <h2 className="text-xl font-bold text-[var(--ink)]">Password reset successfully</h2>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              Your password has been updated. Sign in with your new credentials.
            </p>
          </div>

          <a
            href="/login"
            className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-[var(--sh-radius-md)] bg-[var(--sh-coral)] text-white font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 ease-[var(--sh-easing)] hover:bg-[var(--sh-coral-hover)] hover:-translate-y-px hover:shadow-[var(--sh-coral-glow)] active:translate-y-0 no-underline"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  // ── Valid token — show form ────────────────────────────────────────
  return (
    <form action={resetAction}>
      <input name="token" type="hidden" value={token} />
      <div className="grid gap-4 px-7 pb-7">
        {tokenState.email ? (
          <p className="text-xs text-[var(--muted)] mb-4 animate-[shLoginFormIn_500ms_var(--sh-easing)_both]">
            Resetting password for <strong className="text-[var(--ink)]">{tokenState.email}</strong>
          </p>
        ) : null}

        <div className="grid gap-2 animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:140ms]">
          <label
            htmlFor="reset-password"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
          >
            New password
          </label>
          <input
            ref={passwordRef}
            id="reset-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            required
            minLength={8}
            className="min-h-[50px] px-3.5 rounded-[var(--sh-radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[15px] text-[var(--ink)] transition-[border-color,box-shadow,background] duration-200 ease-[var(--sh-easing)] placeholder:text-[var(--muted)] focus:border-[var(--sh-coral)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sh-coral)_15%,transparent)] focus:bg-[var(--surface)] focus:outline-none hover:border-[var(--sh-coral-hover)] hover:bg-[var(--surface-soft)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Live password requirements */}
        {password.length > 0 ? <PasswordReqs password={password} /> : null}

        <div className="grid gap-2 animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:200ms]">
          <label
            htmlFor="reset-confirm-password"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
          >
            Confirm new password
          </label>
          <input
            id="reset-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            required
            minLength={8}
            className="min-h-[50px] px-3.5 rounded-[var(--sh-radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[15px] text-[var(--ink)] transition-[border-color,box-shadow,background] duration-200 ease-[var(--sh-easing)] placeholder:text-[var(--muted)] focus:border-[var(--sh-coral)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sh-coral)_15%,transparent)] focus:bg-[var(--surface)] focus:outline-none hover:border-[var(--sh-coral-hover)] hover:bg-[var(--surface-soft)]"
          />
        </div>

        {resetState.error ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--sh-radius-sm)] bg-[var(--sh-error-bg)] border border-[color-mix(in_srgb,var(--sh-error)_20%,transparent)] text-[var(--sh-error)] text-[13px] font-semibold animate-[shLoginFormIn_300ms_var(--sh-easing)_both]">
            <span>{resetState.error}</span>
          </div>
        ) : null}

        {resetState.fieldErrors?.password ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--sh-radius-sm)] bg-[var(--sh-error-bg)] border border-[color-mix(in_srgb,var(--sh-error)_20%,transparent)] text-[var(--sh-error)] text-[13px] font-semibold animate-[shLoginFormIn_300ms_var(--sh-easing)_both]">
            <span>{resetState.fieldErrors.password[0]}</span>
          </div>
        ) : null}

        {resetState.fieldErrors?.confirmPassword ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--sh-radius-sm)] bg-[var(--sh-error-bg)] border border-[color-mix(in_srgb,var(--sh-error)_20%,transparent)] text-[var(--sh-error)] text-[13px] font-semibold animate-[shLoginFormIn_300ms_var(--sh-easing)_both]">
            <span>{resetState.fieldErrors.confirmPassword[0]}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={resetPending}
          className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 border-none rounded-[var(--sh-radius-md)] bg-[var(--sh-coral)] text-white font-inherit text-[15px] font-semibold cursor-pointer transition-[transform,box-shadow,background] duration-200 ease-[var(--sh-easing)] hover:bg-[var(--sh-coral-hover)] hover:-translate-y-px hover:shadow-[var(--sh-coral-glow)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-[0.56] animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:260ms]"
        >
          <ShieldCheck className="size-4" />
          {resetPending ? "Resetting..." : "Reset password"}
        </button>

        <a
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors no-underline animate-[shLoginFormIn_500ms_var(--sh-easing)_both] [animation-delay:320ms]"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </a>
      </div>
    </form>
  );
}
