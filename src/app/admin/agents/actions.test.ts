import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock pg Pool — use vi.hoisted to avoid hoisting issues
// ---------------------------------------------------------------------------
const { mockConnect, mockQuery, mockRelease } = vi.hoisted(() => {
  const query = vi.fn();
  const release = vi.fn();
  const connect = vi.fn().mockResolvedValue({
    query,
    release,
  });
  return { mockConnect: connect, mockQuery: query, mockRelease: release };
});

vi.mock("pg", () => {
  class Pool {
    connect = mockConnect;
  }
  return { Pool };
});

import { getAllAgentsHealth } from "./actions";

// ---------------------------------------------------------------------------
// Helpers to build mock query return values
// ---------------------------------------------------------------------------
function mockAgentsResult(rows: Array<{ id: string; name: string; status: string; role: string }>) {
  return { rows };
}

function mockHeartbeatResult(total: number, succeeded: number, failed: number) {
  return { rows: [{ total, succeeded, failed }] };
}

function mockLastHeartbeatResult(
  row: { started_at: string; status: string } | null,
) {
  return { rows: row ? [row] : [] };
}

function mockCountResult(count: number) {
  return { rows: [{ count }] };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAllAgentsHealth", () => {
  it("returns health data for multiple agents", async () => {
    // Arrange: 3 agents
    mockQuery
      // First call: list agents
      .mockResolvedValueOnce(
        mockAgentsResult([
          { id: "agent-1", name: "Coder", status: "running", role: "general" },
          { id: "agent-2", name: "CTO", status: "running", role: "manager" },
          { id: "agent-3", name: "HR", status: "idle", role: "hr" },
        ]),
      )
      // Agent 1 heartbeat stats
      .mockResolvedValueOnce(mockHeartbeatResult(100, 85, 15))
      // Agent 1 last heartbeat
      .mockResolvedValueOnce(
        mockLastHeartbeatResult({ started_at: "2026-06-11T12:00:00Z", status: "succeeded" }),
      )
      // Agent 1 issues done
      .mockResolvedValueOnce(mockCountResult(12))
      // Agent 1 issues in progress
      .mockResolvedValueOnce(mockCountResult(5))
      // Agent 2 heartbeat stats
      .mockResolvedValueOnce(mockHeartbeatResult(50, 45, 5))
      // Agent 2 last heartbeat
      .mockResolvedValueOnce(
        mockLastHeartbeatResult({ started_at: "2026-06-11T11:30:00Z", status: "succeeded" }),
      )
      // Agent 2 issues done
      .mockResolvedValueOnce(mockCountResult(8))
      // Agent 2 issues in progress
      .mockResolvedValueOnce(mockCountResult(2))
      // Agent 3 heartbeat stats
      .mockResolvedValueOnce(mockHeartbeatResult(10, 2, 8))
      // Agent 3 last heartbeat
      .mockResolvedValueOnce(
        mockLastHeartbeatResult({ started_at: "2026-06-10T08:00:00Z", status: "failed" }),
      )
      // Agent 3 issues done
      .mockResolvedValueOnce(mockCountResult(1))
      // Agent 3 issues in progress
      .mockResolvedValueOnce(mockCountResult(0));

    // Act
    const result = await getAllAgentsHealth();

    // Assert
    expect(result.agents).toHaveLength(3);
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockRelease).toHaveBeenCalledTimes(1);

    // Agent 1: Coder (85% success -> Good)
    const coder = result.agents[0];
    expect(coder.id).toBe("agent-1");
    expect(coder.name).toBe("Coder");
    expect(coder.status).toBe("running");
    expect(coder.issuesDone).toBe(12);
    expect(coder.issuesInProgress).toBe(5);
    expect(coder.heartbeatMetrics[0]).toMatchObject({
      label: "Runs (24h)",
      value: expect.stringContaining("100"),
      note: expect.stringContaining("85 ok"),
    });
    expect(coder.heartbeatMetrics[1]).toMatchObject({
      label: "Success rate",
      value: "85%",
      note: "Good",
    });

    // Agent 2: CTO (90% -> Good)
    const cto = result.agents[1];
    expect(cto.name).toBe("CTO");
    expect(cto.heartbeatMetrics[1]).toMatchObject({
      label: "Success rate",
      value: "90%",
      note: "Good",
    });

    // Agent 3: HR (20% -> Critical)
    const hr = result.agents[2];
    expect(hr.name).toBe("HR");
    expect(hr.heartbeatMetrics[1]).toMatchObject({
      label: "Success rate",
      value: "20%",
      note: "Critical",
    });
  });

  it("handles empty agent list", async () => {
    mockQuery.mockResolvedValueOnce(mockAgentsResult([]));

    const result = await getAllAgentsHealth();

    expect(result.agents).toHaveLength(0);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });

  it("handles agent with zero heartbeat runs", async () => {
    mockQuery
      .mockResolvedValueOnce(
        mockAgentsResult([
          { id: "agent-new", name: "NewAgent", status: "running", role: "general" },
        ]),
      )
      // No heartbeat runs
      .mockResolvedValueOnce(mockHeartbeatResult(0, 0, 0))
      // No last heartbeat
      .mockResolvedValueOnce(mockLastHeartbeatResult(null))
      // No issues done
      .mockResolvedValueOnce(mockCountResult(0))
      // No issues in progress
      .mockResolvedValueOnce(mockCountResult(0));

    const result = await getAllAgentsHealth();

    expect(result.agents).toHaveLength(1);
    const agent = result.agents[0];
    expect(agent.lastHeartbeat).toBeNull();
    expect(agent.heartbeatMetrics[0]).toMatchObject({
      label: "Runs (24h)",
      value: "0",
    });
    expect(agent.heartbeatMetrics[1]).toMatchObject({
      label: "Success rate",
      value: "0%",
      note: "Critical",
    });
    expect(agent.heartbeatMetrics[2]).toMatchObject({
      label: "Issues done (7d)",
      value: "0",
    });
  });

  it("classifies degraded success rate correctly", async () => {
    mockQuery
      .mockResolvedValueOnce(
        mockAgentsResult([
          { id: "agent-d1", name: "DegradedAgent", status: "error", role: "general" },
        ]),
      )
      // 60% success rate
      .mockResolvedValueOnce(mockHeartbeatResult(10, 6, 4))
      .mockResolvedValueOnce(mockLastHeartbeatResult(null))
      .mockResolvedValueOnce(mockCountResult(0))
      .mockResolvedValueOnce(mockCountResult(0));

    const result = await getAllAgentsHealth();
    expect(result.agents[0].heartbeatMetrics[1]).toMatchObject({
      label: "Success rate",
      value: "60%",
      note: "Degraded",
    });
  });

  it("releases the client on error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB connection failed"));

    await expect(getAllAgentsHealth()).rejects.toThrow("DB connection failed");
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });
});
