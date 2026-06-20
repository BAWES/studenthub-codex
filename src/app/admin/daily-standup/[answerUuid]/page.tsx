<<<<<<< HEAD
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { FactPanel } from "@/modules/workspace/DetailPanels";
=======
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
>>>>>>> origin/develop
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getDailyStandupAnswer } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminDailyStandupDetailPage({
  params,
}: {
  params: Promise<{ answerUuid: string }>;
}) {
<<<<<<< HEAD
  const session = await requireRoleCapability("admin", "app.access");
=======
  const session = await requireRoleCapability("admin", "admin.read");
>>>>>>> origin/develop
  const { answerUuid } = await params;

  if (!answerUuid) notFound();

  const data = await getDailyStandupAnswer(answerUuid);
  if (!data.answer) notFound();

  const answer = data.answer;

  return (
<<<<<<< HEAD
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Daily Standup Answers"
      title={answer.question ?? "Standup Answer"}
      metrics={[]}
    >
      <FactPanel
        title="Answer Details"
        facts={[
          { label: "Question", value: answer.question ?? "—" },
          { label: "Answer", value: answer.answer ?? "—" },
          { label: "Staff ID", value: String(answer.staff_id ?? "—") },
          { label: "Created", value: answer.created_at ? formatDate(new Date(answer.created_at)) : "—" },
          { label: "Updated", value: answer.updated_at ? formatDate(new Date(answer.updated_at)) : "—" },
        ]}
      />
    </WorkspaceShell>
=======
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Daily Standup Answers"
        title={answer.question ?? "Standup Answer"}
        metrics={[]}
      >
        <DetailSection
          title="Answer Details"
          facts={[
            { label: "Question", value: answer.question ?? "—" },
            { label: "Answer", value: answer.answer ?? "—" },
            { label: "Staff ID", value: String(answer.staff_id ?? "—") },
            { label: "Created", value: answer.created_at ? formatDate(new Date(answer.created_at)) : "—" },
            { label: "Updated", value: answer.updated_at ? formatDate(new Date(answer.updated_at)) : "—" },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
>>>>>>> origin/develop
  );
}
