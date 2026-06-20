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
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex gap-4">
          <Link
            href={`/employer/jobs/${job.jobListingId}/applications`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View Applications
          </Link>
          <Link
            href={`/employer/jobs/${job.jobListingId}/matching`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Matching Candidates
          </Link>
        </div>
      </div>
    </WorkspaceShell>
  );
}
