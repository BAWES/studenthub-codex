import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getStaffInterviewDetail } from "../actions";
import { updateInterviewStatusAction } from "@/modules/requests/interview-actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function statusLabel(status: number | null | undefined) {
  if (status === 1) return "Completed";
  if (status === 2) return "Cancelled";
  return "Scheduled";
}

export default async function StaffInterviewDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await requireRoleCapability("staff", "request.interview");
  const { id } = await params;
  const { notice } = await searchParams;
  const interview = await getStaffInterviewDetail({ interviewUuid: id });

  if (!interview) {
    notFound();
  }

  const facts = [
    { label: "Candidate", value: interview.candidateName },
    { label: "Email", value: interview.candidateEmail },
    { label: "Phone", value: interview.candidatePhone },
    { label: "Request", value: interview.requestTitle },
    { label: "Company", value: interview.companyName },
    { label: "Scheduled At", value: interview.scheduledAt?.toLocaleString() },
    { label: "Status", value: statusLabel(interview.status) },
    { label: "Staff", value: interview.staffName },
    { label: "Internal Note", value: interview.note },
    { label: "Interview Note", value: interview.interviewNote }
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff / Interviews"
      title={interview.candidateName ?? "Interview Detail"}
      metrics={[]}
    >
      <DetailSection title="Interview Details" facts={facts} />

      <section className="rounded-lg border border-border bg-card">
        <h2>Actions</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {interview.status !== 1 && (
            <form action={updateInterviewStatusAction}>
              <input type="hidden" name="interview_uuid" value={interview.interviewUuid} />
              <input type="hidden" name="status" value={1} />
              <Button type="submit" variant="default">Mark Completed</Button>
            </form>
          )}
          {interview.status !== 2 && (
            <form action={updateInterviewStatusAction}>
              <input type="hidden" name="interview_uuid" value={interview.interviewUuid} />
              <input type="hidden" name="status" value={2} />
              <Button type="submit" variant="outline">Mark Cancelled</Button>
            </form>
          )}
          {interview.status !== 0 && interview.status !== null && (
            <form action={updateInterviewStatusAction}>
              <input type="hidden" name="interview_uuid" value={interview.interviewUuid} />
              <input type="hidden" name="status" value={0} />
              <Button type="submit" variant="secondary">Reset to Scheduled</Button>
            </form>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {interview.candidateId && (
            <Link href={`/staff/candidates?candidate=${interview.candidateId}` as Route}>
              <Button variant="outline">View Candidate</Button>
            </Link>
          )}
          {interview.requestUuid && (
            <Link href={`/staff/requests/${interview.requestUuid}` as Route}>
              <Button variant="outline">View Request</Button>
            </Link>
          )}
          <Link href={"/staff/interviews" as Route}>
            <Button variant="ghost">Back to Interviews</Button>
          </Link>
        </div>
      </section>

      {notice && (
        <section className="rounded-lg border border-border bg-card">
          <p className="notice">
            {notice === "interview-updated" && "Interview updated successfully."}
            {notice === "not-found" && "Interview not found."}
            {notice === "missing-fields" && "Missing required fields."}
          </p>
        </section>
      )}
    </WorkspaceShell>
  );
}
