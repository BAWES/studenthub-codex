import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single Jira issue item.
 */
export const jiraIssueSchema = z.object({
  id: z.string(),
  key: z.string(),
  summary: z.string().nullable(),
  status: z.string().nullable(),
  assignee: z
    .object({
      displayName: z.string(),
      emailAddress: z.string().nullable(),
    })
    .nullable(),
  created: z.string().nullable(),
  updated: z.string().nullable(),
});

/**
 * Schema for the listJiraIssues response.
 */
export const listJiraIssuesResultSchema = z.object({
  issues: z.array(jiraIssueSchema),
  total: z.number().int().nonnegative(),
});

/**
 * Schema for a single Jira user item.
 */
export const jiraUserSchema = z.object({
  displayName: z.string(),
  emailAddress: z.string().nullable(),
  accountId: z.string(),
  active: z.boolean(),
  avatarUrls: z.record(z.string()).nullable(),
});

/**
 * Schema for the listJiraUsers response.
 */
export const listJiraUsersResultSchema = z.object({
  users: z.array(jiraUserSchema),
});

// ---------------------------------------------------------------------------
// Types derived from output schemas
// ---------------------------------------------------------------------------

export type JiraIssue = z.output<typeof jiraIssueSchema>;
export type ListJiraIssuesResult = z.output<typeof listJiraIssuesResultSchema>;
export type JiraUser = z.output<typeof jiraUserSchema>;
export type ListJiraUsersResult = z.output<typeof listJiraUsersResultSchema>;
