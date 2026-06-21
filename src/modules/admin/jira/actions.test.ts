import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import {
  jiraIssueSchema,
  listJiraIssuesResultSchema,
  jiraUserSchema,
  listJiraUsersResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema definitions (mirroring actions.ts for test isolation)
// ---------------------------------------------------------------------------

const listJiraIssuesSchema = z.object({
  accountId: z.string().optional(),
  status: z.string().optional(),
  maxResults: z.coerce.number().int().positive().optional().default(50),
});

const listJiraUsersSchema = z.object({
  query: z.string().optional(),
  maxResults: z.coerce.number().int().positive().optional().default(1000),
});

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

type JiraIssue = {
  id: string;
  key: string;
  summary: string | null;
  status: string | null;
  assignee: { displayName: string; emailAddress: string | null } | null;
  created: string | null;
  updated: string | null;
};

type ListJiraIssuesResult = {
  issues: JiraIssue[];
  total: number;
};

type JiraUser = {
  displayName: string;
  emailAddress: string | null;
  accountId: string;
  active: boolean;
  avatarUrls: Record<string, string> | null;
};

type ListJiraUsersResult = {
  users: JiraUser[];
};

// ---------------------------------------------------------------------------
// Tests: listJiraIssuesSchema
// ---------------------------------------------------------------------------

describe("listJiraIssuesSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listJiraIssuesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxResults).toBe(50);
      expect(result.data.accountId).toBeUndefined();
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts full params with all filters", () => {
    const result = listJiraIssuesSchema.safeParse({
      accountId: "5e1f6a2b3c4d5e6f7a8b9c0d",
      status: "In Progress",
      maxResults: "25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accountId).toBe("5e1f6a2b3c4d5e6f7a8b9c0d");
      expect(result.data.status).toBe("In Progress");
      expect(result.data.maxResults).toBe(25);
    }
  });

  it("coerces string maxResults to number", () => {
    const result = listJiraIssuesSchema.safeParse({ maxResults: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxResults).toBe(10);
    }
  });

  it("rejects negative maxResults", () => {
    const result = listJiraIssuesSchema.safeParse({ maxResults: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects zero maxResults", () => {
    const result = listJiraIssuesSchema.safeParse({ maxResults: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric maxResults string", () => {
    const result = listJiraIssuesSchema.safeParse({ maxResults: "abc" });
    expect(result.success).toBe(false);
  });

  it("accepts only accountId", () => {
    const result = listJiraIssuesSchema.safeParse({
      accountId: "abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accountId).toBe("abc123");
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts only status", () => {
    const result = listJiraIssuesSchema.safeParse({
      status: "Done",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("Done");
      expect(result.data.accountId).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: listJiraUsersSchema
// ---------------------------------------------------------------------------

describe("listJiraUsersSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listJiraUsersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxResults).toBe(1000);
      expect(result.data.query).toBeUndefined();
    }
  });

  it("accepts query filter", () => {
    const result = listJiraUsersSchema.safeParse({ query: "john" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("john");
    }
  });

  it("coerces string maxResults", () => {
    const result = listJiraUsersSchema.safeParse({ maxResults: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxResults).toBe(50);
    }
  });

  it("rejects negative maxResults", () => {
    const result = listJiraUsersSchema.safeParse({ maxResults: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: Type shape correctness
// ---------------------------------------------------------------------------

describe("JiraIssue type shape", () => {
  it("shapes a valid issue object", () => {
    const issue: JiraIssue = {
      id: "10001",
      key: "PROJ-42",
      summary: "Fix login bug",
      status: "In Progress",
      assignee: {
        displayName: "John Doe",
        emailAddress: "john@example.com",
      },
      created: "2026-01-15T10:00:00Z",
      updated: "2026-02-20T14:30:00Z",
    };
    expect(issue.id).toBe("10001");
    expect(issue.key).toBe("PROJ-42");
    expect(issue.assignee?.displayName).toBe("John Doe");
  });

  it("allows null assignee", () => {
    const issue: JiraIssue = {
      id: "10002",
      key: "PROJ-43",
      summary: "Unassigned task",
      status: "Open",
      assignee: null,
      created: "2026-03-01T08:00:00Z",
      updated: null,
    };
    expect(issue.assignee).toBeNull();
    expect(issue.updated).toBeNull();
  });

  it("allows null email address in assignee", () => {
    const issue: JiraIssue = {
      id: "10003",
      key: "PROJ-44",
      summary: "External contributor",
      status: "Review",
      assignee: {
        displayName: "External User",
        emailAddress: null,
      },
      created: "2026-04-01T12:00:00Z",
      updated: "2026-04-02T09:00:00Z",
    };
    expect(issue.assignee?.emailAddress).toBeNull();
  });
});

describe("ListJiraIssuesResult shape", () => {
  it("holds issues array and total count", () => {
    const result: ListJiraIssuesResult = {
      issues: [
        {
          id: "1",
          key: "KEY-1",
          summary: "Test",
          status: "Open",
          assignee: null,
          created: null,
          updated: null,
        },
      ],
      total: 1,
    };
    expect(result.issues).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("allows empty issues array", () => {
    const result: ListJiraIssuesResult = { issues: [], total: 0 };
    expect(result.issues).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("JiraUser type shape", () => {
  it("shapes a valid Jira user", () => {
    const user: JiraUser = {
      displayName: "Alice Smith",
      emailAddress: "alice@example.com",
      accountId: "abc123def456",
      active: true,
      avatarUrls: {
        "48x48": "https://avatar.example.com/48",
        "24x24": "https://avatar.example.com/24",
      },
    };
    expect(user.displayName).toBe("Alice Smith");
    expect(user.active).toBe(true);
    expect(user.avatarUrls?.["48x48"]).toBeDefined();
  });

  it("allows null avatarUrls", () => {
    const user: JiraUser = {
      displayName: "Bob",
      emailAddress: null,
      accountId: "xyz789",
      active: false,
      avatarUrls: null,
    };
    expect(user.avatarUrls).toBeNull();
    expect(user.emailAddress).toBeNull();
  });
});

describe("ListJiraUsersResult shape", () => {
  it("holds users array", () => {
    const result: ListJiraUsersResult = {
      users: [
        {
          displayName: "User 1",
          emailAddress: "u1@example.com",
          accountId: "id1",
          active: true,
          avatarUrls: null,
        },
      ],
    };
    expect(result.users).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: JQL logic (mirroring jqlParts.join(" AND ") + ORDER BY)
// ---------------------------------------------------------------------------

describe("JQL construction", () => {
  function buildJql(accountId?: string, status?: string): string {
    const parts: string[] = [];
    if (accountId) parts.push(`assignee in (${accountId})`);
    if (status) parts.push(`status="${status}"`);
    parts.push("ORDER BY created DESC");
    return parts.join(" AND ");
  }

  it("includes only ORDER BY when no filters", () => {
    const jql = buildJql();
    expect(jql).toBe("ORDER BY created DESC");
  });

  it("includes assignee filter", () => {
    const jql = buildJql("5e1f6a2b3c4d");
    expect(jql).toContain("assignee in (5e1f6a2b3c4d)");
    expect(jql).toContain("ORDER BY created DESC");
  });

  it("includes status filter", () => {
    const jql = buildJql(undefined, "In Progress");
    expect(jql).toContain('status="In Progress"');
  });

  it("combines assignee and status with AND", () => {
    const jql = buildJql("abc123", "Done");
    expect(jql).toBe(
      'assignee in (abc123) AND status="Done" AND ORDER BY created DESC',
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: User filter logic (mirroring the active + atlassian filter)
// ---------------------------------------------------------------------------

describe("Jira user filtering", () => {
  function filterUsers(
    data: Array<{
      active?: boolean;
      accountType?: string;
    }>,
  ) {
    return data.filter(
      (u) =>
        u.active === true &&
        (u.accountType === "atlassian" || !u.accountType),
    );
  }

  it("keeps active atlassian users", () => {
    const result = filterUsers([
      { active: true, accountType: "atlassian" },
    ]);
    expect(result).toHaveLength(1);
  });

  it("keeps active users without accountType", () => {
    const result = filterUsers([{ active: true }]);
    expect(result).toHaveLength(1);
  });

  it("removes inactive users", () => {
    const result = filterUsers([
      { active: false, accountType: "atlassian" },
    ]);
    expect(result).toHaveLength(0);
  });

  it("removes non-atlassian users", () => {
    const result = filterUsers([
      { active: true, accountType: "customer" },
    ]);
    expect(result).toHaveLength(0);
  });

  it("removes inactive non-atlassian users", () => {
    const result = filterUsers([
      { active: false, accountType: "customer" },
    ]);
    expect(result).toHaveLength(0);
  });

  it("handles mixed list correctly", () => {
    const result = filterUsers([
      { active: true, accountType: "atlassian" },
      { active: false, accountType: "atlassian" },
      { active: true, accountType: "customer" },
      { active: true },
      { active: false },
    ]);
    expect(result).toHaveLength(2); // active atlassian + active no accountType
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("jiraIssueSchema", () => {
  it("parses a valid Jira issue", () => {
    const r = jiraIssueSchema.safeParse({
      id: "10001",
      key: "PROJ-42",
      summary: "Fix login bug",
      status: "In Progress",
      assignee: {
        displayName: "John Doe",
        emailAddress: "john@example.com",
      },
      created: "2026-01-15T10:00:00Z",
      updated: "2026-02-20T14:30:00Z",
    });
    expect(r.success).toBe(true);
  });

  it("allows null assignee", () => {
    const r = jiraIssueSchema.safeParse({
      id: "10002",
      key: "PROJ-43",
      summary: null,
      status: null,
      assignee: null,
      created: null,
      updated: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = jiraIssueSchema.safeParse({ key: "PROJ-42" });
    expect(r.success).toBe(false);
  });
});

describe("listJiraIssuesResultSchema", () => {
  it("parses a valid result with issues", () => {
    const r = listJiraIssuesResultSchema.safeParse({
      issues: [
        {
          id: "1",
          key: "KEY-1",
          summary: "Test",
          status: "Open",
          assignee: null,
          created: null,
          updated: null,
        },
      ],
      total: 1,
    });
    expect(r.success).toBe(true);
  });

  it("parses an empty result", () => {
    const r = listJiraIssuesResultSchema.safeParse({
      issues: [],
      total: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listJiraIssuesResultSchema.safeParse({
      issues: [],
      total: -1,
    });
    expect(r.success).toBe(false);
  });
});

describe("jiraUserSchema", () => {
  it("parses a valid Jira user", () => {
    const r = jiraUserSchema.safeParse({
      displayName: "Alice Smith",
      emailAddress: "alice@example.com",
      accountId: "abc123def456",
      active: true,
      avatarUrls: { "48x48": "https://avatar.example.com/48" },
    });
    expect(r.success).toBe(true);
  });

  it("allows null avatarUrls", () => {
    const r = jiraUserSchema.safeParse({
      displayName: "Bob",
      emailAddress: null,
      accountId: "xyz789",
      active: false,
      avatarUrls: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing displayName", () => {
    const r = jiraUserSchema.safeParse({
      accountId: "abc123",
      active: true,
    });
    expect(r.success).toBe(false);
  });
});

describe("listJiraUsersResultSchema", () => {
  it("parses a valid user list", () => {
    const r = listJiraUsersResultSchema.safeParse({
      users: [
        {
          displayName: "User 1",
          emailAddress: "u1@example.com",
          accountId: "id1",
          active: true,
          avatarUrls: null,
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("parses an empty user list", () => {
    const r = listJiraUsersResultSchema.safeParse({ users: [] });
    expect(r.success).toBe(true);
  });
});
