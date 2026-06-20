"use server";

// ---------------------------------------------------------------------------
// JiraController — Jira Cloud integration server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 staff/modules/v1/controllers/JiraController.php
// Uses Jira Cloud REST API v3 with Basic Auth (email + API token).
//
// Actions:
//   - listJiraIssues  — search Jira issues by assignee account IDs and/or status
//   - listJiraUsers   — search Jira users, filtered to active Atlassian accounts
//
// Environment variables:
//   JIRA_URL      — Jira Cloud instance URL (defaults to actual)
//   JIRA_EMAIL    — Jira account email for Basic Auth
//   JIRA_API_TOKEN — Jira API token for Basic Auth
// ---------------------------------------------------------------------------

import { z } from "zod";
import { requireCapability } from "@/modules/auth/session";
import {
  jiraIssueSchema,
  listJiraIssuesResultSchema,
  jiraUserSchema,
  listJiraUsersResultSchema,
} from "./schemas";
import type {
  JiraIssue,
  ListJiraIssuesResult,
  JiraUser,
  ListJiraUsersResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const jiraUrl = process.env.JIRA_URL ?? "https://bawes-studenthub.atlassian.net";
const jiraEmail = process.env.JIRA_EMAIL;
const jiraApiToken = process.env.JIRA_API_TOKEN;

const listJiraIssuesSchema = z.object({
  accountId: z.string().optional(),
  status: z.string().optional(),
  maxResults: z.coerce.number().int().positive().optional().default(50),
});

const listJiraUsersSchema = z.object({
  query: z.string().optional(),
  maxResults: z.coerce.number().int().positive().optional().default(1000),
});

const getJiraIssueSchema = z.object({
  issueKey: z.string().min(1, "Issue key is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListJiraIssuesParams = z.input<typeof listJiraIssuesSchema>;
export type ListJiraUsersParams = z.input<typeof listJiraUsersSchema>;
export type GetJiraIssueParams = z.input<typeof getJiraIssueSchema>;


// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getAuthHeaders(): Record<string, string> {
  if (!jiraEmail || !jiraApiToken) {
    throw new Error(
      "JIRA_EMAIL and JIRA_API_TOKEN environment variables must be set",
    );
  }
  const encoded = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString(
    "base64",
  );
  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function jiraGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(
    `${jiraUrl.replace(/\/+$/, "")}/rest/api/3/${path.replace(/^\/+/, "")}`,
  );
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, v);
    });
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Jira API error (${response.status}): ${body.slice(0, 500)}`,
    );
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * Search Jira issues by assignee account IDs and/or status.
 * Mirrors the legacy JiraController::actionIssues.
 * Results ordered by created DESC.
 */
export async function listJiraIssues(
  params: ListJiraIssuesParams = {},
): Promise<ListJiraIssuesResult> {
  const parsed = listJiraIssuesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { accountId, status, maxResults } = parsed.data;

  const jqlParts: string[] = [];
  if (accountId) {
    jqlParts.push(`assignee in (${accountId})`);
  }
  if (status) {
    jqlParts.push(`status="${status}"`);
  }
  jqlParts.push("ORDER BY created DESC");

  const data = await jiraGet<{
    issues: Array<{
      id: string;
      key: string;
      fields?: {
        summary?: string;
        status?: { name?: string };
        assignee?: {
          displayName?: string;
          emailAddress?: string;
        } | null;
        created?: string;
        updated?: string;
      };
    }>;
    total: number;
  }>("search", {
    jql: jqlParts.join(" AND "),
    maxResults: String(maxResults),
  });

  const result: ListJiraIssuesResult = {
    issues: (data.issues ?? []).map((issue) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields?.summary ?? null,
      status: issue.fields?.status?.name ?? null,
      assignee: issue.fields?.assignee
        ? {
            displayName: issue.fields.assignee.displayName ?? "",
            emailAddress: issue.fields.assignee.emailAddress ?? null,
          }
        : null,
      created: issue.fields?.created ?? null,
      updated: issue.fields?.updated ?? null,
    })),
    total: data.total ?? 0,
  };

  // Validate output shape
  const outputParsed = listJiraIssuesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/jira] listJiraIssues output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Search Jira users.
 * Mirrors the legacy JiraController::actionUsers.
 * Returns only active Atlassian accounts.
 */
export async function listJiraUsers(
  params: ListJiraUsersParams = {},
): Promise<ListJiraUsersResult> {
  const parsed = listJiraUsersSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { query, maxResults } = parsed.data;

  const searchParams: Record<string, string> = {
    maxResults: String(maxResults),
  };
  if (query) {
    searchParams.query = query;
  }

  const data = await jiraGet<Array<{
    accountId: string;
    displayName: string;
    emailAddress?: string;
    active?: boolean;
    avatarUrls?: Record<string, string>;
    accountType?: string;
  }>>("users/search", searchParams);

  const result: ListJiraUsersResult = {
    users: (data ?? [])
      .filter(
        (u) =>
          u.active === true &&
          (u.accountType === "atlassian" || !u.accountType),
      )
      .map((u) => ({
        displayName: u.displayName,
        emailAddress: u.emailAddress ?? null,
        accountId: u.accountId,
        active: u.active ?? false,
        avatarUrls: u.avatarUrls ?? null,
      })),
  };

  // Validate output shape
  const outputParsed = listJiraUsersResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/jira] listJiraUsers output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getJiraIssue
// ---------------------------------------------------------------------------

/**
 * Get a single Jira issue by its key (e.g. "PROJ-123").
 * Calls the Jira Cloud REST API v3 issue endpoint.
 * Requires admin.read capability.
 */
export async function getJiraIssue(
  params: GetJiraIssueParams,
): Promise<JiraIssue | null> {
  await requireCapability("admin.read");

  const parsed = getJiraIssueSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid issue key");
  }

  const { issueKey } = parsed.data;

  const data = await jiraGet<{
    id: string;
    key: string;
    fields?: {
      summary?: string;
      status?: { name?: string };
      assignee?: {
        displayName?: string;
        emailAddress?: string;
      } | null;
      created?: string;
      updated?: string;
    };
  }>(`issue/${issueKey}`);

  const result: JiraIssue = {
    id: data.id,
    key: data.key,
    summary: data.fields?.summary ?? null,
    status: data.fields?.status?.name ?? null,
    assignee: data.fields?.assignee
      ? {
          displayName: data.fields.assignee.displayName ?? "",
          emailAddress: data.fields.assignee.emailAddress ?? null,
        }
      : null,
    created: data.fields?.created ?? null,
    updated: data.fields?.updated ?? null,
  };

  // Validate output shape
  const outputParsed = jiraIssueSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/jira] getJiraIssue output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
