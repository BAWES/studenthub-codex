import { Suspense } from "react";
import { getSession } from "@/modules/auth/session";
import CompanyLandingContent from "./CompanyLandingContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "StudentHub for Companies — Hire qualified staff without the runaround",
  description:
    "Post openings, review matched candidates, approve timesheets, and receive consolidated invoices. One workspace replaces the email-and-spreadsheet shuffle.",
  openGraph: {
    title: "StudentHub for Companies",
    description:
      "Hire qualified staff without the runaround. AI-matched candidates, consolidated invoicing, and compliance built in.",
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
