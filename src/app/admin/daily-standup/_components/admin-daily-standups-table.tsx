"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { DailyStandupAnswerItem } from "../schemas";

type Props = {
  session: SessionUser;
  answers: DailyStandupAnswerItem[];
};

export function AdminDailyStandupsTable({ session, answers }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Daily Standup Answers — staff check-ins."
      metrics={[
        { label: "Total answers", value: answers.length, note: "Standup check-ins in the system" },
      ]}
    >
      <DataTable
        title="Daily Standup Answers"
        description="All staff standup check-in answers."
        rows={answers.map((a) => ({ ...a, id: a.answer_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "question",
            label: "Question",
            render: (row) => (
              <span className="text-sm text-foreground">
                {row.question ?? "—"}
              </span>
            ),
          },
          {
            key: "answer",
            label: "Answer",
            render: (row) => (
              <span className="text-sm max-w-[300px] truncate block text-foreground">
                {row.answer ?? "—"}
              </span>
            ),
          },
          {
            key: "staff_id",
            label: "Staff ID",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.staff_id ?? "—"}
              </span>
            ),
          },
          {
            key: "updated_at",
            label: "Updated",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—"}
              </span>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}
