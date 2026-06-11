import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { agentHealthMetricSchema, agentHealthDataSchema, agentsHealthDataSchema } from "./schemas";

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

import { getAllAgentsHealth } from "./actions";
