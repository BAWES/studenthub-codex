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
  const validMetric = { label: "Active Candidates", value: 42, note: "Last 30 days" };

  it("accepts a valid metric", () => {
    expect(dashboardMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts metric without note", () => {
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

  it("rejects non-integer value", () => {
    expect(dashboardMetricSchema.safeParse({ ...validMetric, value: 1.5 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// dashboardStatusItemSchema
// ---------------------------------------------------------------------------
describe("dashboardStatusItemSchema", () => {
  const validItem = { label: "Pending", value: 15 };

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
    expect(dashboardStatusItemSchema.safeParse({ ...validItem, value: -5 }).success).toBe(false);
  });

  it("rejects non-integer value", () => {
    expect(dashboardStatusItemSchema.safeParse({ ...validItem, value: 3.14 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// dashboardDataListItemSchema
// ---------------------------------------------------------------------------
describe("dashboardDataListItemSchema", () => {
  const validItem = {
    id: 42,
    title: "John Doe",
    subtitle: "Software Engineer",
    meta: "2024-06-01",
  };

  it("accepts a valid item with numeric id", () => {
    expect(dashboardDataListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts a valid item with string id", () => {
    expect(
      dashboardDataListItemSchema.safeParse({ ...validItem, id: "uuid-123" }).success,
    ).toBe(true);
  });

  it("accepts item with optional fields", () => {
    expect(
      dashboardDataListItemSchema.safeParse({
        ...validItem,
        amount: "$100",
        date: "2024-06-15",
        count: 3,
      }).success,
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

  it("rejects missing subtitle", () => {
    const { subtitle: _, ...rest } = validItem;
    expect(dashboardDataListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty subtitle", () => {
    expect(dashboardDataListItemSchema.safeParse({ ...validItem, subtitle: "" }).success).toBe(false);
  });

  it("rejects missing meta", () => {
    const { meta: _, ...rest } = validItem;
    expect(dashboardDataListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty meta", () => {
    expect(dashboardDataListItemSchema.safeParse({ ...validItem, meta: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// prMergeMetricSchema
// ---------------------------------------------------------------------------
describe("prMergeMetricSchema", () => {
  const validMetric = { label: "Avg Merge Time", value: "4.2h", note: "Last 30 days" };

  it("accepts a valid metric", () => {
    expect(prMergeMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts metric without note", () => {
    expect(prMergeMetricSchema.safeParse({ label: "Avg Time", value: "3h" }).success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(prMergeMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(prMergeMetricSchema.safeParse({ ...validMetric, label: "" }).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(prMergeMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty value", () => {
    expect(prMergeMetricSchema.safeParse({ ...validMetric, value: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// prMergeItemSchema
// ---------------------------------------------------------------------------
describe("prMergeItemSchema", () => {
  const validItem = { number: 123, title: "Fix login bug", hours: 4.5 };

  it("accepts a valid item", () => {
    expect(prMergeItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("rejects missing number", () => {
    const { number: _, ...rest } = validItem;
    expect(prMergeItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-positive number", () => {
    expect(prMergeItemSchema.safeParse({ ...validItem, number: 0 }).success).toBe(false);
    expect(prMergeItemSchema.safeParse({ ...validItem, number: -1 }).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validItem;
    expect(prMergeItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(prMergeItemSchema.safeParse({ ...validItem, title: "" }).success).toBe(false);
  });

  it("rejects missing hours", () => {
    const { hours: _, ...rest } = validItem;
    expect(prMergeItemSchema.safeParse(rest).success).toBe(false);
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
    metrics: [{ label: "Avg Merge Time", value: "4.2h", note: "Last 30 days" }],
    recent: [{ number: 123, title: "Fix login", hours: 3.5 }],
  };

  it("accepts a valid result", () => {
    expect(prMergeMetricsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      prMergeMetricsResultSchema.safeParse({ metrics: [], recent: [] }).success,
    ).toBe(true);
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
  const item = { id: 1, title: "Item", subtitle: "Sub", meta: "Meta" };
  const statusItem = { label: "Pending", value: 5 };
  const metricItem = { label: "Metric", value: 10, note: "Note" };
  const prMetric = { label: "Avg", value: "4h", note: "" };
  const prItem = { number: 1, title: "PR", hours: 2 };

  const validData = {
    metrics: [metricItem],
    statusMix: [statusItem],
    recentCandidates: [item],
    recentCompanies: [item],
    recentRequests: [item],
    recentTransfers: [item],
    prMergeMetrics: [prMetric],
    recentPrMergeTimes: [prItem],
  };

  it("accepts a valid dashboard data", () => {
    expect(dashboardDataSchema.safeParse(validData).success).toBe(true);
  });

  it("accepts empty arrays for all array fields", () => {
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
  const validMetric = { label: "Commits", value: "42", note: "This week" };

  it("accepts a valid metric", () => {
    expect(coderHealthMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(coderHealthMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(coderHealthMetricSchema.safeParse({ ...validMetric, label: "" }).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(coderHealthMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty value", () => {
    expect(coderHealthMetricSchema.safeParse({ ...validMetric, value: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// coderHealthCommitSchema
// ---------------------------------------------------------------------------
describe("coderHealthCommitSchema", () => {
  const validCommit = { sha: "abc123def456", message: "Fix auth bug", date: "2024-06-01" };

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

  it("rejects missing message", () => {
    const { message: _, ...rest } = validCommit;
    expect(coderHealthCommitSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(coderHealthCommitSchema.safeParse({ ...validCommit, message: "" }).success).toBe(false);
  });

  it("rejects missing date", () => {
    const { date: _, ...rest } = validCommit;
    expect(coderHealthCommitSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty date", () => {
    expect(coderHealthCommitSchema.safeParse({ ...validCommit, date: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// coderHealthIssueItemSchema
// ---------------------------------------------------------------------------
describe("coderHealthIssueItemSchema", () => {
  const validIssue = { title: "Login broken", status: "open", updatedAt: "2024-06-01" };

  it("accepts a valid issue", () => {
    expect(coderHealthIssueItemSchema.safeParse(validIssue).success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validIssue;
    expect(coderHealthIssueItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(coderHealthIssueItemSchema.safeParse({ ...validIssue, title: "" }).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validIssue;
    expect(coderHealthIssueItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty status", () => {
    expect(coderHealthIssueItemSchema.safeParse({ ...validIssue, status: "" }).success).toBe(false);
  });

  it("rejects missing updatedAt", () => {
    const { updatedAt: _, ...rest } = validIssue;
    expect(coderHealthIssueItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// coderHealthDataSchema
// ---------------------------------------------------------------------------
describe("coderHealthDataSchema", () => {
  const validData = {
    heartbeatMetrics: [{ label: "Commits", value: "42", note: "This week" }],
    recentIssues: [{ title: "Bug", status: "open", updatedAt: "2024-06-01" }],
    recentCommits: [{ sha: "abc123", message: "Fix", date: "2024-06-01" }],
    lastHeartbeat: "2024-06-01T12:00:00Z",
  };

  it("accepts a valid data", () => {
    expect(coderHealthDataSchema.safeParse(validData).success).toBe(true);
  });

  it("accepts null lastHeartbeat", () => {
    expect(
      coderHealthDataSchema.safeParse({ ...validData, lastHeartbeat: null }).success,
    ).toBe(true);
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
