import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { CertificationNewForm } from "./CertificationNewForm";

export const dynamic = "force-dynamic";

export default async function CandidateCertificationNewPage() {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Certifications"
      title="Add a New Certification"
      metrics={[]}
    >
      <CertificationNewForm />
    </WorkspaceShell>
  );
}
