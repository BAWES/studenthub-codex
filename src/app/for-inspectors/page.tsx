import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import InspectorLandingContent from "./InspectorLandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StudentHub for Inspectors — Streamline document reviews",
  description:
    "Batch document processing, full audit trails, and real-time queue management. 10,000+ documents reviewed monthly with 100% audit trail completeness.",
  openGraph: {
    title: "StudentHub for Inspectors",
    description:
      "Review documents faster with batch processing, structured feedback, and immutable audit trails — all from one dashboard.",
  },
};

export default async function ForInspectorsPage() {
  const session = await getSession();

  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <InspectorLandingContent session={session} />
    </Suspense>
  );
}
