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
    <div className="shLoginReqs">
      {requirements.map((req) => {
        const met = req.test(password);
        return (
          <span
            key={req.key}
            className={`shLoginReq${met ? " met" : ""} ${
              password.length > 0 ? "shLoginStagger" : ""
            }`}
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
    <div className="shLoginFormCardBody">
      <div className="shLoginSkeleton">
        <div className="shLoginSkeletonLine" />
        <div className="shLoginSkeletonLine" style={{ width: "80%" }} />
        <div className="shLoginSkeletonLine" style={{ width: "45%" }} />
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
      <div className="shLoginFormCardBody">
        <div className="shLoginSuccessCard shLoginStagger">
          <div
            className="shLoginSuccessIcon"
            style={{ color: "var(--sh-error)" }}
          >
            <X className="size-7" />
          </div>

          <div className="grid gap-1">
            <h2 className="shLoginSuccessTitle">Invalid link</h2>
            <p className="shLoginSuccessBody">
              {tokenState.error}
            </p>
          </div>

          <a href="/forgot-password" className="shLoginCTA" style={{ textDecoration: "none" }}>
            Request a new link
          </a>
        </div>
      </div>
    );
  }

  // ── Expired token ──────────────────────────────────────────────────
  if (tokenState.expired) {
    return (
      <div className="shLoginFormCardBody">
        <div className="shLoginSuccessCard shLoginStagger">
          <div
            className="shLoginSuccessIcon"
            style={{ color: "var(--sh-warning)" }}
          >
            <X className="size-7" />
          </div>

          <div className="grid gap-1">
            <h2 className="shLoginSuccessTitle">Link expired</h2>
            <p className="shLoginSuccessBody">
              This reset link has expired. Request a new one to continue.
            </p>
          </div>

          <a href="/forgot-password" className="shLoginCTA" style={{ textDecoration: "none" }}>
            Request a new link
          </a>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────
  if (resetState.success) {
    return (
      <div className="shLoginFormCardBody">
        <div className="shLoginSuccessCard shLoginStagger">
          <div className="shLoginSuccessIcon">
            <ShieldCheck className="size-7" />
          </div>

          <div className="grid gap-1">
            <h2 className="shLoginSuccessTitle">Password reset successfully</h2>
            <p className="shLoginSuccessBody">
              Your password has been updated. Sign in with your new credentials.
            </p>
          </div>

          <a href="/login" className="shLoginCTA" style={{ textDecoration: "none" }}>
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
      <div className="shLoginFormCardBody">
        {tokenState.email ? (
          <p
            className="shLoginStagger text-xs mb-4"
            style={{ color: "var(--muted)" }}
          >
            Resetting password for <strong style={{ color: "var(--ink)" }}>{tokenState.email}</strong>
          </p>
        ) : null}

        <div className="shLoginStagger grid gap-2">
          <label
            htmlFor="reset-password"
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted)" }}
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
            className="shLoginInput"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Live password requirements */}
        {password.length > 0 ? <PasswordReqs password={password} /> : null}

        <div className="shLoginStagger grid gap-2">
          <label
            htmlFor="reset-confirm-password"
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted)" }}
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
            className="shLoginInput"
          />
        </div>

        {resetState.error ? (
          <div className="shLoginError shLoginStagger">
            <span>{resetState.error}</span>
          </div>
        ) : null}

        {resetState.fieldErrors?.password ? (
          <div className="shLoginError shLoginStagger">
            <span>{resetState.fieldErrors.password[0]}</span>
          </div>
        ) : null}

        {resetState.fieldErrors?.confirmPassword ? (
          <div className="shLoginError shLoginStagger">
            <span>{resetState.fieldErrors.confirmPassword[0]}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={resetPending}
          className="shLoginCTA shLoginStagger"
        >
          <ShieldCheck className="size-4" />
          {resetPending ? "Resetting..." : "Reset password"}
        </button>

        <a href="/login" className="shLoginBackLink shLoginStagger">
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </a>
      </div>
    </form>
  );
}
