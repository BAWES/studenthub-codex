import { describe, it, expect } from "vitest";
import {
  agentHealthMetricSchema,
  agentHealthDataSchema,
  agentsHealthDataSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// agentHealthMetricSchema
// ---------------------------------------------------------------------------
describe("agentHealthMetricSchema", () => {
  const validMetric = { label: "Uptime", value: "99.9%", note: "Last 24h" };

  it("accepts a valid metric", () => {
    expect(agentHealthMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts empty note", () => {
    expect(agentHealthMetricSchema.safeParse({ ...validMetric, note: "" }).success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(agentHealthMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(agentHealthMetricSchema.safeParse({ ...validMetric, label: "" }).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(agentHealthMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty value", () => {
    expect(agentHealthMetricSchema.safeParse({ ...validMetric, value: "" }).success).toBe(false);
  });

  it("rejects wrong type for value", () => {
    expect(agentHealthMetricSchema.safeParse({ ...validMetric, value: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// agentHealthDataSchema
// ---------------------------------------------------------------------------
describe("agentHealthDataSchema", () => {
  const validAgent = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Code Review Agent",
    status: "healthy",
    role: "reviewer",
    heartbeatMetrics: [{ label: "CPU", value: "45%", note: "" }],
    lastHeartbeat: "2026-06-15T10:00:00Z",
    issuesDone: 42,
    issuesInProgress: 3,
  };

  it("accepts a valid agent health data", () => {
    expect(agentHealthDataSchema.safeParse(validAgent).success).toBe(true);
  });

  it("accepts null lastHeartbeat", () => {
    expect(agentHealthDataSchema.safeParse({ ...validAgent, lastHeartbeat: null }).success).toBe(true);
  });

  it("accepts zero counts", () => {
    expect(
      agentHealthDataSchema.safeParse({ ...validAgent, issuesDone: 0, issuesInProgress: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validAgent;
    expect(agentHealthDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid uuid", () => {
    expect(agentHealthDataSchema.safeParse({ ...validAgent, id: "not-a-uuid" }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(agentHealthDataSchema.safeParse({ ...validAgent, name: "" }).success).toBe(false);
  });

  it("rejects negative issuesDone", () => {
    expect(agentHealthDataSchema.safeParse({ ...validAgent, issuesDone: -1 }).success).toBe(false);
  });

  it("rejects negative issuesInProgress", () => {
    expect(agentHealthDataSchema.safeParse({ ...validAgent, issuesInProgress: -1 }).success).toBe(false);
  });

  it("rejects wrong type for lastHeartbeat", () => {
    expect(agentHealthDataSchema.safeParse({ ...validAgent, lastHeartbeat: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// agentsHealthDataSchema
// ---------------------------------------------------------------------------
describe("agentsHealthDataSchema", () => {
  const validResponse = {
    agents: [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Reviewer",
        status: "healthy",
        role: "reviewer",
        heartbeatMetrics: [],
        lastHeartbeat: null,
        issuesDone: 10,
        issuesInProgress: 2,
      },
    ],
  };

  it("accepts a valid agents health data", () => {
    expect(agentsHealthDataSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts empty agents array", () => {
    expect(agentsHealthDataSchema.safeParse({ agents: [] }).success).toBe(true);
  });

  it("rejects missing agents", () => {
    expect(agentsHealthDataSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid agent in array", () => {
    expect(agentsHealthDataSchema.safeParse({ agents: [{ id: "bad" }] }).success).toBe(false);
  });
});
