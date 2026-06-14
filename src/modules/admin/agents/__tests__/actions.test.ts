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

const { getAllAgentsHealth, getAgentById } = await import("../actions");

// ---------------------------------------------------------------------------
// admin/agents actions
// ---------------------------------------------------------------------------

describe("admin/agents actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockClear();
    mockRelease.mockClear();
    mockQuery.mockClear();
  });

  describe("getAllAgentsHealth", () => {
    it("returns agent health data for multiple agents", async () => {
      mockQuery
        // First call: agents list
        .mockResolvedValueOnce({
          rows: [
            { id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95", name: "Coder", status: "running", role: "engineer" },
            { id: "b92c6482-09a8-426e-9b7f-39ff420e44eb", name: "HR", status: "idle", role: "hr" },
          ],
        })
        // Second call: Coder heartbeat runs
        .mockResolvedValueOnce({
          rows: [{ total: 10, succeeded: 8, failed: 2 }],
        })
        // Third call: Coder last heartbeat
        .mockResolvedValueOnce({
          rows: [{ started_at: "2026-06-13T10:00:00Z", status: "succeeded" }],
        })
        // Fourth call: Coder issues done (7d)
        .mockResolvedValueOnce({
          rows: [{ count: 5 }],
        })
        // Fifth call: Coder issues in progress
        .mockResolvedValueOnce({
          rows: [{ count: 2 }],
        })
        // Sixth call: HR heartbeat runs
        .mockResolvedValueOnce({
          rows: [{ total: 20, succeeded: 18, failed: 2 }],
        })
        // Seventh call: HR last heartbeat
        .mockResolvedValueOnce({
          rows: [{ started_at: "2026-06-13T09:00:00Z", status: "succeeded" }],
        })
        // Eighth call: HR issues done (7d)
        .mockResolvedValueOnce({
          rows: [{ count: 3 }],
        })
        // Ninth call: HR issues in progress
        .mockResolvedValueOnce({
          rows: [{ count: 1 }],
        });

      const result = await getAllAgentsHealth();

      expect(result.agents).toHaveLength(2);

      // Coder
      expect(result.agents[0].name).toBe("Coder");
      expect(result.agents[0].status).toBe("running");
      expect(result.agents[0].role).toBe("engineer");
      expect(result.agents[0].issuesDone).toBe(5);
      expect(result.agents[0].issuesInProgress).toBe(2);
      expect(result.agents[0].heartbeatMetrics).toHaveLength(4);

      // HR
      expect(result.agents[1].name).toBe("HR");
      expect(result.agents[1].status).toBe("idle");
      expect(result.agents[1].heartbeatMetrics).toHaveLength(4);
    });

    it("computes success rate correctly", async () => {
      mockQuery
        // Agents: one agent
        .mockResolvedValueOnce({
          rows: [
            { id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95", name: "Coder", status: "running", role: "engineer" },
          ],
        })
        // Heartbeat runs: 4/5 succeeded = 80%
        .mockResolvedValueOnce({
          rows: [{ total: 5, succeeded: 4, failed: 1 }],
        })
        // Last heartbeat
        .mockResolvedValueOnce({
          rows: [{ started_at: "2026-06-13T10:00:00Z", status: "succeeded" }],
        })
        // Issues done
        .mockResolvedValueOnce({
          rows: [{ count: 5 }],
        })
        // Issues in progress
        .mockResolvedValueOnce({
          rows: [{ count: 1 }],
        });

      const result = await getAllAgentsHealth();
      const metrics = result.agents[0].heartbeatMetrics;

      const successMetric = metrics.find((m) => m.label === "Success rate");
      expect(successMetric).toBeDefined();
      expect(successMetric?.value).toBe("80%");
      expect(successMetric?.note).toBe("Good");
    });

    it("marks degraded success rate (50-79%)", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [
            { id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95", name: "Coder", status: "running", role: "engineer" },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ total: 10, succeeded: 6, failed: 4 }],
        })
        .mockResolvedValueOnce({
          rows: [{ started_at: "2026-06-13T10:00:00Z", status: "succeeded" }],
        })
        .mockResolvedValueOnce({
          rows: [{ count: 2 }],
        })
        .mockResolvedValueOnce({
          rows: [{ count: 1 }],
        });

      const result = await getAllAgentsHealth();
      const metrics = result.agents[0].heartbeatMetrics;

      const successMetric = metrics.find((m) => m.label === "Success rate");
      expect(successMetric?.value).toBe("60%");
      expect(successMetric?.note).toBe("Degraded");
    });

    it("marks critical success rate (< 50%)", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [
            { id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95", name: "Coder", status: "running", role: "engineer" },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ total: 10, succeeded: 3, failed: 7 }],
        })
        .mockResolvedValueOnce({
          rows: [{ started_at: "2026-06-13T10:00:00Z", status: "succeeded" }],
        })
        .mockResolvedValueOnce({
          rows: [{ count: 1 }],
        })
        .mockResolvedValueOnce({
          rows: [{ count: 0 }],
        });

      const result = await getAllAgentsHealth();
      const metrics = result.agents[0].heartbeatMetrics;

      const successMetric = metrics.find((m) => m.label === "Success rate");
      expect(successMetric?.value).toBe("30%");
      expect(successMetric?.note).toBe("Critical");
    });

    it("returns empty array when no active agents", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [],
        });

      const result = await getAllAgentsHealth();
      expect(result.agents).toHaveLength(0);
    });

    it("handles null last heartbeat gracefully", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [
            { id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95", name: "Coder", status: "idle", role: "engineer" },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ total: 0, succeeded: 0, failed: 0 }],
        })
        // No last heartbeat
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          rows: [{ count: 0 }],
        })
        .mockResolvedValueOnce({
          rows: [{ count: 0 }],
        });

      const result = await getAllAgentsHealth();
      expect(result.agents[0].lastHeartbeat).toBeNull();
      expect(result.agents[0].heartbeatMetrics[0].value).toBe("0");
    });

    it("releases the client in finally block", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] });

      await getAllAgentsHealth();

      expect(mockConnect).toHaveBeenCalledOnce();
      expect(mockRelease).toHaveBeenCalledOnce();
    });
  });

  describe("getAgentById", () => {
    const VALID_UUID = "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95";
    const COMPANY_ID = "f56ea475-d349-431c-9a40-3111f1a49819";

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
        // Agent query
        .mockResolvedValueOnce({ rows: [agentRow] })
        // Heartbeat runs
        .mockResolvedValueOnce({ rows: [hbRow] })
        // Issues done (7d)
        .mockResolvedValueOnce({ rows: [{ count: 5 }] })
        // Issues in progress
        .mockResolvedValueOnce({ rows: [{ count: 2 }] })
        // Last run
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
      mockQuery
        .mockResolvedValueOnce({ rows: [] });

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
        // No last run
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
});
