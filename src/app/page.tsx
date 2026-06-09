import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import LandingContent from "./LandingContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();

  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <LandingContent session={session} />
    </Suspense>
  );
}
