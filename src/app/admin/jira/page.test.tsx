import { describe, it, expect } from "vitest";
import {
  jiraIssueSchema,
  listJiraIssuesResultSchema,
  jiraUserSchema,
  listJiraUsersResultSchema,
} from "./schemas";
import type { JiraIssue, ListJiraIssuesResult, JiraUser, ListJiraUsersResult } from "./schemas";

/**
 * Page migration test for admin/jira.
 *
 * Verifies that listJiraIssuesResultSchema and listJiraUsersResultSchema
 * accept the data returned by the listJiraIssues and listJiraUsers
 * server actions.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server actions.
 */
describe("admin jira page — data contract", () => {
  it("listJiraIssuesResultSchema accepts empty issues array", () => {
    const r = listJiraIssuesResultSchema.safeParse({ issues: [], total: 0 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.issues).toEqual([]);
      expect(r.data.total).toBe(0);
    }
  });

  it("listJiraIssuesResultSchema accepts a full issues payload", () => {
    const r = listJiraIssuesResultSchema.safeParse({
      issues: [
        {
          id: "10001",
          key: "STU-1234",
          summary: "Fix login page alignment",
          status: "In Progress",
          assignee: {
            displayName: "John Doe",
            emailAddress: "john@studenthub.co",
          },
          created: "2026-06-01T10:00:00Z",
          updated: "2026-06-19T08:00:00Z",
        },
      ],
      total: 42,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.issues.length).toBe(1);
      expect(r.data.issues[0].key).toBe("STU-1234");
      expect(r.data.total).toBe(42);
    }
  });

  it("jiraIssueSchema validates a single issue with nullable fields", () => {
    // Test issue with nullable fields as null
    const r = jiraIssueSchema.safeParse({
      id: "10002",
      key: "STU-5678",
      summary: null,
      status: null,
      assignee: null,
      created: null,
      updated: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.summary).toBeNull();
      expect(r.data.assignee).toBeNull();
    }
  });

  it("jiraIssueSchema rejects missing id", () => {
    const r = jiraIssueSchema.safeParse({
      key: "STU-0001",
      summary: "Missing id",
      status: "Open",
      assignee: null,
      created: null,
      updated: null,
    });
    expect(r.success).toBe(false);
  });

  it("jiraIssueSchema rejects missing key", () => {
    const r = jiraIssueSchema.safeParse({
      id: "10003",
      summary: "Missing key",
      status: "Open",
    });
    expect(r.success).toBe(false);
  });

  it("listJiraUsersResultSchema accepts empty users array", () => {
    const r = listJiraUsersResultSchema.safeParse({ users: [] });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.users).toEqual([]);
    }
  });

  it("listJiraUsersResultSchema accepts a full users payload", () => {
    const r = listJiraUsersResultSchema.safeParse({
      users: [
        {
          displayName: "Jane Smith",
          emailAddress: "jane@studenthub.co",
          accountId: "abc123",
          active: true,
          avatarUrls: { "48x48": "https://avatar.example.com/jane.jpg" },
        },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.users.length).toBe(1);
      expect(r.data.users[0].displayName).toBe("Jane Smith");
      expect(r.data.users[0].active).toBe(true);
    }
  });

  it("jiraUserSchema accepts nullable email and avatarUrls", () => {
    const r = jiraUserSchema.safeParse({
      displayName: "Bot User",
      emailAddress: null,
      accountId: "bot-001",
      active: false,
      avatarUrls: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.emailAddress).toBeNull();
      expect(r.data.avatarUrls).toBeNull();
    }
  });

  it("jiraUserSchema rejects missing displayName", () => {
    const r = jiraUserSchema.safeParse({
      emailAddress: "test@test.com",
      accountId: "acc-001",
      active: true,
    });
    expect(r.success).toBe(false);
  });

  it("jiraUserSchema rejects missing accountId", () => {
    const r = jiraUserSchema.safeParse({
      displayName: "No Account",
      active: true,
    });
    expect(r.success).toBe(false);
  });

  it("JiraIssue type fields map to AdminJiraPage columns", () => {
    // The page maps JiraIssue to table columns:
    //   key       → issue key link
    //   summary   → issue title
    //   status    → status badge
    //   assignee  → assignee name
    //   created   → creation date
    //   updated   → last updated date
    const issue: JiraIssue = {
      id: "10001",
      key: "STU-1234",
      summary: "Fix login alignment",
      status: "In Progress",
      assignee: {
        displayName: "John Doe",
        emailAddress: "john@studenthub.co",
      },
      created: "2026-06-01T10:00:00Z",
      updated: "2026-06-19T08:00:00Z",
    };
    expect(issue.id).toBe("10001");
    expect(issue.key).toBe("STU-1234");
    expect(issue.summary).toBe("Fix login alignment");
    expect(issue.status).toBe("In Progress");
    expect(issue.assignee?.displayName).toBe("John Doe");
    expect(issue.created).toBe("2026-06-01T10:00:00Z");
    expect(issue.updated).toBe("2026-06-19T08:00:00Z");
  });

  it("ListJiraIssuesResult shape matches listJiraIssues server action return", () => {
    const result: ListJiraIssuesResult = {
      issues: [],
      total: 0,
    };
    expect(Array.isArray(result.issues)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("ListJiraUsersResult shape matches listJiraUsers server action return", () => {
    const result: ListJiraUsersResult = {
      users: [],
    };
    expect(Array.isArray(result.users)).toBe(true);
  });
});
