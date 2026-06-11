"use client";

import LandingContent from "@/app/LandingContent";

interface LandingPageProps {
  session: { id: string; email: string; role: string; name: string } | null;
}

export default function LandingPage({ session }: LandingPageProps) {
  return <LandingContent session={session} />;
}
