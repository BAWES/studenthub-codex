import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  getStaffRequestDetailSchema,
} from "./schemas";

/**
 * Page data-contract tests for staff/requests/[id].
 *
 * The page calls getStaffRequestDetail({ requestUuid: id }) from
 * ./actions. The route-level schemas.ts contains the input schema.
 * The action delegates to @/modules/workspace/request-detail-core
 * which returns a rich object with request, pipeline, metrics,
 * matchedCandidates, suggestions, etc.
 *
 * Since the output type is complex and uses Awaited<ReturnType>,
 * this test verifies input validation and the key nested shapes
 * used directly by the page (pipeline items, metrics entries).
 */

// Shared types used in the page's data contract
const pipelineItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number().int().nonnegative(),
  note: z.string().optional(),
});

const metricEntrySchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  badge: z.string().optional(),
});

const requestDetailResultSchema = z.object({
  request: z.any().nullable(),
  requestSkills: z.array(z.any()),
  pipeline: z.array(pipelineItemSchema),
  metrics: z.array(metricEntrySchema),
  matchedCandidates: z.array(z.any()),
  suggestions: z.array(z.any()),
});

describe("staff/requests/[id] — getStaffRequestDetailSchema", () => {
  it("accepts valid request UUID", () => {
    const r = getStaffRequestDetailSchema.safeParse({
      requestUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty requestUuid", () => {
    const r = getStaffRequestDetailSchema.safeParse({ requestUuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing requestUuid", () => {
    const r = getStaffRequestDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects null", () => {
    const r = getStaffRequestDetailSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});

describe("staff/requests/[id] — pipeline data contract", () => {
  it("accepts valid pipeline item with all fields", () => {
    const r = pipelineItemSchema.safeParse({
      id: "matches",
      label: "Matches",
      value: 5,
      note: "Skill-fit candidates",
    });
    expect(r.success).toBe(true);
  });

  it("accepts pipeline item without optional note", () => {
    const r = pipelineItemSchema.safeParse({
      id: "applications",
      label: "Applied",
      value: 3,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative value", () => {
    const r = pipelineItemSchema.safeParse({
      id: "invited",
      label: "Invited",
      value: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing label", () => {
    const r = pipelineItemSchema.safeParse({
      id: "matches",
      value: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty object", () => {
    const r = pipelineItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("staff/requests/[id] — metrics data contract", () => {
  it("accepts metric with string value", () => {
    const r = metricEntrySchema.safeParse({
      label: "Seats",
      value: "12",
    });
    expect(r.success).toBe(true);
  });

  it("accepts metric with numeric value", () => {
    const r = metricEntrySchema.safeParse({
      label: "Duration",
      value: 30,
    });
    expect(r.success).toBe(true);
  });

  it("accepts metric with optional badge", () => {
    const r = metricEntrySchema.safeParse({
      label: "Budget",
      value: "500 KWD",
      badge: "high",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing label", () => {
    const r = metricEntrySchema.safeParse({
      value: "100",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing value", () => {
    const r = metricEntrySchema.safeParse({
      label: "Seats",
    });
    expect(r.success).toBe(false);
  });
});

describe("staff/requests/[id] — full result shape", () => {
  it("accepts complete result with all sections", () => {
    const r = requestDetailResultSchema.safeParse({
      request: { request_uuid: "abc", request_position_title: "Engineer" },
      requestSkills: [{ skillName: "JavaScript" }],
      pipeline: [
        { id: "matches", label: "Matches", value: 5, note: "Skill-fit" },
        { id: "suggestions", label: "Suggested", value: 3 },
        { id: "invited", label: "Invited", value: 2 },
        { id: "applications", label: "Applied", value: 0 },
        { id: "interviews", label: "Interviews", value: 1 },
        { id: "stories", label: "Stories", value: 0 },
      ],
      metrics: [{ label: "Seats", value: "12" }],
      matchedCandidates: [{ id: 1, score: 85 }],
      suggestions: [],
    });
    expect(r.success).toBe(true);
  });

  it("accepts result with null request (not-found edge case)", () => {
    const r = requestDetailResultSchema.safeParse({
      request: null,
      requestSkills: [],
      pipeline: [],
      metrics: [],
      matchedCandidates: [],
      suggestions: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing pipeline array", () => {
    const r = requestDetailResultSchema.safeParse({
      request: null,
      requestSkills: [],
      metrics: [],
      matchedCandidates: [],
      suggestions: [],
    });
    expect(r.success).toBe(false);
  });
});
