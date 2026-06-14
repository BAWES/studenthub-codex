import { describe, it, expect } from "vitest";
import {
  agentHealthMetricSchema,
  agentHealthDataSchema,
  agentsHealthDataSchema,
  getAgentByIdSchema,
  agentDetailSchema,
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

// ---------------------------------------------------------------------------
// getAgentByIdSchema
// ---------------------------------------------------------------------------
describe("getAgentByIdSchema", () => {
  const validUuid = "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95";

  it("accepts a valid UUID", () => {
    expect(getAgentByIdSchema.safeParse({ agentId: validUuid }).success).toBe(true);
  });

  it("rejects non-UUID string", () => {
    expect(getAgentByIdSchema.safeParse({ agentId: "not-a-uuid" }).success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(getAgentByIdSchema.safeParse({ agentId: "" }).success).toBe(false);
  });

  it("rejects missing agentId", () => {
    expect(getAgentByIdSchema.safeParse({}).success).toBe(false);
  });

  it("rejects number input", () => {
    expect(getAgentByIdSchema.safeParse({ agentId: 42 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// agentDetailSchema
// ---------------------------------------------------------------------------
describe("agentDetailSchema", () => {
  const validAgent = {
    agent: {
      id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95",
      name: "Coder",
      role: "general",
      status: "running",
      title: null,
      icon: null,
      lastHeartbeatAt: "2026-06-14T06:16:44.948Z",
      createdAt: "2026-06-10T07:24:59.542Z",
      updatedAt: "2026-06-14T06:16:44.948Z",
      reportsTo: null,
      pauseReason: null,
      pausedAt: null,
      heartbeatRuns24h: 5,
      heartbeatRunsSucceeded: 4,
      heartbeatRunsFailed: 1,
      heartbeatSuccessRate: 80,
      issuesDone7d: 3,
      issuesInProgress: 5,
      lastRunStatus: "succeeded",
      lastRunStartedAt: "2026-06-14T06:15:00.000Z",
      lastRunError: null,
    },
  };

  it("accepts a valid agent detail", () => {
    expect(agentDetailSchema.safeParse(validAgent).success).toBe(true);
  });

  it("accepts null agent (not found)", () => {
    expect(agentDetailSchema.safeParse({ agent: null }).success).toBe(true);
  });

  it("accepts all fields as strings with icon and title", () => {
    const rich = {
      agent: {
        ...validAgent.agent,
        title: "Software Engineer",
        icon: "code",
        reportsTo: "7a3f8065-de19-445f-a0e5-6c8166526350",
        pauseReason: "Maintenance",
        pausedAt: "2026-06-13T12:00:00.000Z",
        lastRunError: "Timeout error",
      },
    };
    expect(agentDetailSchema.safeParse(rich).success).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validAgent.agent;
    expect(agentDetailSchema.safeParse({ agent: rest }).success).toBe(false);
  });

  it("rejects negative heartbeatRuns24h", () => {
    expect(
      agentDetailSchema.safeParse({
        agent: { ...validAgent.agent, heartbeatRuns24h: -1 },
      }).success,
    ).toBe(false);
  });

  it("rejects successRate over 100", () => {
    expect(
      agentDetailSchema.safeParse({
        agent: { ...validAgent.agent, heartbeatSuccessRate: 101 },
      }).success,
    ).toBe(false);
  });

  it("rejects successRate under 0", () => {
    expect(
      agentDetailSchema.safeParse({
        agent: { ...validAgent.agent, heartbeatSuccessRate: -5 },
      }).success,
    ).toBe(false);
  });

  it("rejects non-UUID id", () => {
    expect(
      agentDetailSchema.safeParse({
        agent: { ...validAgent.agent, id: "not-a-uuid" },
      }).success,
    ).toBe(false);
  });
});
