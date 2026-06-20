import { requireRoleCapability } from "@/modules/auth/session";
import { listJiraIssues, listJiraUsers } from "./actions";
import { AdminJiraPage } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminJiraRoute() {
  const session = await requireRoleCapability("admin", "admin.read");

  let issues;
  let users;
  let error: string | null = null;

  try {
    [issues, users] = await Promise.all([
      listJiraIssues({ maxResults: 50 }),
      listJiraUsers({ maxResults: 50 }),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load Jira data";
  }

  return (
    <AdminJiraPage
      session={session}
      issues={issues?.issues ?? []}
      users={users?.users ?? []}
      error={error}
    />
  );
}
