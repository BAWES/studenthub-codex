"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/marketing";
import LandingNav from "./LandingNav";
import "./landing.css";

const SH_BLUE = "#0b63ce";
const SH_AMBER = "#f59e0b";

interface LandingPageProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

function getRedirectPath(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "staff":
    case "recruiter":
      return "/staff";
    case "student":
    case "candidate":
      return "/candidate";
    case "company":
    case "employer":
      return "/employer";
    case "inspector":
      return "/inspector";
    default:
      return "/hub";
  }
}

export default function LandingPage({ session }: LandingPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace(getRedirectPath(session.role));
    }
  }, [session, router]);

  return (
    <div
      style={{
        "--sh-blue": SH_BLUE,
        "--sh-amber": SH_AMBER,
        "--sh-info": SH_BLUE,
<<<<<<< HEAD
        "--sh-coral": SH_BLUE,
        "--sh-coral-hover": "#0a56b0",
        "--sh-coral-glow": `0 0 12px ${SH_BLUE}40`,
        "--sh-amber-glow": `0 4px 14px ${SH_AMBER}50`,
=======
        "--sh-coral-hover": "#d4533d",
>>>>>>> f4f5c4856 (fix: shadcn polish admin attendance page — replace inline styles)
        backgroundColor: "var(--paper)",
        minHeight: "100svh",
      } as React.CSSProperties}
    >
      <a href="#main-content" className="skipLink" style={{ color: "var(--ink)" }}>
        Skip to content
      </a>
      <LandingNav session={session} />

      <main
        id="main-content"
        className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-8 pt-5 pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]"
      >
        <HeroSection />
      </main>
    </div>
  );
}
