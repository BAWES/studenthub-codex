"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/marketing";
import LandingNav from "./LandingNav";

interface LandingPageProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

export default function LandingPage({ session }: LandingPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (session) {
      const role = session.role;
      if (role === "admin") router.replace("/admin");
      else if (role === "staff" || role === "recruiter") router.replace("/staff");
      else if (role === "company" || role === "employer") router.replace("/employer");
      else if (role === "inspector") router.replace("/inspector");
      else router.replace("/candidate");
    }
  }, [session, router]);

  return (
    <div
      style={{
        backgroundColor: "var(--paper)",
        minHeight: "100svh",
      }}
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
