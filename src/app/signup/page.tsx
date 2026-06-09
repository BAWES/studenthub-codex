"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { Briefcase, GraduationCap, LogIn, ArrowLeft } from "lucide-react";
import { signupAction } from "@/modules/auth/signupActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SignupState } from "@/modules/auth/signupSchema";

type RoleSelection = "worker" | "employer" | null;

const roleCards = [
  {
    value: "worker" as const,
    icon: GraduationCap,
    title: "I want to work",
    subtitle: "Students & job seekers",
    description: "Build your profile, find part-time jobs, track hours, and get paid. Access invitations, shifts, documents, and payment visibility."
  },
  {
    value: "employer" as const,
    icon: Briefcase,
    title: "I want to hire staff",
    subtitle: "Employers & companies",
    description: "Post hiring requests, review candidates, manage stores, approve timesheets, and receive invoices. A clean employer workspace."
  }
];

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupAction, {});
  const role = state.role as RoleSelection ?? null;
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (role) nameRef.current?.focus();
  }, [role]);

  // Role selection cards
  if (!role) {
    return (
      <main className="min-h-svh relative overflow-hidden bg-[var(--paper)] dark:bg-[#090d14]">
        <div className="shLoginGradient" aria-hidden="true" />

        <nav className="relative z-20 mx-auto w-[min(1160px,calc(100%_-_28px))] sticky top-3 shGlassBase shGlassRadiusLg min-h-[56px] flex items-center justify-between gap-3.5 p-2">
          <Link
            className="inline-flex items-center gap-2.5 text-[var(--ink)] px-2 no-underline"
            href="/"
          >
            <span className="size-9 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--surface)] font-black text-sm">
              SH
            </span>
            <strong className="text-sm">StudentHub</strong>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="uiButton uiButton_ghost uiButton_defaultSize">
              Sign in
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto w-[min(820px,calc(100%_-_28px))] pt-[clamp(32px,6vh,80px)] pb-[42px]">
          <div className="text-center mb-10">
            <span className="shHeroEyebrow">Get started with StudentHub</span>
            <h1 className="text-[clamp(28px,4vw,52px)] font-black tracking-[-0.02em] mt-2 text-[var(--ink)]">
              Choose your path
            </h1>
            <p className="text-[var(--muted)] text-[15px] leading-relaxed max-w-[520px] mx-auto mt-2">
              Pick the role that fits you. One account gives you access to the right tools and workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roleCards.map((card) => {
              const Icon = card.icon;
              return (
                <form action={action} key={card.value}>
                  <input type="hidden" name="role" value={card.value} />
                  <input type="hidden" name="email" value="" />
                  <input type="hidden" name="password" value="" />
                  <input type="hidden" name="confirmPassword" value="" />
                  <input type="hidden" name="name" value="" />
                  <button
                    type="submit"
                    className="w-full h-full text-left shGlassElevated shGlassRadiusXl overflow-hidden cursor-pointer transition-all duration-[280ms] hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(16,24,40,0.12)] group"
                  >
                    <div className="p-8 sm:p-10 grid gap-4">
                      <span className="size-14 inline-flex items-center justify-center rounded-2xl bg-[var(--sh-info-bg)] text-[var(--sh-info)] group-hover:scale-105 transition-transform duration-200">
                        <Icon className="size-7" />
                      </span>
                      <div className="grid gap-2">
                        <strong className="text-[clamp(20px,2.5vw,28px)] text-[var(--ink)]">
                          {card.title}
                        </strong>
                        <span className="text-[var(--sh-info)] text-[13px] font-black uppercase tracking-[0.04em]">
                          {card.subtitle}
                        </span>
                        <p className="text-[var(--muted)] text-[14px] leading-relaxed m-0">
                          {card.description}
                        </p>
                      </div>
                      <span className="uiButton uiButton_default uiButton_defaultSize inline-flex items-center justify-center gap-2 w-fit">
                        Get started
                        <ArrowLeft className="size-4 rotate-180" />
                      </span>
                    </div>
                  </button>
                </form>
              );
            })}
          </div>

          <p className="text-center mt-8 text-[var(--muted)] text-[13px]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--sh-info)] font-semibold no-underline hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // Registration form
  return (
    <main className="min-h-svh relative overflow-hidden bg-[var(--paper)] dark:bg-[#090d14]">
      <div className="shLoginGradient" aria-hidden="true" />

      <nav className="relative z-20 mx-auto w-[min(1160px,calc(100%_-_28px))] sticky top-3 shGlassBase shGlassRadiusLg min-h-[56px] flex items-center justify-between gap-3.5 p-2">
        <Link
          className="inline-flex items-center gap-2.5 text-[var(--ink)] px-2 no-underline"
          href="/"
        >
          <span className="size-9 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--surface)] font-black text-sm">
            SH
          </span>
          <strong className="text-sm">StudentHub</strong>
        </Link>
        <Link href="/login" className="uiButton uiButton_ghost uiButton_defaultSize">
          Sign in
        </Link>
      </nav>

      <div className="relative z-10 mx-auto w-[min(600px,calc(100%_-_28px))] pt-[clamp(24px,5vh,64px)] pb-[42px]">
        <form action={action} className="shGlassElevated shGlassRadiusXl overflow-hidden grid gap-5 p-7 sm:p-9">
          <div className="grid gap-1.5">
            <span className="text-[var(--sh-info)] text-[11px] font-black uppercase tracking-[0.04em]">
              Create your account
            </span>
            <strong className="text-[var(--ink)] text-[24px] leading-[1.15] font-bold tracking-[-0.02em]">
              {role === "worker" ? "Start your job search" : "Start hiring with StudentHub"}
            </strong>
            <p className="text-[var(--muted)] text-[14px] leading-relaxed m-0">
              {role === "worker"
                ? "Create your profile and start finding part-time work that fits your schedule."
                : "Set up your company workspace to post jobs, review candidates, and manage hiring."}
            </p>
          </div>

          <input type="hidden" name="role" value={role} />

          <div className="grid gap-2">
            <Label htmlFor="signup-name" className="text-[13px] font-semibold text-[var(--ink)]">
              Full name
            </Label>
            <Input
              ref={nameRef}
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={""}
              placeholder={role === "worker" ? "Your full name" : "Company contact name"}
              required
              className="min-h-[48px] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] border border-[var(--sh-glass-border)] focus:border-[var(--sh-info)] focus:shadow-[var(--sh-glow-sm)] transition-all duration-200"
            />
            {state.fieldErrors?.name ? (
              <p className="text-[var(--destructive)] text-[13px] font-semibold m-0">{state.fieldErrors.name[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="signup-email" className="text-[13px] font-semibold text-[var(--ink)]">
              Email
            </Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.email ?? ""}
              placeholder="name@example.com"
              required
              className="min-h-[48px] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] border border-[var(--sh-glass-border)] focus:border-[var(--sh-info)] focus:shadow-[var(--sh-glow-sm)] transition-all duration-200"
            />
            {state.fieldErrors?.email ? (
              <p className="text-[var(--destructive)] text-[13px] font-semibold m-0">{state.fieldErrors.email[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="signup-password" className="text-[13px] font-semibold text-[var(--ink)]">
              Password
            </Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
              className="min-h-[48px] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] border border-[var(--sh-glass-border)] focus:border-[var(--sh-info)] focus:shadow-[var(--sh-glow-sm)] transition-all duration-200"
            />
            {state.fieldErrors?.password ? (
              <p className="text-[var(--destructive)] text-[13px] font-semibold m-0">{state.fieldErrors.password[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="signup-confirm" className="text-[13px] font-semibold text-[var(--ink)]">
              Confirm password
            </Label>
            <Input
              id="signup-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              required
              className="min-h-[48px] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] border border-[var(--sh-glass-border)] focus:border-[var(--sh-info)] focus:shadow-[var(--sh-glow-sm)] transition-all duration-200"
            />
            {state.fieldErrors?.confirmPassword ? (
              <p className="text-[var(--destructive)] text-[13px] font-semibold m-0">{state.fieldErrors.confirmPassword[0]}</p>
            ) : null}
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
            {pending ? "Creating your account..." : "Create account"}
          </Button>

          <p className="text-center text-[var(--muted)] text-[13px] m-0">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--sh-info)] font-semibold no-underline hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
