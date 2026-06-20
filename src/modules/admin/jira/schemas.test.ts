import { describe, it, expect } from "vitest";
import {
  jiraIssueSchema,
  listJiraIssuesResultSchema,
  jiraUserSchema,
  listJiraUsersResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// jiraIssueSchema
// ---------------------------------------------------------------------------
describe("jiraIssueSchema", () => {
  const validIssue = {
    id: "10001",
    key: "PROJ-123",
    summary: "Fix login button alignment",
    status: "In Progress",
    assignee: {
      displayName: "John Doe",
      emailAddress: "john@example.com",
    },
    created: "2025-01-10T08:00:00Z",
    updated: "2025-01-15T10:00:00Z",
  };

  it("accepts a valid issue", () => {
    expect(jiraIssueSchema.safeParse(validIssue).success).toBe(true);
  });

  it("accepts nullable summary", () => {
    expect(jiraIssueSchema.safeParse({ ...validIssue, summary: null }).success).toBe(true);
  });

  it("accepts nullable status", () => {
    expect(jiraIssueSchema.safeParse({ ...validIssue, status: null }).success).toBe(true);
  });

  it("accepts null assignee", () => {
    expect(jiraIssueSchema.safeParse({ ...validIssue, assignee: null }).success).toBe(true);
  });

  it("accepts nullable email in assignee", () => {
    expect(
      jiraIssueSchema.safeParse({
        ...validIssue,
        assignee: { ...validIssue.assignee, emailAddress: null },
      }).success,
    ).toBe(true);
  });

  it("accepts nullable created", () => {
    expect(jiraIssueSchema.safeParse({ ...validIssue, created: null }).success).toBe(true);
  });

  it("accepts nullable updated", () => {
    expect(jiraIssueSchema.safeParse({ ...validIssue, updated: null }).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validIssue;
    expect(jiraIssueSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing key", () => {
    const { key: _, ...rest } = validIssue;
    expect(jiraIssueSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for assignee", () => {
    expect(jiraIssueSchema.safeParse({ ...validIssue, assignee: "not-an-object" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listJiraIssuesResultSchema
// ---------------------------------------------------------------------------
describe("listJiraIssuesResultSchema", () => {
  const validResult = {
    issues: [
      {
        id: "10001",
        key: "PROJ-123",
        summary: "Fix login button",
        status: "Done",
        assignee: null,
        created: null,
        updated: null,
      },
    ],
    total: 1,
  };

  it("accepts a valid result", () => {
    expect(listJiraIssuesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty issues array", () => {
    expect(listJiraIssuesResultSchema.safeParse({ issues: [], total: 0 }).success).toBe(true);
  });

  it("accepts zero total", () => {
    expect(listJiraIssuesResultSchema.safeParse({ issues: [], total: 0 }).success).toBe(true);
  });

  it("rejects missing issues", () => {
    expect(listJiraIssuesResultSchema.safeParse({ total: 0 }).success).toBe(false);
  });

  it("rejects missing total", () => {
    expect(listJiraIssuesResultSchema.safeParse({ issues: [] }).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listJiraIssuesResultSchema.safeParse({ issues: [], total: -1 }).success).toBe(false);
  });

  it("rejects invalid issue in array", () => {
    expect(
      listJiraIssuesResultSchema.safeParse({
        issues: [{ id: "10001" }], // missing key
        total: 1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// jiraUserSchema
// ---------------------------------------------------------------------------
describe("jiraUserSchema", () => {
  const validUser = {
    displayName: "Jane Smith",
    emailAddress: "jane@example.com",
    accountId: "abc-123-def",
    active: true,
    avatarUrls: { "48x48": "https://avatar.example.com/1" },
  };

  it("accepts a valid user", () => {
    expect(jiraUserSchema.safeParse(validUser).success).toBe(true);
  });

  it("accepts nullable emailAddress", () => {
    expect(jiraUserSchema.safeParse({ ...validUser, emailAddress: null }).success).toBe(true);
  });

  it("accepts null avatarUrls", () => {
    expect(jiraUserSchema.safeParse({ ...validUser, avatarUrls: null }).success).toBe(true);
  });

  it("accepts false active", () => {
    expect(jiraUserSchema.safeParse({ ...validUser, active: false }).success).toBe(true);
  });

  it("rejects missing displayName", () => {
    const { displayName: _, ...rest } = validUser;
    expect(jiraUserSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing accountId", () => {
    const { accountId: _, ...rest } = validUser;
    expect(jiraUserSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing active", () => {
    const { active: _, ...rest } = validUser;
    expect(jiraUserSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for active", () => {
    expect(jiraUserSchema.safeParse({ ...validUser, active: "yes" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listJiraUsersResultSchema
// ---------------------------------------------------------------------------
describe("listJiraUsersResultSchema", () => {
  const validResult = {
    users: [
      {
        displayName: "User One",
        emailAddress: null,
        accountId: "id-1",
        active: true,
        avatarUrls: null,
      },
    ],
  };

  it("accepts a valid result", () => {
    expect(listJiraUsersResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty users array", () => {
    expect(listJiraUsersResultSchema.safeParse({ users: [] }).success).toBe(true);
  });

  it("rejects missing users", () => {
    expect(listJiraUsersResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid user in array", () => {
    expect(
      listJiraUsersResultSchema.safeParse({
        users: [{ displayName: "No accountId" }],
      }).success,
    ).toBe(false);
  });
});
