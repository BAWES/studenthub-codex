import { describe, it, expect } from "vitest";
import {
  agentHealthMetricSchema,
  agentHealthDataSchema,
  agentsHealthDataSchema,
  getAgentByIdSchema,
} from "./schemas";

/**
 * Page migration test for admin/agents.
 *
 * Verifies the data contract between page and action.
 * The agents page uses health metrics and agent detail schemas.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("admin agents page — data contract", () => {
  it("agentHealthMetricSchema validates a valid metric", () => {
    const r = agentHealthMetricSchema.safeParse({
      label: "Heartbeat",
      value: "5m ago",
      note: "Healthy",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.label).toBe("Heartbeat");
      expect(r.data.value).toBe("5m ago");
    }
  });

  it("agentHealthMetricSchema rejects missing label", () => {
    const r = agentHealthMetricSchema.safeParse({ value: "5m ago", note: "" });
    expect(r.success).toBe(false);
  });

  it("agentHealthDataSchema validates an agent health entry", () => {
    const r = agentHealthDataSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Coder",
      status: "running",
      role: "Software Engineer",
      heartbeatMetrics: [
        { label: "Heartbeat", value: "5m ago", note: "Healthy" },
      ],
      lastHeartbeat: "2026-06-14T08:00:00Z",
      issuesDone: 42,
      issuesInProgress: 2,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Coder");
      expect(r.data.issuesDone).toBe(42);
    }
  });

  it("agentsHealthDataSchema validates a collection of agents", () => {
    const r = agentsHealthDataSchema.safeParse({
      agents: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "Coder",
          status: "running",
          role: "Software Engineer",
          heartbeatMetrics: [],
          lastHeartbeat: null,
          issuesDone: 10,
          issuesInProgress: 1,
        },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.agents.length).toBe(1);
  });

  it("getAgentByIdSchema validates a valid UUID", () => {
    const r = getAgentByIdSchema.safeParse({
      agentId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("getAgentByIdSchema rejects non-UUID", () => {
    const r = getAgentByIdSchema.safeParse({ agentId: "not-a-uuid" });
    expect(r.success).toBe(false);
  });
});
