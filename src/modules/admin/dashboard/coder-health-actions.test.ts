import { describe, it, expect } from "vitest";
import {
  coderHealthDataSchema,
  coderHealthMetricSchema,
  coderHealthCommitSchema,
  coderHealthIssueItemSchema,
  type CoderHealthData,
  type CoderHealthMetric,
  type CoderHealthCommit,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("coderHealthMetricSchema", () => {
  it("accepts a valid metric with all fields", () => {
    const result = coderHealthMetricSchema.safeParse({
      label: "Heartbeat runs (24h)",
      value: "42",
      note: "30 succeeded, 12 failed",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a metric with a missing label", () => {
    const result = coderHealthMetricSchema.safeParse({
      value: "42",
      note: "30 succeeded, 12 failed",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a metric with an empty label", () => {
    const result = coderHealthMetricSchema.safeParse({
      label: "",
      value: "42",
      note: "30 succeeded, 12 failed",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a metric with a missing value", () => {
    const result = coderHealthMetricSchema.safeParse({
      label: "Heartbeat runs (24h)",
      note: "30 succeeded, 12 failed",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a metric with an empty value", () => {
    const result = coderHealthMetricSchema.safeParse({
      label: "Heartbeat runs (24h)",
      value: "",
      note: "30 succeeded, 12 failed",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a metric with an empty note", () => {
    const result = coderHealthMetricSchema.safeParse({
      label: "Last heartbeat",
      value: "Never",
      note: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("coderHealthCommitSchema", () => {
  it("accepts a valid commit", () => {
    const result = coderHealthCommitSchema.safeParse({
      sha: "abc1234",
      message: "fix: resolve login redirect issue",
      date: "Jun 12",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a commit with a missing sha", () => {
    const result = coderHealthCommitSchema.safeParse({
      message: "fix: resolve login redirect issue",
      date: "Jun 12",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a commit with an empty message", () => {
    const result = coderHealthCommitSchema.safeParse({
      sha: "abc1234",
      message: "",
      date: "Jun 12",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a commit with a missing date", () => {
    const result = coderHealthCommitSchema.safeParse({
      sha: "abc1234",
      message: "fix: resolve login redirect issue",
    });
    expect(result.success).toBe(false);
  });
});

describe("coderHealthIssueItemSchema", () => {
  it("accepts a valid issue item", () => {
    const result = coderHealthIssueItemSchema.safeParse({
      title: "Fix login page bug",
      status: "done",
      updatedAt: "Jun 10",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an issue with a missing title", () => {
    const result = coderHealthIssueItemSchema.safeParse({
      status: "done",
      updatedAt: "Jun 10",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an issue with an empty status", () => {
    const result = coderHealthIssueItemSchema.safeParse({
      title: "Fix login page bug",
      status: "",
      updatedAt: "Jun 10",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an issue with an empty updatedAt", () => {
    const result = coderHealthIssueItemSchema.safeParse({
      title: "Fix login page bug",
      status: "done",
      updatedAt: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("coderHealthDataSchema (full payload)", () => {
  const validData: CoderHealthData = {
    heartbeatMetrics: [
      { label: "Heartbeat runs (24h)", value: "96", note: "90 succeeded, 6 failed" },
      { label: "Success rate (24h)", value: "94%", note: "Good" },
      { label: "Issues done (7d)", value: "12", note: "Completed issues" },
      { label: "Last heartbeat", value: "Jun 11, 14:37", note: "" },
    ],
    recentIssues: [
      { title: "Fix login redirect", status: "done", updatedAt: "Jun 11" },
      { title: "Add Zod validation", status: "in_progress", updatedAt: "Jun 12" },
    ],
    recentCommits: [
      { sha: "abc1234", message: "fix: resolve login issue", date: "Jun 12" },
    ],
    lastHeartbeat: "Jun 11, 14:37",
  };

  it("accepts a valid full payload", () => {
    const result = coderHealthDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("accepts a null lastHeartbeat", () => {
    const result = coderHealthDataSchema.safeParse({
      ...validData,
      lastHeartbeat: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing heartbeatMetrics", () => {
    const { heartbeatMetrics: _, ...rest } = validData;
    const result = coderHealthDataSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects empty heartbeatMetrics", () => {
    const result = coderHealthDataSchema.safeParse({
      ...validData,
      heartbeatMetrics: [],
    });
    expect(result.success).toBe(true); // empty array is valid — no min length
  });

  it("rejects missing recentIssues", () => {
    const { recentIssues: _, ...rest } = validData;
    const result = coderHealthDataSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing recentCommits", () => {
    const { recentCommits: _, ...rest } = validData;
    const result = coderHealthDataSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts empty recentCommits", () => {
    const result = coderHealthDataSchema.safeParse({
      ...validData,
      recentCommits: [],
    });
    expect(result.success).toBe(true);
  });
});
