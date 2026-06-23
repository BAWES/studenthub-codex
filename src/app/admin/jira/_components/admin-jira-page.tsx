"use client";

import { useState } from "react";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { JiraIssue, JiraUser } from "../schemas";

type Props = {
  session: SessionUser;
  issues: JiraIssue[];
  users: JiraUser[];
  error: string | null;
};

export function AdminJiraPage({ session, issues, users, error }: Props) {
  const [tab, setTab] = useState<"issues" | "users">("issues");

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Jira Cloud integration — browse Atlassian issues and users."
      metrics={[
        {
          label: "Issues",
          value: issues.length,
          note: "Recent Jira issues loaded",
        },
        {
          label: "Users",
          value: users.length,
          note: "Active Jira users",
        },
      ]}
    >
      {error ? (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm border-[var(--sh-error)] text-[var(--sh-error)] bg-[var(--surface)]"
        >
          {error}
        </div>
      ) : null}

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("issues")}
          className={`text-xs px-3 py-1.5 rounded-md transition-all duration-200 border border-border ${
            tab === "issues"
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface)] text-[var(--ink)]"
          }`}
        >
          Issues
        </button>
        <button
          type="button"
          onClick={() => setTab("users")}
          className={`text-xs px-3 py-1.5 rounded-md transition-all duration-200 border border-border ${
            tab === "users"
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface)] text-[var(--ink)]"
          }`}
        >
          Users
        </button>
      </div>

      {tab === "issues" ? (
        <DataTable
          title="Jira Issues"
          description="Issues from the connected Jira Cloud instance."
          rows={issues.map((i) => ({ ...i, id: i.id }))}
          rowHref={undefined}
          columns={[
            {
              key: "key",
              label: "Key",
              render: (row) => (
                <code
                  className="text-sm font-mono text-[var(--accent)]"
                >
                  {row.key}
                </code>
              ),
            },
            {
              key: "summary",
              label: "Summary",
              render: (row) => (
                <span
                  className="text-sm truncate max-w-xs inline-block text-foreground"
                  title={row.summary ?? undefined}
                >
                  {row.summary ?? "—"}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <span
                  className="text-sm text-foreground"
                >
                  {row.status ?? "—"}
                </span>
              ),
            },
            {
              key: "assignee",
              label: "Assignee",
              render: (row) => (
                <span
                  className="text-sm text-foreground"
                >
                  {row.assignee?.displayName ?? "Unassigned"}
                </span>
              ),
            },
            {
              key: "created",
              label: "Created",
              render: (row) => (
                <span
                  className="text-sm text-muted-foreground"
                >
                  {row.created
                    ? new Date(row.created).toLocaleDateString()
                    : "—"}
                </span>
              ),
            },
          ]}
        />
      ) : (
        <DataTable
          title="Jira Users"
          description="Active users in the connected Jira Cloud instance."
          rows={users.map((u) => ({ ...u, id: u.accountId }))}
          rowHref={undefined}
          columns={[
            {
              key: "displayName",
              label: "Name",
              render: (row) => (
                <span
                  className="text-sm text-foreground"
                >
                  {row.displayName}
                </span>
              ),
            },
            {
              key: "emailAddress",
              label: "Email",
              render: (row) => (
                <span
                  className="text-sm text-muted-foreground"
                >
                  {row.emailAddress ?? "—"}
                </span>
              ),
            },
            {
              key: "accountId",
              label: "Account ID",
              render: (row) => (
                <code
                  className="text-sm font-mono text-muted-foreground"
                >
                  {row.accountId.slice(0, 16)}...
                </code>
              ),
            },
            {
              key: "active",
              label: "Status",
              render: (row) => (
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-green-600 bg-green-500/10"
                >
                  Active
                </span>
              ),
            },
          ]}
        />
      )}
    </WorkspaceShell>
  );
}
