import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getCandidateCertification, deleteCandidateCertification } from "../actions";
import { DeleteCertificationButton } from "./DeleteCertificationButton";

export const dynamic = "force-dynamic";

export default async function CandidateCertificationDetailPage({
  params,
}: {
  params: Promise<{ certificationId: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
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
      eyebrow="Candidate / Certifications"
      title={certification.certification_name}
      metrics={[
        { label: "Certification", value: certification.certification_name, note: "Certification name" },
        { label: "Issuer", value: certification.issuing_organization, note: "Issuing organization" },
      ]}
    >
      <DetailSection
        title="Certification Details"
        facts={[
          { label: "Certification Name", value: certification.certification_name },
          { label: "Issuing Organization", value: certification.issuing_organization },
          { label: "Issue Date", value: certification.issue_date ? formatDate(certification.issue_date) : "N/A" },
          { label: "Expiry Date", value: certification.expiry_date ? formatDate(certification.expiry_date) : "N/A" },
          { label: "Credential ID", value: certification.credential_id ?? "—" },
          {
            label: "Credential URL",
            value: certification.credential_url ? (
              <a
                href={certification.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                View Credential
              </a>
            ) : (
              "—"
            ),
          },
          { label: "Description", value: certification.description ?? "—" },
        ]}
      />

      <div className="flex items-center gap-3 mt-8">
        <Link href={`/candidate/certifications/${certificationId}/edit`} className="shButtonSecondary">
          Edit Certification
        </Link>
        <DeleteCertificationButton certificationId={certification.certification_id} />
        <Link href="/candidate/certifications" className="shButtonOutline">
          Back to Certifications
        </Link>
      </div>
    </WorkspaceShell>
  );
}
