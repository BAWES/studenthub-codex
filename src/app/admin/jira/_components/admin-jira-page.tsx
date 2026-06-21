"use client";

import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import type { SessionUser } from "@/modules/auth/types";
import type { JiraIssue, JiraUser } from "../schemas";

type Props = {
  session: SessionUser;
  issues: JiraIssue[];
  users: JiraUser[];
  error: string | null;
};

export function AdminJiraPage({ session, issues, users, error }: Props) {
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
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      ) : null}

      <Tabs defaultValue="issues" className="mb-4">
        <TabsList>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="issues">
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
                  <code className="text-sm font-mono text-primary">
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
                  <span className="text-sm text-foreground">
                    {row.status ?? "—"}
                  </span>
                ),
              },
              {
                key: "assignee",
                label: "Assignee",
                render: (row) => (
                  <span className="text-sm text-foreground">
                    {row.assignee?.displayName ?? "Unassigned"}
                  </span>
                ),
              },
              {
                key: "created",
                label: "Created",
                render: (row) => (
                  <span className="text-sm text-muted-foreground">
                    {row.created
                      ? new Date(row.created).toLocaleDateString()
                      : "—"}
                  </span>
                ),
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="users">
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
                  <span className="text-sm text-foreground">
                    {row.displayName}
                  </span>
                ),
              },
              {
                key: "emailAddress",
                label: "Email",
                render: (row) => (
                  <span className="text-sm text-muted-foreground">
                    {row.emailAddress ?? "—"}
                  </span>
                ),
              },
              {
                key: "accountId",
                label: "Account ID",
                render: (row) => (
                  <code className="text-sm font-mono text-muted-foreground">
                    {row.accountId.slice(0, 16)}...
                  </code>
                ),
              },
              {
                key: "active",
                label: "Status",
                render: (row) => (
                  <Badge variant="success">Active</Badge>
                ),
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </WorkspaceShell>
  );
}
