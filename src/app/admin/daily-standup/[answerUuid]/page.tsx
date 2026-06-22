import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getDailyStandupAnswer } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminDailyStandupDetailPage({
  params,
}: {
  params: Promise<{ answerUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { answerUuid } = await params;

  if (!answerUuid) notFound();

  const data = await getDailyStandupAnswer(answerUuid);
  if (!data.answer) notFound();

  const answer = data.answer;

  return (
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

        <section className="flex gap-2 p-4">
          <Link href={"/admin/daily-standup" as Route}>
            <Button variant="outline">Back to Daily Standup</Button>
          </Link>
        </section>
      </WorkspaceShell>
  );
}
