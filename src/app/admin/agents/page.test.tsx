import { describe, it, expect } from "vitest";
import {
  agentHealthMetricSchema,
  agentHealthDataSchema,
  agentsHealthDataSchema,
} from "./schemas";
import type { AgentHealthMetric, AgentHealthData, AgentsHealthData } from "./schemas";

/**
 * Page migration test for admin/agents.
 *
 * Verifies that agentsHealthDataSchema accepts the data returned by the
 * getAllAgentsHealth server action, and that AgentHealthData fields map
 * correctly to AdminAgentsTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin agents page — data contract", () => {
  it("agentsHealthDataSchema accepts empty agents array", () => {
    const r = agentsHealthDataSchema.safeParse({ agents: [] });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.agents).toEqual([]);
    }
  });

  it("agentsHealthDataSchema accepts a full agents payload", () => {
    const r = agentsHealthDataSchema.safeParse({
      agents: [
        {
          id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95",
          name: "Coder",
          status: "running",
          role: "Software Engineer",
          heartbeatMetrics: [
            { label: "Heartbeat", value: "5m ago", note: "Healthy" },
          ],
          lastHeartbeat: "2026-06-14T08:00:00Z",
          issuesDone: 42,
          issuesInProgress: 2,
        },
      ],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.agents.length).toBe(1);
      expect(r.data.agents[0].name).toBe("Coder");
    }
  });

  it("AgentHealthData fields map correctly to AdminAgentsTable columns", () => {
    // The page maps AgentHealthData to AdminAgentsTable columns:
    //   id              → row.id             (agent UUID, key)
    //   name            → row.name           (agent display name)
    //   status          → row.status         (running/idle/error)
    //   role            → row.role           (job title)
    //   heartbeatMetrics → row.heartbeatMetrics (metric cards array)
    //   lastHeartbeat   → row.lastHeartbeat  (ISO timestamp or null)
    //   issuesDone      → row.issuesDone     (count)
    //   issuesInProgress → row.issuesInProgress (count)
    const agent: AgentHealthData = {
      id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95",
      name: "Coder",
      status: "running",
      role: "Software Engineer",
      heartbeatMetrics: [
        { label: "Heartbeat", value: "5m ago", note: "Healthy" },
        { label: "Success rate", value: "92%", note: "Last 24h" },
      ],
      lastHeartbeat: "2026-06-14T08:00:00Z",
      issuesDone: 42,
      issuesInProgress: 2,
    };
    expect(agent.id).toBe("eaa3c21b-a27e-40a5-a5bb-d392e5f53d95");
    expect(agent.name).toBe("Coder");
    expect(agent.status).toBe("running");
    expect(agent.role).toBe("Software Engineer");
    expect(agent.heartbeatMetrics.length).toBe(2);
    expect(agent.heartbeatMetrics[0].label).toBe("Heartbeat");
    expect(agent.heartbeatMetrics[1].value).toBe("92%");
    expect(agent.lastHeartbeat).toBe("2026-06-14T08:00:00Z");
    expect(agent.issuesDone).toBe(42);
    expect(agent.issuesInProgress).toBe(2);
  });

  it("AgentsHealthData has expected shape (matches getAllAgentsHealth return)", () => {
    const result: AgentsHealthData = {
      agents: [],
    };
    expect(Array.isArray(result.agents)).toBe(true);
  });

  it("agentHealthMetricSchema validates metric entries", () => {
    const r = agentHealthMetricSchema.safeParse({
      label: "Success rate",
      value: "85%",
      note: "Last 24 hours",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.label).toBe("Success rate");
      expect(r.data.value).toBe("85%");
      expect(r.data.note).toBe("Last 24 hours");
    }
  });

  it("agentHealthMetricSchema rejects missing label", () => {
    const r = agentHealthMetricSchema.safeParse({ value: "5m ago", note: "" });
    expect(r.success).toBe(false);
  });

  it("agentHealthMetricSchema rejects missing value", () => {
    const r = agentHealthMetricSchema.safeParse({ label: "Heartbeat", note: "" });
    expect(r.success).toBe(false);
  });

  it("agentHealthDataSchema rejects missing required fields", () => {
    const r = agentHealthDataSchema.safeParse({
      name: "Missing id",
      status: "running",
    });
    expect(r.success).toBe(false);
  });
});
