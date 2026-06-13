import { requireRoleCapability } from "@/modules/auth/session";
import { listBusinessDevelopment } from "./actions";
import { CandidateBusinessDevelopmentTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidateBusinessDevelopmentPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listBusinessDevelopment({ limit: 100 });

  const rows = result.items.map((bd) => ({
    id: `bd-${bd.company_request_uuid}`,
    companyName: bd.company_name,
    companyEmail: bd.company_email,
    contactName: bd.contact_name,
    contactPosition: bd.contact_position ?? "",
    phoneNumber: bd.phone_number ?? "",
    requestingFor: bd.requesting_for ?? "",
    status: bd.status,
    countryName: bd.country_name_en ?? "",
    currencyCode: bd.currency_code ?? "",
    createdAt: bd.created_at ?? "",
  }));

  return (
    <CandidateBusinessDevelopmentTable
      session={session}
      rows={rows}
      total={result.total}
    />
  );
}
