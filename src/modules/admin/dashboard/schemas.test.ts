import { describe, it, expect } from "vitest";
import {
  dashboardMetricSchema,
  dashboardStatusItemSchema,
  dashboardDataListItemSchema,
  prMergeMetricSchema,
  prMergeItemSchema,
  prMergeMetricsResultSchema,
  dashboardDataSchema,
  coderHealthMetricSchema,
  coderHealthCommitSchema,
  coderHealthIssueItemSchema,
  coderHealthDataSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// dashboardMetricSchema
// ---------------------------------------------------------------------------
describe("dashboardMetricSchema", () => {
  const validMetric = { label: "Active Candidates", value: 42, note: "This month" };

  it("accepts a valid metric", () => {
    expect(dashboardMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts optional note default", () => {
    expect(dashboardMetricSchema.safeParse({ label: "Candidates", value: 10 }).success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(dashboardMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(dashboardMetricSchema.safeParse({ ...validMetric, label: "" }).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(dashboardMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative value", () => {
    expect(dashboardMetricSchema.safeParse({ ...validMetric, value: -1 }).success).toBe(false);
  });

  it("rejects wrong type for value", () => {
    expect(dashboardMetricSchema.safeParse({ ...validMetric, value: "42" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// dashboardStatusItemSchema
// ---------------------------------------------------------------------------
describe("dashboardStatusItemSchema", () => {
  const validItem = { label: "Active", value: 25 };

  it("accepts a valid status item", () => {
    expect(dashboardStatusItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validItem;
    expect(dashboardStatusItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(dashboardStatusItemSchema.safeParse({ ...validItem, label: "" }).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validItem;
    expect(dashboardStatusItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative value", () => {
    expect(dashboardStatusItemSchema.safeParse({ ...validItem, value: -1 }).success).toBe(false);
  });

  it("rejects wrong type for value", () => {
    expect(dashboardStatusItemSchema.safeParse({ ...validItem, value: "25" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// dashboardDataListItemSchema
// ---------------------------------------------------------------------------
describe("dashboardDataListItemSchema", () => {
  const validItem = {
    id: 1,
    title: "Alice Smith",
    subtitle: "New candidate",
    meta: "Just registered",
  };

  it("accepts a valid data list item (number id)", () => {
    expect(dashboardDataListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts a valid data list item (string id)", () => {
    expect(
      dashboardDataListItemSchema.safeParse({ ...validItem, id: "req-123" }).success,
    ).toBe(true);
  });

  it("accepts optional fields", () => {
    expect(
      dashboardDataListItemSchema.safeParse({ ...validItem, amount: "$500", date: "2026-06-15", count: 3 }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validItem;
    expect(dashboardDataListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validItem;
    expect(dashboardDataListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(dashboardDataListItemSchema.safeParse({ ...validItem, title: "" }).success).toBe(false);
  });

  it("rejects empty subtitle", () => {
    expect(dashboardDataListItemSchema.safeParse({ ...validItem, subtitle: "" }).success).toBe(false);
  });

  it("rejects empty meta", () => {
    expect(dashboardDataListItemSchema.safeParse({ ...validItem, meta: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// prMergeMetricSchema
// ---------------------------------------------------------------------------
describe("prMergeMetricSchema", () => {
  const validMetric = { label: "Avg Time", value: "2.5h", note: "Last 30 days" };

  it("accepts a valid metric", () => {
    expect(prMergeMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts optional note default", () => {
    expect(prMergeMetricSchema.safeParse({ label: "Median", value: "1.2h" }).success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(prMergeMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(prMergeMetricSchema.safeParse({ ...validMetric, label: "" }).success).toBe(false);
  });

  it("rejects empty value", () => {
    expect(prMergeMetricSchema.safeParse({ ...validMetric, value: "" }).success).toBe(false);
  });

  it("rejects wrong type for value", () => {
    expect(prMergeMetricSchema.safeParse({ ...validMetric, value: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// prMergeItemSchema
// ---------------------------------------------------------------------------
describe("prMergeItemSchema", () => {
  const validItem = { number: 42, title: "Fix login bug", hours: 3.5 };

  it("accepts a valid PR merge item", () => {
    expect(prMergeItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts zero hours", () => {
    expect(prMergeItemSchema.safeParse({ ...validItem, hours: 0 }).success).toBe(true);
  });

  it("rejects missing number", () => {
    const { number: _, ...rest } = validItem;
    expect(prMergeItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects zero number", () => {
    expect(prMergeItemSchema.safeParse({ ...validItem, number: 0 }).success).toBe(false);
  });

  it("rejects negative number", () => {
    expect(prMergeItemSchema.safeParse({ ...validItem, number: -1 }).success).toBe(false);
  });

  it("rejects wrong type for number", () => {
    expect(prMergeItemSchema.safeParse({ ...validItem, number: "abc" }).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(prMergeItemSchema.safeParse({ ...validItem, title: "" }).success).toBe(false);
  });

  it("rejects negative hours", () => {
    expect(prMergeItemSchema.safeParse({ ...validItem, hours: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// prMergeMetricsResultSchema
// ---------------------------------------------------------------------------
describe("prMergeMetricsResultSchema", () => {
  const validResult = {
    metrics: [{ label: "Avg", value: "2.5h", note: "" }],
    recent: [{ number: 42, title: "Fix", hours: 1.5 }],
  };

  it("accepts a valid result", () => {
    expect(prMergeMetricsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(prMergeMetricsResultSchema.safeParse({ metrics: [], recent: [] }).success).toBe(true);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validResult;
    expect(prMergeMetricsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing recent", () => {
    const { recent: _, ...rest } = validResult;
    expect(prMergeMetricsResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// dashboardDataSchema
// ---------------------------------------------------------------------------
describe("dashboardDataSchema", () => {
  const validData = {
    metrics: [{ label: "Candidates", value: 42, note: "" }],
    statusMix: [{ label: "Active", value: 25 }],
    recentCandidates: [{ id: 1, title: "Alice", subtitle: "New", meta: "2026-06" }],
    recentCompanies: [{ id: 1, title: "Acme", subtitle: "Approved", meta: "2026-06" }],
    recentRequests: [{ id: "r-1", title: "Hire", subtitle: "Pending", meta: "2026-06" }],
    recentTransfers: [{ id: 1, title: "Transfer", subtitle: "Done", meta: "2026-06" }],
    prMergeMetrics: [{ label: "Avg", value: "2h", note: "" }],
    recentPrMergeTimes: [{ number: 1, title: "Fix", hours: 1 }],
  };

  it("accepts a valid dashboard data", () => {
    expect(dashboardDataSchema.safeParse(validData).success).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      dashboardDataSchema.safeParse({
        metrics: [],
        statusMix: [],
        recentCandidates: [],
        recentCompanies: [],
        recentRequests: [],
        recentTransfers: [],
        prMergeMetrics: [],
        recentPrMergeTimes: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validData;
    expect(dashboardDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing statusMix", () => {
    const { statusMix: _, ...rest } = validData;
    expect(dashboardDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing recentCandidates", () => {
    const { recentCandidates: _, ...rest } = validData;
    expect(dashboardDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing recentCompanies", () => {
    const { recentCompanies: _, ...rest } = validData;
    expect(dashboardDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing recentRequests", () => {
    const { recentRequests: _, ...rest } = validData;
    expect(dashboardDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing recentTransfers", () => {
    const { recentTransfers: _, ...rest } = validData;
    expect(dashboardDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing prMergeMetrics", () => {
    const { prMergeMetrics: _, ...rest } = validData;
    expect(dashboardDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing recentPrMergeTimes", () => {
    const { recentPrMergeTimes: _, ...rest } = validData;
    expect(dashboardDataSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// coderHealthMetricSchema
// ---------------------------------------------------------------------------
describe("coderHealthMetricSchema", () => {
  const validMetric = { label: "PRs Merged", value: "15", note: "This sprint" };

  it("accepts a valid metric", () => {
    expect(coderHealthMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts empty note", () => {
    expect(coderHealthMetricSchema.safeParse({ ...validMetric, note: "" }).success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(coderHealthMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(coderHealthMetricSchema.safeParse({ ...validMetric, label: "" }).success).toBe(false);
  });

  it("rejects empty value", () => {
    expect(coderHealthMetricSchema.safeParse({ ...validMetric, value: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// coderHealthCommitSchema
// ---------------------------------------------------------------------------
describe("coderHealthCommitSchema", () => {
  const validCommit = { sha: "abc123def456", message: "Fix login bug", date: "2026-06-15" };

  it("accepts a valid commit", () => {
    expect(coderHealthCommitSchema.safeParse(validCommit).success).toBe(true);
  });

  it("rejects missing sha", () => {
    const { sha: _, ...rest } = validCommit;
    expect(coderHealthCommitSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty sha", () => {
    expect(coderHealthCommitSchema.safeParse({ ...validCommit, sha: "" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(coderHealthCommitSchema.safeParse({ ...validCommit, message: "" }).success).toBe(false);
  });

  it("rejects empty date", () => {
    expect(coderHealthCommitSchema.safeParse({ ...validCommit, date: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// coderHealthIssueItemSchema
// ---------------------------------------------------------------------------
describe("coderHealthIssueItemSchema", () => {
  const validIssue = { title: "Fix API bug", status: "open", updatedAt: "2026-06-15" };

  it("accepts a valid issue", () => {
    expect(coderHealthIssueItemSchema.safeParse(validIssue).success).toBe(true);
  });

  it("accepts empty updatedAt", () => {
    expect(coderHealthIssueItemSchema.safeParse({ ...validIssue, updatedAt: "" }).success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validIssue;
    expect(coderHealthIssueItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(coderHealthIssueItemSchema.safeParse({ ...validIssue, title: "" }).success).toBe(false);
  });

  it("rejects empty status", () => {
    expect(coderHealthIssueItemSchema.safeParse({ ...validIssue, status: "" }).success).toBe(false);
  });

  it("rejects wrong type for updatedAt", () => {
    expect(coderHealthIssueItemSchema.safeParse({ ...validIssue, updatedAt: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// coderHealthDataSchema
// ---------------------------------------------------------------------------
describe("coderHealthDataSchema", () => {
  const validData = {
    heartbeatMetrics: [{ label: "CPU", value: "45%", note: "" }],
    recentIssues: [{ title: "Bug", status: "open", updatedAt: "2026-06-15" }],
    recentCommits: [{ sha: "abc123", message: "Fix", date: "2026-06-15" }],
    lastHeartbeat: "2026-06-15T10:00:00Z",
  };

  it("accepts a valid coder health data", () => {
    expect(coderHealthDataSchema.safeParse(validData).success).toBe(true);
  });

  it("accepts null lastHeartbeat", () => {
    expect(coderHealthDataSchema.safeParse({ ...validData, lastHeartbeat: null }).success).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      coderHealthDataSchema.safeParse({
        heartbeatMetrics: [],
        recentIssues: [],
        recentCommits: [],
        lastHeartbeat: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing heartbeatMetrics", () => {
    const { heartbeatMetrics: _, ...rest } = validData;
    expect(coderHealthDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing recentIssues", () => {
    const { recentIssues: _, ...rest } = validData;
    expect(coderHealthDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing recentCommits", () => {
    const { recentCommits: _, ...rest } = validData;
    expect(coderHealthDataSchema.safeParse(rest).success).toBe(false);
  });
});
