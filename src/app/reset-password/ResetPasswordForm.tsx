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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  const show = password.length > 0;
  return (
    <div className="space-y-1.5">
      {requirements.map((req) => {
        const met = req.test(password);
        return (
          <span
            key={req.key}
            className={`flex items-center gap-1.5 text-xs transition-all duration-160 ${
              show ? "opacity-100" : "opacity-0"
            } ${met ? "text-success" : "text-muted-foreground"}`}
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
    <div className="p-6 pt-0 space-y-3 animate-pulse">
      <div className="h-3 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-3 bg-muted rounded w-5/6" />
    </div>
  );
}

// ── Props ───────────────────────────────────────────────────────────────

type Props = {
  token: string;
};

// ── Status card helper ──────────────────────────────────────────────────

function StatusCard({
  icon,
  iconBg,
  iconColor,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 pt-0">
      <div className="flex flex-col items-center text-center gap-5 px-6 py-8">
        <div className={`flex size-14 items-center justify-center rounded-xl border ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}

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
      <StatusCard
        icon={<X className="size-7" />}
        iconBg="bg-destructive/10 border-destructive/20"
        iconColor="text-destructive"
        title="Invalid link"
      >
        <p className="text-sm text-muted-foreground">
          {tokenState.error}
        </p>
        <div className="mt-4">
          <a href="/forgot-password">
            <Button variant="default" size="sm">Request a new link</Button>
          </a>
        </div>
      </StatusCard>
    );
  }

  // ── Expired token ──────────────────────────────────────────────────
  if (tokenState.expired) {
    return (
      <StatusCard
        icon={<X className="size-7" />}
        iconBg="bg-amber-500/10 border-amber-500/20"
        iconColor="text-amber-600"
        title="Link expired"
      >
        <p className="text-sm text-muted-foreground">
          This reset link has expired. Request a new one to continue.
        </p>
        <div className="mt-4">
          <a href="/forgot-password">
            <Button variant="default" size="sm">Request a new link</Button>
          </a>
        </div>
      </StatusCard>
    );
  }

  // ── Success state ──────────────────────────────────────────────────
  if (resetState.success) {
    return (
      <StatusCard
        icon={<ShieldCheck className="size-7" />}
        iconBg="bg-success/10 border-success/20"
        iconColor="text-success"
        title="Password reset successfully"
      >
        <p className="text-sm text-muted-foreground">
          Your password has been updated. Sign in with your new credentials.
        </p>
        <div className="mt-4">
          <a href="/login">
            <Button variant="default" size="sm">Sign in</Button>
          </a>
        </div>
      </StatusCard>
    );
  }

  // ── Valid token — show form ────────────────────────────────────────
  return (
    <form action={resetAction} className="p-6 pt-2">
      <input name="token" type="hidden" value={token} />
      <div className="space-y-4">
        {tokenState.email ? (
          <p className="text-xs text-muted-foreground">
            Resetting password for{" "}
            <strong className="text-foreground">{tokenState.email}</strong>
          </p>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="reset-password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Live password requirements */}
        {password.length > 0 ? <PasswordReqs password={password} /> : null}

        <div className="space-y-2">
          <label
            htmlFor="reset-confirm-password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {resetState.error ? (
          <div className="rounded-md bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
            {resetState.error}
          </div>
        ) : null}

        {resetState.fieldErrors?.password ? (
          <div className="rounded-md bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
            {resetState.fieldErrors.password[0]}
          </div>
        ) : null}

        {resetState.fieldErrors?.confirmPassword ? (
          <div className="rounded-md bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
            {resetState.fieldErrors.confirmPassword[0]}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={resetPending}
          className="w-full gap-2"
        >
          <ShieldCheck className="size-4" />
          {resetPending ? "Resetting..." : "Reset password"}
        </Button>

        <a
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors w-full"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </a>
      </div>
    </form>
  );
}
