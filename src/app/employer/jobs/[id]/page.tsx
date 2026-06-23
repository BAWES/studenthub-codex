import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getJob, getMyEmployerId } from "../actions";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { JobEditForm } from "./JobEditForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <Button asChild>
            <Link href={`/employer/jobs/${job.jobListingId}/applications`}>
              View Applications
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/employer/jobs/${job.jobListingId}/matching`}>
              Matching Candidates
            </Link>
          </Button>
        </div>
      </div>
    </WorkspaceShell>
  );
}
