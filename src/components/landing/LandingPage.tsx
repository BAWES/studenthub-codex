"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/marketing";
import LandingNav from "./LandingNav";
import "./landing.css";

const SH_BLUE = "#1f73b7";
const SH_CORAL = "#eb6651";

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
        "--sh-coral": SH_CORAL,
        "--sh-info": SH_BLUE,
        "--sh-coral-hover": "#d4533d",
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
