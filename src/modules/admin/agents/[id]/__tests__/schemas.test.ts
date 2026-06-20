import { describe, it, expect } from "vitest";
import {
  getAgentByIdSchema,
  agentDetailSchema,
} from "../schemas";

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
