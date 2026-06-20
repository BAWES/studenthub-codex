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
        <Link href="/candidate/references" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          Back to References
        </Link>
      </div>
    </WorkspaceShell>
  );
}
