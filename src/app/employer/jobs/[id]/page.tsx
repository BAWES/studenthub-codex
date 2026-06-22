import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getJob, getMyEmployerId } from "../actions";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { JobEditForm } from "./JobEditForm";
import Link from "next/link";

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
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex gap-4">
          <Link
            href={`/employer/jobs/${job.jobListingId}/applications`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#eb6651] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d45441]"
          >
            View Applications
          </Link>
          <Link
            href={`/employer/jobs/${job.jobListingId}/matching`}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Matching Candidates
          </Link>
        </div>
      </div>
    </WorkspaceShell>
  );
}
