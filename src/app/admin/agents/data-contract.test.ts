import { describe, it, expect } from "vitest";
import { agentHealthDataSchema, agentsHealthDataSchema, agentHealthMetricSchema } from "./schemas";

describe("admin agents — data contracts", () => {
  it("agentHealthMetricSchema validates a valid metric", () => {
    const r = agentHealthMetricSchema.safeParse({
      label: "Success rate",
      value: "85%",
      note: "Last 24 hours",
    });
    expect(r.success).toBe(true);
  });

  it("agentHealthDataSchema validates an agent entry", () => {
    const r = agentHealthDataSchema.safeParse({
      id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95",
      name: "Coder",
      status: "running",
      role: "Software Engineer",
      heartbeatMetrics: [
        { label: "Success rate", value: "85%", note: "Last 24 hours" },
      ],
      lastHeartbeat: "2026-06-12T10:00:00Z",
      issuesDone: 42,
      issuesInProgress: 2,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Coder");
      expect(r.data.heartbeatMetrics.length).toBe(1);
    }
  });

  it("agentsHealthDataSchema validates the full response", () => {
    const r = agentsHealthDataSchema.safeParse({
      agents: [
        {
          id: "eaa3c21b-a27e-40a5-a5bb-d392e5f53d95",
          name: "Coder",
          status: "running",
          role: "Software Engineer",
          heartbeatMetrics: [],
          lastHeartbeat: "2026-06-12T10:00:00Z",
          issuesDone: 42,
          issuesInProgress: 2,
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty agents array", () => {
    const r = agentsHealthDataSchema.safeParse({ agents: [] });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.agents.length).toBe(0);
  });
});
