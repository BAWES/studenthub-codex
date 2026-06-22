import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { getMyApplication } from "../actions";

export const dynamic = "force-dynamic";

export default async function CandidateApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;
  const appId = Number(id);

  if (Number.isNaN(appId)) {
    notFound();
  }

  const application = await getMyApplication(appId);

  if (!application) {
    notFound();
  }

  const facts = [
    { label: "Job Title", value: application.jobTitle },
    { label: "Employer", value: application.employerName },
    {
      label: "Status",
      value: (
        <StatusBadge
          variant={genericStatusVariant(application.status)}
          label={application.status}
          size="sm"
        />
      ),
    },
    { label: "Cover Letter", value: application.coverLetter ?? "—" },
    {
      label: "Applied",
      value: application.createdAt?.toLocaleDateString() ?? "—",
    },
    {
      label: "Last Updated",
      value: application.updatedAt?.toLocaleDateString() ?? "—",
    },
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidates / Applications"
      title={application.jobTitle}
      metrics={[]}
    >
      <DetailSection title="Application Details" facts={facts} />

      <section className="detailPanel">
        <div className="flex gap-2 flex-wrap">
          <Link href={"/candidate/applications" as Route}>
            <Button variant="outline">Back to Applications</Button>
          </Link>
        </div>
      </section>
    </WorkspaceShell>
  );
}
