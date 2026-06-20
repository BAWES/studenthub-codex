import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getJiraIssue } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminJiraIssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const issue = await getJiraIssue({ issueKey: id });

  if (!issue) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Jira"
        title={`Jira Issue — ${issue.key}`}
        metrics={[
          {
            label: "Key",
            value: issue.key,
            note: "Issue key",
          },
          {
            label: "Summary",
            value: issue.summary ?? "—",
            note: "",
          },
          {
            label: "Status",
            value: issue.status ?? "—",
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Issue Details"
          facts={[
            { label: "ID", value: issue.id },
            { label: "Key", value: issue.key },
            { label: "Summary", value: issue.summary ?? "—" },
            { label: "Status", value: issue.status ?? "—" },
            {
              label: "Assignee",
              value: issue.assignee?.displayName ?? "Unassigned",
            },
            { label: "Assignee Email", value: issue.assignee?.emailAddress ?? "—" },
            { label: "Created", value: issue.created ?? "—" },
            { label: "Updated", value: issue.updated ?? "—" },
          ]}
        />

        <section className="flex gap-2 p-4">
          <Link href={"/admin/jira" as Route}>
            <Button variant="outline">Back to Jira Issues</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
