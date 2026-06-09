import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { prisma } from "@/lib/prisma";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { WorkLogAppealForm } from "@/modules/candidates/WorkLogAppealForm";
import { getWorkLogDetail } from "../actions";

export const dynamic = "force-dynamic";

export default async function CandidateWorkLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const { id } = await params;

  const [workLog, appeals, feedback] = await Promise.all([
    getWorkLogDetail({ workLogUuid: id }),
    prisma.candidate_working_hour_appeal.findMany({
      where: { candidate_working_hour_uuid: id, candidate_id: Number(session.id) },
      orderBy: { created_at: "desc" },
      take: 8,
      select: { appeal_uuid: true, reason: true, status: true, created_at: true },
    }),
    prisma.candidate_work_log_feedback.findMany({
      where: { candidate_working_hour_uuid: id, candidate_id: Number(session.id) },
      orderBy: { created_at: "desc" },
      take: 8,
      select: { cwlf_uuid: true, note: true, reason: true, status: true, rating: true, created_at: true },
    }),
  ]);

  if (!workLog) {
    notFound();
  }

  const metrics = [
    { label: "Total", value: `${workLog.total_time ?? 0} minutes`, note: "Imported total time" },
    { label: "Status", value: `Status ${workLog.status ?? 0}`, note: workLog.via ?? "No source" },
    { label: "Appeals", value: appeals.length, note: "Appeal records linked to this log" },
    { label: "Feedback", value: feedback.length, note: "Feedback records linked to this log" },
  ];

  const appealRows = appeals.map((appeal: { appeal_uuid: string; reason: string | null; status: number | null; created_at: Date | null }) => ({
    id: appeal.appeal_uuid,
    title: `Status ${appeal.status}`,
    subtitle: appeal.reason?.slice(0, 180) ?? "No reason",
    meta: formatDate(appeal.created_at),
  }));

  const feedbackRows = feedback.map((fb: { cwlf_uuid: string; note: string | null; reason: string | null; status: number | null; rating: boolean | null; created_at: Date | null }) => ({
    id: fb.cwlf_uuid,
    title: `Rating ${fb.rating ?? "N/A"} · Status ${fb.status}`,
    subtitle: fb.reason?.slice(0, 180) ?? fb.note?.slice(0, 180) ?? "No feedback",
    meta: formatDate(fb.created_at),
  }));

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Work Log"
      title={`${workLog.store_name ?? "Work log"} · ${workLog.date ? formatDate(workLog.date) : "N/A"}`}
      metrics={metrics}
      primary={{ title: "Appeals", rows: appealRows }}
      secondary={{ title: "Feedback", rows: feedbackRows }}
    >
      <DetailSection
        title="Shift Record"
        facts={[
          { label: "Company", value: workLog.company_name },
          { label: "Store", value: workLog.store_name },
          { label: "Store Location", value: workLog.store_location },
          { label: "Start", value: workLog.start_time ? formatDate(workLog.start_time) : "N/A" },
          { label: "End", value: workLog.end_time ? formatDate(workLog.end_time) : "N/A" },
          { label: "Note", value: workLog.note },
        ]}
      />

      <WorkLogAppealForm workLogUuid={workLog.candidate_working_hour_uuid} />
    </WorkspaceShell>
  );
}
