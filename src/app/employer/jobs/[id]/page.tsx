import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getJob, getMyEmployerId } from "../actions";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { JobEditForm } from "./JobEditForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployerJobDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireRoleCapability("company", "company.write.linked");
  const job = await getJob({ jobId: Number(id) });

  if (!job) notFound();

  const employerId = await getMyEmployerId();
  const isOwner = employerId === job.employerId;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Employer / Jobs"
      title={job.title}
      metrics={[]}
    >
      <JobEditForm job={job} readOnly={!isOwner} />
    </WorkspaceShell>
  );
}
