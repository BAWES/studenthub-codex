import { describe, it, expect } from "vitest";
import {
  jiraIssueSchema,
  listJiraIssuesResultSchema,
  jiraUserSchema,
  listJiraUsersResultSchema,
} from "./schemas";

/**
 * Page migration test for admin/jira.
 *
 * Verifies the data contract between page and action.
 */
describe("admin jira page — data contract", () => {
  it("jiraIssueSchema validates a full issue", () => {
    const r = jiraIssueSchema.safeParse({
      id: "10000",
      key: "PROJ-123",
      summary: "Fix login bug",
      status: "In Progress",
      assignee: {
        displayName: "John Doe",
        emailAddress: "john@example.com",
      },
      created: "2026-06-01T10:00:00.000Z",
      updated: "2026-06-14T12:00:00.000Z",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.key).toBe("PROJ-123");
      expect(r.data.assignee?.displayName).toBe("John Doe");
    }
  });

  it("jiraIssueSchema accepts nullable assignee", () => {
    const r = jiraIssueSchema.safeParse({
      id: "10001",
      key: "PROJ-124",
      summary: null,
      status: null,
      assignee: null,
      created: null,
      updated: null,
    });
    expect(r.success).toBe(true);
  });

  it("jiraIssueSchema rejects missing id", () => {
    const r = jiraIssueSchema.safeParse({
      key: "PROJ-125",
      summary: "Test",
      status: "Open",
      assignee: null,
      created: null,
      updated: null,
    });
    expect(r.success).toBe(false);
  });

  it("jiraIssueSchema rejects missing key", () => {
    const r = jiraIssueSchema.safeParse({
      id: "10002",
      summary: "Test",
      status: "Open",
      assignee: null,
      created: null,
      updated: null,
    });
    expect(r.success).toBe(false);
  });

  it("listJiraIssuesResultSchema validates result", () => {
    const r = listJiraIssuesResultSchema.safeParse({
      issues: [
        {
          id: "10000",
          key: "PROJ-123",
          summary: "Fix bug",
          status: "Done",
          assignee: null,
          created: null,
          updated: null,
        },
      ],
      total: 1,
    });
    expect(r.success).toBe(true);
  });

  it("listJiraIssuesResultSchema rejects negative total", () => {
    const r = listJiraIssuesResultSchema.safeParse({
      issues: [],
      total: -1,
    });
    expect(r.success).toBe(false);
  });

  it("jiraUserSchema validates a user", () => {
    const r = jiraUserSchema.safeParse({
      displayName: "Jane Smith",
      emailAddress: "jane@example.com",
      accountId: "557058:abc123",
      active: true,
      avatarUrls: { "48x48": "https://example.com/avatar.png" },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.displayName).toBe("Jane Smith");
      expect(r.data.active).toBe(true);
    }
  });

  it("jiraUserSchema accepts nullable email", () => {
    const r = jiraUserSchema.safeParse({
      displayName: "Bot User",
      emailAddress: null,
      accountId: "557058:xyz789",
      active: true,
      avatarUrls: null,
    });
    expect(r.success).toBe(true);
  });

  it("jiraUserSchema rejects missing displayName", () => {
    const r = jiraUserSchema.safeParse({
      emailAddress: null,
      accountId: "abc",
      active: true,
      avatarUrls: null,
    });
    expect(r.success).toBe(false);
  });

  it("listJiraUsersResultSchema validates result", () => {
    const r = listJiraUsersResultSchema.safeParse({
      users: [
        {
          displayName: "User",
          emailAddress: null,
          accountId: "a1",
          active: true,
          avatarUrls: null,
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("listJiraUsersResultSchema rejects missing users", () => {
    const r = listJiraUsersResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
