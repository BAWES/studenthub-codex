import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import AdminLandingContent from "./AdminLandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StudentHub for Admins — One workspace to run operations",
  description:
    "Consolidate user management, financial oversight, compliance monitoring, and payroll into one dashboard. 15,000+ worker records managed.",
  openGraph: {
    title: "StudentHub for Admins",
    description:
      "Replace a dozen logins with one workspace. User management, compliance, payroll, and reporting — all in one place.",
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
