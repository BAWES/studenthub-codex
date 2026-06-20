import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import InspectorLandingContent from "./InspectorLandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Streamline Compliance Audits | StudentHub for Inspectors",
  description:
    "Batch-review 10,000+ documents monthly. Automated exception flagging, one-click reports, and full audit trails. Designed for Kuwait regulatory compliance.",
  openGraph: {
    title: "StudentHub for Inspectors | Audit Smarter",
    description:
      "Batch document review, exception flagging, and inspection-ready reports in minutes.",
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
