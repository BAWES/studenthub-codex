import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { CompactList, FactPanel } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidateWorkLogDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";
import { WorkLogAppealForm } from "@/modules/candidates/WorkLogAppealForm";

export const dynamic = "force-dynamic";

export default async function CandidateWorkLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const { id } = await params;
  const data = await getCandidateWorkLogDetail(Number(session.id), id);

  if (!data.workLog) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Work Log"
      title={`${data.workLog.store?.store_name ?? "Work log"} · ${formatDate(data.workLog.date)}`}
      metrics={data.metrics}
      primary={{ title: "Appeals", rows: data.appeals }}
      secondary={{ title: "Feedback", rows: data.feedback }}
    >
      <FactPanel
        title="Shift Record"
        facts={[
          { label: "Company", value: data.workLog.store?.company?.company_name },
          { label: "Store", value: data.workLog.store?.store_name },
          { label: "Store Location", value: data.workLog.store?.store_location },
          { label: "Start", value: formatDate(data.workLog.start_time) },
          { label: "End", value: formatDate(data.workLog.end_time) },
          { label: "Note", value: data.workLog.note },
        ]}
      />

      <WorkLogAppealForm workLogUuid={data.workLog.candidate_working_hour_uuid} />
    </WorkspaceShell>
  );
}
