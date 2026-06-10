import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { prisma } from "@/lib/prisma";
import { CandidateJobDetail } from "./job-detail";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CandidateJobDetailPage({ params }: Props) {
  const { id } = await params;
  const jobListingId = Number(id);
  if (Number.isNaN(jobListingId)) notFound();

  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const [job, existingApplication] = await Promise.all([
    prisma.job_listing.findFirst({
      where: { jobListingId, status: "active" },
      include: {
        employer: {
          select: { company_name: true },
        },
      },
    }),
    prisma.job_listing_application.findFirst({
      where: { jobListingId, candidateId },
    }),
  ]);

  if (!job) notFound();

  return (
    <CandidateJobDetail
      job={{
        id: job.jobListingId,
        title: job.title,
        description: job.description,
        requirements: job.requirements ?? undefined,
        location: job.location ?? undefined,
        employmentType: job.employmentType ?? undefined,
        salaryRange: job.salaryRange ?? undefined,
        employerName: job.employer.company_name,
        createdAt: String(job.createdAt),
      }}
      hasApplied={existingApplication !== null}
    />
  );
}
