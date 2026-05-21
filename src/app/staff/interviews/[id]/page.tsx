import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getStaffInterviewDetail } from "@/modules/workspace/data";
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
  const interview = await getStaffInterviewDetail(id, Number(session.id));

  if (!interview) {
    notFound();
  }

  const facts = [
    { label: "Candidate", value: interview.candidate?.candidate_name },
    { label: "Email", value: interview.candidate?.candidate_email },
    { label: "Phone", value: interview.candidate?.candidate_phone },
    { label: "Request", value: interview.request?.request_position_title },
    { label: "Company", value: interview.request?.company?.company_name },
    { label: "Scheduled At", value: interview.interview_at?.toLocaleString() },
    { label: "Status", value: statusLabel(interview.status) },
    { label: "Staff", value: interview.staff?.staff_name },
    { label: "Internal Note", value: interview.internal_note },
    { label: "Interview Note", value: interview.interview_note }
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff / Interviews"
      title={interview.candidate?.candidate_name ?? "Interview Detail"}
      metrics={[]}
    >
      <FactPanel title="Interview Details" facts={facts} />

      <section className="mt-5 border border-[var(--line)] bg-[var(--surface)]">
        <h2 className="m-0 p-[18px] border-b border-[var(--line)]">Actions</h2>
        <div className="flex gap-2 flex-wrap p-[18px]">
          {interview.status !== 1 && (
            <form action={updateInterviewStatusAction}>
              <input type="hidden" name="interview_uuid" value={interview.request_interview_uuid} />
              <input type="hidden" name="status" value={1} />
              <Button type="submit" variant="default">Mark Completed</Button>
            </form>
          )}
          {interview.status !== 2 && (
            <form action={updateInterviewStatusAction}>
              <input type="hidden" name="interview_uuid" value={interview.request_interview_uuid} />
              <input type="hidden" name="status" value={2} />
              <Button type="submit" variant="outline">Mark Cancelled</Button>
            </form>
          )}
          {interview.status !== 0 && interview.status !== null && (
            <form action={updateInterviewStatusAction}>
              <input type="hidden" name="interview_uuid" value={interview.request_interview_uuid} />
              <input type="hidden" name="status" value={0} />
              <Button type="submit" variant="secondary">Reset to Scheduled</Button>
            </form>
          )}
        </div>
      </section>

      <section className="mt-5 border border-[var(--line)] bg-[var(--surface)]">
        <div className="flex gap-2 flex-wrap p-[18px]">
          {interview.candidate?.candidate_id && (
            <Link href={`/staff/candidates?candidate=${interview.candidate.candidate_id}` as Route}>
              <Button variant="outline">View Candidate</Button>
            </Link>
          )}
          {interview.request?.request_uuid && (
            <Link href={`/staff/requests/${interview.request.request_uuid}` as Route}>
              <Button variant="outline">View Request</Button>
            </Link>
          )}
          <Link href={"/staff/interviews" as Route}>
            <Button variant="ghost">Back to Interviews</Button>
          </Link>
        </div>
      </section>

      {notice && (
        <section className="mt-5 border border-[var(--line)] bg-[var(--surface)]">
          <p className="m-0 p-[18px] text-[var(--muted)]">
            {notice === "interview-updated" && "Interview updated successfully."}
            {notice === "not-found" && "Interview not found."}
            {notice === "missing-fields" && "Missing required fields."}
          </p>
        </section>
      )}
    </WorkspaceShell>
  );
}
