"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { UserRound, Building2, ArrowLeft, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { registerAction, type RegisterState } from "@/modules/auth/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role } from "@/modules/auth/types";

const initialRegisterState: RegisterState = {};

type SignupStep = "select-role" | "fill-form";

const selfSignupRoles: Role[] = ["candidate", "company"];
const inviteOnlyRoles: Role[] = ["staff", "admin", "inspector"];

const roleOptions = [
  {
    value: "candidate" as Role,
    title: "I want to work",
    description: "Build your profile, find jobs, track hours, and get paid.",
    icon: UserRound,
    features: ["Profile & CV builder", "Job invitations & applications", "Timesheets & work logs", "Payment visibility"],
  },
  {
    value: "company" as Role,
    title: "I want to hire staff",
    description: "Request workers, review candidates, and manage your workforce.",
    icon: Building2,
    features: ["Worker requests & shortlisting", "Candidate search & review", "Store & approval workflows", "Invoice & payment history"],
  },
] as const;

const inviteOnlyMessages: Record<string, { title: string; description: string; cta: string }> = {
  staff: {
    title: "Staff access requires an invitation",
    description: "Staff accounts are created by administrators. If you've been invited, check your email for an invitation link or contact your organisation's admin.",
    cta: "Return to home",
  },
  admin: {
    title: "Admin access requires an invitation",
    description: "Admin accounts are managed by your organisation. If you've been invited to join as an admin, check your email for the invitation link.",
    cta: "Return to home",
  },
  inspector: {
    title: "Inspector access requires an invitation",
    description: "Inspector accounts are created by administrators. If you've been invited, check your email for the invitation link or contact your organisation's admin.",
    cta: "Return to home",
  },
};

export function SignupForm({ defaultRole }: { defaultRole?: Role }) {
  const [state, action, pending] = useActionState(registerAction, initialRegisterState);
  const isSelfSignup = defaultRole && selfSignupRoles.includes(defaultRole);
  const isInviteOnly = defaultRole && inviteOnlyRoles.includes(defaultRole);
  const [step, setStep] = useState<SignupStep>(
    isSelfSignup ? "fill-form" : "select-role",
  );
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    isSelfSignup ? defaultRole : null,
  );
  const nameRef = useRef<HTMLInputElement>(null);

  // Auto-focus name field when form appears
  useEffect(() => {
    if (step === "fill-form") {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [step]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep("fill-form");
  };

  const handleBack = () => {
    setStep("select-role");
    setSelectedRole(null);
  };

  // Invite-only role — show request-access message instead of form
  if (isInviteOnly && defaultRole && inviteOnlyMessages[defaultRole]) {
    const msg = inviteOnlyMessages[defaultRole];
    return (
      <div className="grid gap-7 p-7 sm:p-9 w-full max-w-[480px] mx-auto text-center">
        <div className="grid gap-2">
          <span className="text-coral text-[11px] font-black uppercase tracking-[0.04em]">
            {defaultRole} access
          </span>
          <strong className="text-foreground text-[22px] leading-[1.15] font-bold tracking-[-0.02em]">
            {msg.title}
          </strong>
          <p className="text-muted-foreground text-[14px] leading-relaxed m-0 max-w-[400px] mx-auto">
            {msg.description}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 min-h-[50px] px-6 rounded-xl text-[15px] font-semibold no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-coral text-white"
        >
          {msg.cta} <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  // Role selection step
  if (step === "select-role") {
    return (
      <div className="grid gap-7 p-7 sm:p-9 w-full max-w-[640px] mx-auto">
        <div className="grid gap-1.5 text-center">
          <span className="text-coral text-[11px] font-black uppercase tracking-[0.04em]">
            Get started
          </span>
          <strong className="text-foreground text-[24px] leading-[1.15] font-bold tracking-[-0.02em]">
            Create your StudentHub account
          </strong>
          <p className="text-muted-foreground text-[14px] leading-relaxed m-0 max-w-[440px] mx-auto">
            Choose how you&apos;ll use StudentHub. You can create one account per email.
          </p>
        </div>

        <div className="grid gap-3">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => handleRoleSelect(role.value)}
                className="group text-left w-full min-h-[120px] rounded-xl p-5 cursor-pointer transition-all duration-[280ms] hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(16,24,40,0.1)] border border-border bg-card hover:bg-card hover:border-border"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 size-12 rounded-xl flex items-center justify-center bg-card border border-border"
                  >
                    <Icon className="size-5 text-coral" />
                  </div>
                  <div className="grid gap-1.5 min-w-0 flex-1">
                    <strong className="text-foreground text-[16px] font-bold">{role.title}</strong>
                    <p className="text-muted-foreground text-[13px] leading-relaxed m-0">{role.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {role.features.map((f) => (
                        <span key={f} className="text-[12px] text-coral">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[13px] text-muted-foreground m-0">
          Already have an account?{" "}
          <a href="/login" className="text-coral font-semibold no-underline hover:underline">
            Sign in
          </a>
        </p>
      </div>
    );
  }

  // Registration form step
  return (
    <div className="grid gap-0 w-full max-w-[480px] mx-auto">
      <form action={action} className="grid gap-5 p-7 sm:p-9">
        <div className="grid gap-1.5">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-[13px] text-coral font-semibold cursor-pointer bg-transparent border-none p-0 w-fit hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="size-3.5" />
            Back to role selection
          </button>
          <span className="text-coral text-[11px] font-black uppercase tracking-[0.04em] mt-2">
            {selectedRole === "candidate" ? "Worker account" : "Employer account"}
          </span>
          <strong className="text-foreground text-[24px] leading-[1.15] font-bold tracking-[-0.02em]">
            {selectedRole === "candidate"
              ? "Start your career journey"
              : "Start hiring with StudentHub"}
          </strong>
          <p className="text-muted-foreground text-[14px] leading-relaxed m-0">
            Fill in your details to create your account. You&apos;ll be able to complete your
            {selectedRole === "candidate" ? " profile" : " company setup"} afterwards.
          </p>
        </div>

        {/* Hidden role field */}
        <input name="role" type="hidden" value={selectedRole ?? ""} />

        <div className="grid gap-2">
          <Label htmlFor="signup-name" className="text-[13px] font-semibold text-foreground">
            Full name
          </Label>
          <Input
            ref={nameRef}
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={selectedRole === "candidate" ? "Your full name" : "Contact name"}
            required
            className="min-h-[48px] bg-card border border-border focus:border-coral focus:shadow-[var(--sh-coral-glow)] transition-all duration-200"
          />
          {state.fieldErrors?.name ? (
            <p className="text-destructive font-bold m-0 text-xs">{state.fieldErrors.name[0]}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="signup-email" className="text-[13px] font-semibold text-foreground">
            Email address
          </Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            required
            className="min-h-[48px] bg-card border border-border focus:border-coral focus:shadow-[var(--sh-coral-glow)] transition-all duration-200"
          />
          {state.fieldErrors?.email ? (
            <p className="text-destructive font-bold m-0 text-xs">{state.fieldErrors.email[0]}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="signup-password" className="text-[13px] font-semibold text-foreground">
            Password
          </Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 5 characters"
            required
            minLength={5}
            className="min-h-[48px] bg-card border border-border focus:border-coral focus:shadow-[var(--sh-coral-glow)] transition-all duration-200"
          />
          {state.fieldErrors?.password ? (
            <p className="text-destructive font-bold m-0 text-xs">{state.fieldErrors.password[0]}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="signup-confirm-password" className="text-[13px] font-semibold text-foreground">
            Confirm password
          </Label>
          <Input
            id="signup-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            required
            className="min-h-[48px] bg-card border border-border focus:border-coral focus:shadow-[var(--sh-coral-glow)] transition-all duration-200"
          />
          {state.fieldErrors?.confirmPassword ? (
            <p className="text-destructive font-bold m-0 text-xs">{state.fieldErrors.confirmPassword[0]}</p>
          ) : null}
        </div>

        {state.error ? (
          <p className="text-destructive font-bold m-0 text-sm">{state.error}</p>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          size="lg"
          className="min-h-[52px] w-full text-[15px] font-semibold transition-all duration-200 cursor-pointer bg-coral text-white hover:bg-coral-hover hover:translate-y-[-1px] hover:shadow-[var(--sh-coral-glow)] disabled:opacity-56 disabled:pointer-events-none"
        >
          <UserPlus className="size-4" />
          {pending ? "Creating account..." : `Create ${selectedRole === "candidate" ? "worker" : "employer"} account`}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground m-0 pb-7 sm:pb-9">
        Already have an account?{" "}
        <a href="/login" className="text-coral font-semibold no-underline hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
