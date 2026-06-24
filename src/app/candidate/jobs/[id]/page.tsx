import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateJob } from "../actions";
import { ApplyButton } from "./ApplyButton";
import { MatchScoreBadge } from "@/components/matching";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

/** Format score breakdown for display — show sub-scores inline. */
function breakdownLabel(key: string, score: number | null): string {
  if (score === null) return `${key}: —`;
  return `${key}: ${score}%`;
}

export default async function CandidateJobDetailPage({ params }: Props) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;

  let result;
  try {
    result = await getCandidateJob({ jobId: Number(id) });
  } catch {
    notFound();
  }

  const { job } = result;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/candidate/jobs">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Jobs
        </Link>
      </Button>

      <Card className="w-full">
        <CardContent className="space-y-6 p-6">
          {/* Header with match score */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{job.employerName}</p>
            </div>

            {/* Match score badge */}
            {job.matchScore !== null && (
              <div className="shrink-0">
                <MatchScoreBadge score={job.matchScore} label="Match" />
              </div>
            )}
          </div>

          {/* Score breakdown */}
          {job.matchScore !== null && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-coral/30 bg-[#fef1ef] text-coral">
                {breakdownLabel("Skills", job.skillScore)}
              </Badge>
              <Badge variant="outline" className="border-coral/30 bg-[#fef1ef] text-coral">
                {breakdownLabel("Education", job.educationScore)}
              </Badge>
              <Badge variant="outline" className="border-coral/30 bg-[#fef1ef] text-coral">
                {breakdownLabel("Location", job.locationScore)}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {job.employmentType && (
              <div>
                <span className="text-muted-foreground">Type</span>
                <p className="font-medium">{job.employmentType}</p>
              </div>
            )}
            {job.location && (
              <div>
                <span className="text-muted-foreground">Location</span>
                <p className="font-medium">{job.location}</p>
              </div>
            )}
            {job.salaryRange && (
              <div>
                <span className="text-muted-foreground">Salary Range</span>
                <p className="font-medium">{job.salaryRange}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Posted</span>
              <p className="font-medium">{job.createdAt.toISOString().slice(0, 10)}</p>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
          </div>

          {job.requirements && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Requirements</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{job.requirements}</p>
            </div>
          )}

          <div className="border-t border-border pt-4">
            {job.hasApplied ? (
              <Badge variant="secondary" className="bg-[#2e7d32]/10 text-[#2e7d32] px-4 py-2 text-sm">
                Applied &mdash; {job.applicationStatus}
              </Badge>
            ) : (
              <ApplyButton jobListingId={job.jobListingId} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
