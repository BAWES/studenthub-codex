import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import CompanyLandingContent from "./CompanyLandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hire Smarter, Faster | StudentHub for Companies",
  description:
    "Post openings and get staff-matched candidates within 48 hours. Approve timesheets in bulk, manage multi-branch hiring, and receive consolidated invoices — all in one workspace.",
  openGraph: {
    title: "StudentHub for Companies | Streamline Your Hiring",
    description:
      "Hire qualified staff without the runaround. Staff candidate matching, compliance built-in, and automated billing for multi-location employers.",
  },
};

export default async function ForCompaniesPage() {
  const session = await getSession();

  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <CompanyLandingContent session={session} />
    </Suspense>
  );
}
