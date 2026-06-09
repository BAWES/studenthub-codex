import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import AdminLandingContent from "./AdminLandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Operational Control at Scale | StudentHub for Admins",
  description:
    "Monitor hiring across departments and agencies from one dashboard. Approval workflows, audit trails, agency scorecards, and custom compliance rules.",
  openGraph: {
    title: "StudentHub for Operations | Full Visibility",
    description:
      "Cross-department hiring oversight, compliance automation, and agency performance tracking.",
  },
};

export default async function ForAdminsPage() {
  const session = await getSession();

  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <AdminLandingContent session={session} />
    </Suspense>
  );
}
