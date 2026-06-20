import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateCertifications } from "./actions";
import { CandidateCertificationsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidateCertificationsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const certifications = await listCandidateCertifications({});

  const rows = certifications.map((c) => ({
    id: c.certification_id,
    certification_name: c.certification_name,
    issuing_organization: c.issuing_organization,
    issue_date: c.issue_date ? formatDate(c.issue_date) : "N/A",
    expiry_date: c.expiry_date ? formatDate(c.expiry_date) : "N/A",
    credential_id: c.credential_id ?? "—",
  }));

  return <CandidateCertificationsTable session={session} rows={rows} />;
}
