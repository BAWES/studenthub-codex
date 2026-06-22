import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listJobsSchema,
  jobItemSchema,
  listJobsResultSchema,
} from "./schemas";
import type { JobItem, ListJobsResult } from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRevalidatePath,
  mockFindMany,
  mockCount,
  mockFindUnique,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindUnique: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    job: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
    },
  },
}));

import { listJobs } from "./actions";

// ---------------------------------------------------------------------------
// Input schema validation
// ---------------------------------------------------------------------------

describe("listJobsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listJobsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listJobsSchema.safeParse({ page: 2, limit: 25 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });

  it("rejects limit over 200", () => {
    const result = listJobsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listJobsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listJobsSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("jobItemSchema", () => {
  it("accepts a valid job item", () => {
    const item: JobItem = {
      job_uuid: "job-123",
      story_uuid: "story-456",
      request_uuid: "req-789",
      area_uuid: null,
      position: "Software Engineer",
      position_ar: null,
      hours_per_day: null,
      days_per_week: null,
      compensation_type: null,
      compensation_amount: null,
      min_age: null,
      max_age: null,
      gender: null,
      available_from: null,
      available_to: null,
      status: null,
      created_at: new Date("2026-01-01"),
      updated_at: null,
    };
    const result = jobItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const item: JobItem = {
      job_uuid: "job-123",
      story_uuid: "story-456",
      request_uuid: "req-789",
      area_uuid: null,
      position: "Software Engineer",
      position_ar: null,
      hours_per_day: null,
      days_per_week: null,
      compensation_type: null,
      compensation_amount: null,
      min_age: null,
      max_age: null,
      gender: null,
      available_from: null,
      available_to: null,
      status: null,
      created_at: null,
      updated_at: null,
    };
    const result = jobItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing job_uuid", () => {
    const result = jobItemSchema.safeParse({
      story_uuid: "story-456",
      request_uuid: "req-789",
      position: "Engineer",
    });
    expect(result.success).toBe(false);
  });
});

describe("listJobsResultSchema", () => {
  it("accepts a valid list result with items", () => {
    const result: ListJobsResult = {
      jobs: [
        {
          job_uuid: "job-123",
          story_uuid: "story-456",
          request_uuid: "req-789",
          area_uuid: null,
          position: "Software Engineer",
          position_ar: null,
          hours_per_day: null,
          days_per_week: null,
          compensation_type: null,
          compensation_amount: null,
          min_age: null,
          max_age: null,
          gender: null,
          available_from: null,
          available_to: null,
          status: null,
          created_at: new Date("2026-01-01"),
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
    const parsed = listJobsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts empty jobs array", () => {
    const result: ListJobsResult = {
      jobs: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listJobsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-array jobs", () => {
    const result = {
      jobs: "not-an-array",
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listJobsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — mocked DB
// ---------------------------------------------------------------------------

describe("listJobs action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      {
        job_uuid: "job-123",
        story_uuid: "story-456",
        request_uuid: "req-789",
        area_uuid: null,
        position: "Software Engineer",
        position_ar: null,
        hours_per_day: null,
        days_per_week: null,
        compensation_type: null,
        compensation_amount: null,
        min_age: null,
        max_age: null,
        gender: null,
        available_from: null,
        available_to: null,
        status: null,
        created_at: new Date("2026-01-01"),
        updated_at: null,
      },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listJobs({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { created_at: "desc" },
        skip: 0,
        take: 50,
      }),
    );
    expect(result.jobs).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(1);
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listJobs({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("returns empty result when no jobs exist", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listJobs({});

    expect(result.jobs).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listJobs({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});
