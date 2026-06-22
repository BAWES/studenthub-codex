import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock pg Pool
const mockQuery = vi.fn();
const mockRelease = vi.fn();
const mockClient = { query: mockQuery, release: mockRelease };
const mockConnect = vi.fn().mockResolvedValue(mockClient);

vi.mock("pg", () => {
  class MockPool {
    connect = mockConnect;
  }
  return { Pool: MockPool };
});

const { getAgentById } = await import("../actions");

// ---------------------------------------------------------------------------
// admin/agents/[id] actions
// ---------------------------------------------------------------------------

describe("admin/agents/[id] getAgentById", () => {
  const VALID_UUID = "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95";
  const COMPANY_ID = "f56ea475-d349-431c-9a40-3111f1a49819";

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockClear();
    mockRelease.mockClear();
    mockQuery.mockClear();
  });

  const agentRow = {
    id: VALID_UUID,
    name: "Coder",
    role: "engineer",
    status: "running",
    title: "Software Engineer",
    icon: "code",
    last_heartbeat_at: "2026-06-14T06:16:44.948Z",
    created_at: "2026-06-10T07:24:59.542Z",
    updated_at: "2026-06-14T06:16:44.948Z",
    reports_to: "7a3f8065-de19-445f-a0e5-6c8166526350",
    pause_reason: null,
    paused_at: null,
  };

  const hbRow = { total: 10, succeeded: 8, failed: 2 };

  it("returns agent detail for a valid UUID", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [agentRow] })
      .mockResolvedValueOnce({ rows: [hbRow] })
      .mockResolvedValueOnce({ rows: [{ count: 5 }] })
      .mockResolvedValueOnce({ rows: [{ count: 2 }] })
      .mockResolvedValueOnce({ rows: [{ status: "succeeded", started_at: "2026-06-14T06:15:00.000Z", error: null }] });

    const result = await getAgentById({ agentId: VALID_UUID });

    expect(result.agent).not.toBeNull();
    expect(result.agent!.name).toBe("Coder");
    expect(result.agent!.status).toBe("running");
    expect(result.agent!.role).toBe("engineer");
    expect(result.agent!.heartbeatRuns24h).toBe(10);
    expect(result.agent!.heartbeatRunsSucceeded).toBe(8);
    expect(result.agent!.heartbeatRunsFailed).toBe(2);
    expect(result.agent!.heartbeatSuccessRate).toBe(80);
    expect(result.agent!.issuesDone7d).toBe(5);
    expect(result.agent!.issuesInProgress).toBe(2);
    expect(result.agent!.lastRunStatus).toBe("succeeded");
    expect(result.agent!.lastRunError).toBeNull();
    expect(result.agent!.reportsTo).toBe("7a3f8065-de19-445f-a0e5-6c8166526350");
  });

  it("returns null agent when UUID not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await getAgentById({ agentId: VALID_UUID });
    expect(result.agent).toBeNull();
  });

  it("throws error on invalid UUID input", async () => {
    await expect(getAgentById({ agentId: "not-a-uuid" })).rejects.toThrow();
  });

  it("handles zero heartbeat runs edge case", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [agentRow] })
      .mockResolvedValueOnce({ rows: [{ total: 0, succeeded: 0, failed: 0 }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await getAgentById({ agentId: VALID_UUID });
    expect(result.agent!.heartbeatRuns24h).toBe(0);
    expect(result.agent!.heartbeatSuccessRate).toBe(0);
    expect(result.agent!.lastRunStatus).toBeNull();
  });

  it("handles error-status agent with last run error", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ ...agentRow, status: "error", reports_to: null }],
      })
      .mockResolvedValueOnce({ rows: [{ total: 5, succeeded: 1, failed: 4 }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({
        rows: [{ status: "failed", started_at: "2026-06-13T22:00:00Z", error: "Adapter connection refused" }],
      });

    const result = await getAgentById({ agentId: VALID_UUID });
    expect(result.agent!.status).toBe("error");
    expect(result.agent!.heartbeatSuccessRate).toBe(20);
    expect(result.agent!.lastRunStatus).toBe("failed");
    expect(result.agent!.lastRunError).toBe("Adapter connection refused");
    expect(result.agent!.reportsTo).toBeNull();
  });

  it("releases the client after success", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [agentRow] })
      .mockResolvedValueOnce({ rows: [hbRow] })
      .mockResolvedValueOnce({ rows: [{ count: 3 }] })
      .mockResolvedValueOnce({ rows: [{ count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ status: "succeeded", started_at: new Date().toISOString(), error: null }] });

    await getAgentById({ agentId: VALID_UUID });
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it("releases the client when agent not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await getAgentById({ agentId: VALID_UUID });
    expect(mockRelease).toHaveBeenCalledOnce();
  });
});
