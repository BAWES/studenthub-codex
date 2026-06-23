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
  const validMetric = { label: "CPU", value: "45%", note: "Normal load" };

  it("accepts valid input", () => {
    expect(agentHealthMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts empty note string", () => {
    expect(
      agentHealthMetricSchema.safeParse({ ...validMetric, note: "" }).success,
    ).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(agentHealthMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(
      agentHealthMetricSchema.safeParse({ ...validMetric, label: "" }).success,
    ).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(agentHealthMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty value", () => {
    expect(
      agentHealthMetricSchema.safeParse({ ...validMetric, value: "" }).success,
    ).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(agentHealthMetricSchema.safeParse({ label: 123, value: true, note: null }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// agentHealthDataSchema
// ---------------------------------------------------------------------------
describe("agentHealthDataSchema", () => {
  const validMetric = { label: "CPU", value: "45%", note: "Normal" };

  const validAgent = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "JiraBot",
    status: "healthy",
    role: "orchestrator",
    heartbeatMetrics: [validMetric],
    lastHeartbeat: "2025-01-01T00:00:00Z",
    issuesDone: 10,
    issuesInProgress: 2,
  };

  it("accepts valid input", () => {
    expect(agentHealthDataSchema.safeParse(validAgent).success).toBe(true);
  });

  it("accepts nullable lastHeartbeat", () => {
    expect(
      agentHealthDataSchema.safeParse({ ...validAgent, lastHeartbeat: null })
        .success,
    ).toBe(true);
  });

  it("accepts zero issues", () => {
    expect(
      agentHealthDataSchema.safeParse({
        ...validAgent,
        issuesDone: 0,
        issuesInProgress: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts empty heartbeatMetrics", () => {
    expect(
      agentHealthDataSchema.safeParse({ ...validAgent, heartbeatMetrics: [] })
        .success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validAgent;
    expect(agentHealthDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-uuid id", () => {
    expect(
      agentHealthDataSchema.safeParse({ ...validAgent, id: "not-a-uuid" })
        .success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      agentHealthDataSchema.safeParse({ ...validAgent, name: "" }).success,
    ).toBe(false);
  });

  it("rejects empty status", () => {
    expect(
      agentHealthDataSchema.safeParse({ ...validAgent, status: "" }).success,
    ).toBe(false);
  });

  it("rejects empty role", () => {
    expect(
      agentHealthDataSchema.safeParse({ ...validAgent, role: "" }).success,
    ).toBe(false);
  });

  it("rejects negative issuesDone", () => {
    expect(
      agentHealthDataSchema.safeParse({ ...validAgent, issuesDone: -1 })
        .success,
    ).toBe(false);
  });

  it("rejects negative issuesInProgress", () => {
    expect(
      agentHealthDataSchema.safeParse({ ...validAgent, issuesInProgress: -1 })
        .success,
    ).toBe(false);
  });

  it("rejects non-integer issuesDone", () => {
    expect(
      agentHealthDataSchema.safeParse({ ...validAgent, issuesDone: 1.5 })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// agentsHealthDataSchema
// ---------------------------------------------------------------------------
describe("agentsHealthDataSchema", () => {
  const validMetric = { label: "CPU", value: "45%", note: "" };
  const validAgent = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "JiraBot",
    status: "healthy",
    role: "orchestrator",
    heartbeatMetrics: [validMetric],
    lastHeartbeat: null,
    issuesDone: 5,
    issuesInProgress: 1,
  };

  it("accepts valid input with agents", () => {
    expect(
      agentsHealthDataSchema.safeParse({ agents: [validAgent] }).success,
    ).toBe(true);
  });

  it("accepts empty agents array", () => {
    expect(agentsHealthDataSchema.safeParse({ agents: [] }).success).toBe(true);
  });

  it("rejects missing agents", () => {
    expect(agentsHealthDataSchema.safeParse({}).success).toBe(false);
  });

  it("rejects agents as non-array", () => {
    expect(agentsHealthDataSchema.safeParse({ agents: "not-array" }).success).toBe(false);
  });
});
