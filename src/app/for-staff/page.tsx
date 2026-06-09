import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import StaffLandingContent from "./StaffLandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Supercharge Your Agency | StudentHub for Staffing",
  description:
    "Cut placement admin by 70%. Automated compliance, document verification, multi-client dashboards, and integrated billing for staffing agencies.",
  openGraph: {
    title: "StudentHub for Staffing Agencies | Work Smarter",
    description:
      "Automate compliance, documents, and scheduling. Place more talent with less effort.",
  },
};

export default async function ForStaffPage() {
  const session = await getSession();

  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <StaffLandingContent session={session} />
    </Suspense>
  );
}
