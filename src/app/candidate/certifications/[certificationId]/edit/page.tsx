import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateCertification } from "../../actions";
import { formatDate } from "@/modules/workspace/format";
import { CertificationEditForm } from "../CertificationEditForm";

export const dynamic = "force-dynamic";

export default async function CandidateCertificationEditPage({
  params,
}: {
  params: Promise<{ certificationId: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const { certificationId } = await params;

  const id = Number(certificationId);
  if (isNaN(id)) notFound();

  const certification = await getCandidateCertification(id);
  if (!certification) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Certifications / Edit"
      title={`Edit: ${certification.certification_name}`}
      metrics={[]}
    >
      <CertificationEditForm
        certificationId={certification.certification_id}
        currentName={certification.certification_name}
        currentIssuer={certification.issuing_organization}
        currentIssueDate={certification.issue_date ? formatDate(certification.issue_date) : null}
        currentExpiryDate={certification.expiry_date ? formatDate(certification.expiry_date) : null}
        currentCredentialId={certification.credential_id}
        currentCredentialUrl={certification.credential_url}
        currentDescription={certification.description}
      />
    </WorkspaceShell>
  );
}
