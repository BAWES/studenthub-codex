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

const { getAllAgentsHealth } = await import("../actions");

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
});
