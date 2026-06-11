import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { agentHealthMetricSchema, agentHealthDataSchema, agentsHealthDataSchema } from "./schemas";
import type { AgentHealthMetric, AgentHealthData, AgentsHealthData } from "./schemas";

// ---------------------------------------------------------------------------
// Mock pg.Pool before importing the module under test
// ---------------------------------------------------------------------------
// vi.mock is hoisted, so use vi.hoisted to define vars visible to the factory.

const { mockClient, mockConnect } = vi.hoisted(() => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mockConnect = vi.fn().mockResolvedValue(mockClient);
  return { mockClient, mockConnect };
});

vi.mock("pg", () => ({
  Pool: vi.fn(function MockPool() {
    return { connect: mockConnect };
  }),
}));

import { getAllAgentsHealth } from "./actions";

// ---------------------------------------------------------------------------
// getAllAgentsHealth
// ---------------------------------------------------------------------------

describe("getAllAgentsHealth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty list when no active agents", async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    const result = await getAllAgentsHealth();
    expect(result.agents).toHaveLength(0);
  });

  it("returns health data for a single healthy agent", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [{ id: "550e8400-e29b-41d4-a716-446655440001", name: "Coder", status: "running", role: "software_engineer" }] })
      .mockResolvedValueOnce({ rows: [{ total: 10, succeeded: 8, failed: 2 }] })
      .mockResolvedValueOnce({ rows: [{ started_at: new Date().toISOString(), status: "succeeded" }] })
      .mockResolvedValueOnce({ rows: [{ count: 5 }] })
      .mockResolvedValueOnce({ rows: [{ count: 3 }] });

    const result = await getAllAgentsHealth();
    expect(result.agents).toHaveLength(1);
    const agent = result.agents[0];
    expect(agent.name).toBe("Coder");
    expect(agent.status).toBe("running");
    expect(agent.role).toBe("software_engineer");
    expect(agent.issuesDone).toBe(5);
    expect(agent.issuesInProgress).toBe(3);
    expect(agent.lastHeartbeat).toBeTruthy();
    expect(agent.heartbeatMetrics[0]).toMatchObject({ label: "Runs (24h)", value: "10" });
  });

  it("handles edge case: zero runs", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [{ id: "550e8400-e29b-41d4-a716-446655440004", name: "Zero", status: "idle", role: "test" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] });

    const result = await getAllAgentsHealth();
    expect(result.agents[0].heartbeatMetrics[0].value).toBe("0");
    expect(result.agents[0].lastHeartbeat).toBeNull();
  });

  it("releases the client", async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    await getAllAgentsHealth();
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation tests (Zod safeParse)
// ---------------------------------------------------------------------------

describe("agentHealthMetricSchema (output validation)", () => {
  it("accepts metric with all fields", () => {
    const r = agentHealthMetricSchema.safeParse({
      label: "Runs (24h)",
      value: "10",
      note: "8 ok, 2 fail",
    });
    expect(r.success).toBe(true);
  });

  it("rejects metric with empty label", () => {
    const r = agentHealthMetricSchema.safeParse({ label: "", value: "10" });
    expect(r.success).toBe(false);
  });

  it("rejects metric with missing label", () => {
    const r = agentHealthMetricSchema.safeParse({ value: "10" });
    expect(r.success).toBe(false);
  });
});

describe("agentHealthDataSchema (output validation)", () => {
  it("accepts valid agent data", () => {
    const r = agentHealthDataSchema.safeParse({
      id: "5212120e-df64-4246-aafc-943fdb411885",
      name: "Test Agent",
      status: "running",
      role: "coder",
      heartbeatMetrics: [{ label: "Runs (24h)", value: "10", note: "8 ok, 2 fail" }],
      lastHeartbeat: "Jun 10, 12:00 PM",
      issuesDone: 5,
      issuesInProgress: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts null lastHeartbeat", () => {
    const r = agentHealthDataSchema.safeParse({
      id: "f56ea475-d349-431c-9a40-3111f1a49819",
      name: "No Hb",
      status: "idle",
      role: "helper",
      heartbeatMetrics: [],
      lastHeartbeat: null,
      issuesDone: 0,
      issuesInProgress: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative issuesDone", () => {
    const r = agentHealthDataSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Neg",
      status: "error",
      role: "test",
      heartbeatMetrics: [],
      lastHeartbeat: null,
      issuesDone: -1,
      issuesInProgress: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty name", () => {
    const r = agentHealthDataSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440005",
      name: "",
      status: "running",
      role: "test",
      heartbeatMetrics: [],
      lastHeartbeat: null,
      issuesDone: 0,
      issuesInProgress: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe("agentsHealthDataSchema (output validation)", () => {
  it("accepts empty agents array", () => {
    const r = agentsHealthDataSchema.safeParse({ agents: [] });
    expect(r.success).toBe(true);
  });

  it("rejects invalid agent inside array", () => {
    const r = agentsHealthDataSchema.safeParse({
      agents: [{ id: "550e8400-e29b-41d4-a716-446655440001", name: "", status: "running", role: "test", heartbeatMetrics: [], lastHeartbeat: null, issuesDone: 0, issuesInProgress: 0 }],
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-object payload", () => {
    const r = agentsHealthDataSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});
