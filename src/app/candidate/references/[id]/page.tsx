import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getReferenceEntry } from "./actions";
import { DeleteReferenceButton } from "./DeleteReferenceButton";

export const dynamic = "force-dynamic";

export default async function CandidateReferenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;

  const reference = await getReferenceEntry(id);
  if (!reference) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / References"
      title={reference.name}
      metrics={[
        { label: "Name", value: reference.name, note: "Reference contact" },
        { label: "Company", value: reference.company ?? "—", note: "Organization" },
      ]}
    >
      <DetailSection
        title="Reference Details"
        facts={[
          { label: "Name", value: reference.name },
          { label: "Company", value: reference.company ?? "—" },
          { label: "Position", value: reference.position ?? "—" },
          { label: "Phone", value: reference.phone ?? "—" },
          { label: "Email", value: reference.email ?? "—" },
          { label: "Relationship", value: reference.relationship ?? "—" },
          { label: "Added On", value: reference.created_at ? formatDate(reference.created_at) : "N/A" },
        ]}
      />

      <div className="flex items-center gap-3 mt-8">
        <DeleteReferenceButton referenceUuid={reference.reference_uuid} />
        <Link href="/candidate/references" className="shButtonOutline">
          Back to References
        </Link>
      </div>
    </WorkspaceShell>
  );
}
