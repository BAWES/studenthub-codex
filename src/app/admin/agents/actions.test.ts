import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// ---------------------------------------------------------------------------
// Mock pg.Pool before importing the module under test
// ---------------------------------------------------------------------------

const mockClient = {
  query: vi.fn(),
  release: vi.fn(),
};

const mockConnect = vi.fn().mockResolvedValue(mockClient);

vi.mock("pg", () => ({
  Pool: vi.fn(function MockPool() {
    return { connect: mockConnect };
  }),
}));

// Import AFTER mocks are hoisted
const { getAllAgentsHealth } = await import("./actions");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetMocks() {
  mockConnect.mockClear();
  mockClient.query.mockReset();
  mockClient.release.mockClear();
  mockConnect.mockResolvedValue(mockClient);
}

// Build a fake pg row for the agents list query
function agentRow(
  overrides: Partial<{ id: string; name: string; status: string; role: string }> = {},
) {
  return {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "TestAgent",
    status: "running",
    role: "developer",
    ...overrides,
  };
}

// Build a fake pg row for heartbeat_runs aggregation
function hbAggRow(
  overrides: Partial<{ total: number; succeeded: number; failed: number }> = {},
) {
  return { total: 10, succeeded: 8, failed: 2, ...overrides };
}

// Build a fake pg row for last heartbeat
function lastHbRow(
  overrides: Partial<{ started_at: string | Date; status: string }> = {},
) {
  return { started_at: "2026-06-10T12:00:00.000Z", status: "succeeded", ...overrides };
}

// Build a fake pg row for COUNT(*) queries
function countRow(count: number) {
  return { count };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getAllAgentsHealth", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("returns empty list when no active agents", async () => {
    // First call (agents query) returns empty
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    const result = await getAllAgentsHealth();
    expect(result.agents).toHaveLength(0);
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("returns health data for a single healthy agent", async () => {
    mockClient.query
      // agents list
      .mockResolvedValueOnce({
        rows: [agentRow({ id: "agt-001", name: "Alice", status: "running", role: "coder" })],
      })
      // heartbeat aggregation
      .mockResolvedValueOnce({ rows: [hbAggRow({ total: 20, succeeded: 18, failed: 2 })] })
      // last heartbeat
      .mockResolvedValueOnce({ rows: [lastHbRow()] })
      // issues done (7d)
      .mockResolvedValueOnce({ rows: [countRow(5)] })
      // issues in progress
      .mockResolvedValueOnce({ rows: [countRow(3)] });

    const result = await getAllAgentsHealth();
    expect(result.agents).toHaveLength(1);

    const alice = result.agents[0];
    expect(alice.name).toBe("Alice");
    expect(alice.status).toBe("running");
    expect(alice.role).toBe("coder");
    expect(alice.issuesDone).toBe(5);
    expect(alice.issuesInProgress).toBe(3);

    // Verify metrics
    expect(alice.heartbeatMetrics).toHaveLength(4);
    // Runs (24h)
    expect(alice.heartbeatMetrics[0]).toMatchObject({
      label: "Runs (24h)",
      value: "20",
    });
    // Success rate: 18/20 = 90% → "Good"
    expect(alice.heartbeatMetrics[1]).toMatchObject({
      label: "Success rate",
      value: "90%",
      note: "Good",
    });
    // Issues done
    expect(alice.heartbeatMetrics[2]).toMatchObject({
      label: "Issues done (7d)",
      value: "5",
    });
    // Open issues
    expect(alice.heartbeatMetrics[3]).toMatchObject({
      label: "Open issues",
      value: "3",
    });

    expect(mockClient.release).toHaveBeenCalled();
  });

  it("labels success rate as 'Degraded' for 50-79%", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [agentRow({ id: "agt-002", name: "Bob" })] })
      .mockResolvedValueOnce({ rows: [hbAggRow({ total: 10, succeeded: 6, failed: 4 })] }) // 60%
      .mockResolvedValueOnce({ rows: [lastHbRow()] })
      .mockResolvedValueOnce({ rows: [countRow(1)] })
      .mockResolvedValueOnce({ rows: [countRow(2)] });

    const result = await getAllAgentsHealth();
    const bob = result.agents[0];
    expect(bob.heartbeatMetrics[1]).toMatchObject({
      value: "60%",
      note: "Degraded",
    });
  });

  it("labels success rate as 'Critical' for <50%", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [agentRow({ id: "agt-003", name: "Charlie" })] })
      .mockResolvedValueOnce({ rows: [hbAggRow({ total: 10, succeeded: 3, failed: 7 })] }) // 30%
      .mockResolvedValueOnce({ rows: [lastHbRow()] })
      .mockResolvedValueOnce({ rows: [countRow(0)] })
      .mockResolvedValueOnce({ rows: [countRow(5)] });

    const result = await getAllAgentsHealth();
    const charlie = result.agents[0];
    expect(charlie.heartbeatMetrics[1]).toMatchObject({
      value: "30%",
      note: "Critical",
    });
  });

  it("handles edge case: zero runs → 0% with 'Critical' label", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [agentRow({ id: "agt-004", name: "Zero" })] })
      .mockResolvedValueOnce({ rows: [hbAggRow({ total: 0, succeeded: 0, failed: 0 })] })
      .mockResolvedValueOnce({ rows: [] }) // no last heartbeat
      .mockResolvedValueOnce({ rows: [countRow(0)] })
      .mockResolvedValueOnce({ rows: [countRow(0)] });

    const result = await getAllAgentsHealth();
    const zero = result.agents[0];
    expect(zero.heartbeatMetrics[0]).toMatchObject({ value: "0", note: "0 ok, 0 fail" });
    expect(zero.heartbeatMetrics[1]).toMatchObject({ value: "0%", note: "Critical" });
    expect(zero.lastHeartbeat).toBeNull();
  });

  it("handles edge case: no last heartbeat row", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [agentRow({ id: "agt-005", name: "Silent" })] })
      .mockResolvedValueOnce({ rows: [hbAggRow({ total: 5, succeeded: 5, failed: 0 })] })
      .mockResolvedValueOnce({ rows: [] }) // empty last heartbeat
      .mockResolvedValueOnce({ rows: [countRow(2)] })
      .mockResolvedValueOnce({ rows: [countRow(1)] });

    const result = await getAllAgentsHealth();
    const silent = result.agents[0];
    expect(silent.lastHeartbeat).toBeNull();
    expect(silent.heartbeatMetrics[1]).toMatchObject({ value: "100%", note: "Good" });
  });

  it("aggregates data for multiple agents", async () => {
    mockClient.query
      // agents list — 2 agents
      .mockResolvedValueOnce({
        rows: [
          agentRow({ id: "agt-01", name: "Alpha", status: "running" }),
          agentRow({ id: "agt-02", name: "Beta", status: "idle" }),
        ],
      })
      // Alpha: 100% success, 4 done, 2 in progress
      .mockResolvedValueOnce({ rows: [hbAggRow({ total: 10, succeeded: 10, failed: 0 })] })
      .mockResolvedValueOnce({ rows: [lastHbRow({ started_at: "2026-06-10T10:00:00Z" })] })
      .mockResolvedValueOnce({ rows: [countRow(4)] })
      .mockResolvedValueOnce({ rows: [countRow(2)] })
      // Beta: 50% success, 1 done, 0 in progress
      .mockResolvedValueOnce({ rows: [hbAggRow({ total: 6, succeeded: 3, failed: 3 })] })
      .mockResolvedValueOnce({ rows: [lastHbRow({ started_at: "2026-06-10T09:00:00Z", status: "failed" })] })
      .mockResolvedValueOnce({ rows: [countRow(1)] })
      .mockResolvedValueOnce({ rows: [countRow(0)] });

    const result = await getAllAgentsHealth();
    expect(result.agents).toHaveLength(2);

    // Alpha
    expect(result.agents[0].name).toBe("Alpha");
    expect(result.agents[0].issuesDone).toBe(4);
    expect(result.agents[0].issuesInProgress).toBe(2);
    expect(result.agents[0].heartbeatMetrics[1].value).toBe("100%");

    // Beta
    expect(result.agents[1].name).toBe("Beta");
    expect(result.agents[1].status).toBe("idle");
    expect(result.agents[1].issuesDone).toBe(1);
    expect(result.agents[1].issuesInProgress).toBe(0);
    expect(result.agents[1].heartbeatMetrics[1].value).toBe("50%");
    expect(result.agents[1].heartbeatMetrics[1].note).toBe("Degraded");
  });

  it("releases the client in all cases", async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] });
    await getAllAgentsHealth();
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests (TDD — verify interfaces still compile)
// ---------------------------------------------------------------------------

describe("AgentHealthMetric type", () => {
  it("accepts valid shape", () => {
    const m: import("./actions").AgentHealthMetric = {
      label: "Runs (24h)",
      value: "10",
      note: "8 ok, 2 fail",
    };
    expect(m.label).toBe("Runs (24h)");
  });
});

describe("AgentHealthData type", () => {
  it("accepts valid shape", () => {
    const d: import("./actions").AgentHealthData = {
      id: "agt-1",
      name: "Test",
      status: "running",
      role: "coder",
      heartbeatMetrics: [],
      lastHeartbeat: "Jun 10, 12:00 PM",
      issuesDone: 5,
      issuesInProgress: 3,
    };
    expect(d.name).toBe("Test");
  });

  it("accepts null lastHeartbeat", () => {
    const d: import("./actions").AgentHealthData = {
      id: "agt-2",
      name: "NoHb",
      status: "idle",
      role: "helper",
      heartbeatMetrics: [],
      lastHeartbeat: null,
      issuesDone: 0,
      issuesInProgress: 0,
    };
    expect(d.lastHeartbeat).toBeNull();
  });
});

describe("AgentsHealthData type", () => {
  it("wraps agents array", () => {
    const data: import("./actions").AgentsHealthData = {
      agents: [],
    };
    expect(data.agents).toHaveLength(0);
  });
});
