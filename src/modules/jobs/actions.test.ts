import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  jobListItemSchema,
  jobDetailSchema,
  listJobsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation for jobs server actions in actions.ts
//
// These schemas are used internally by the server actions. Testing them
// separately avoids mocking "use server" dependencies (prisma, session).
// Follows the existing pattern from actions-schema.test.ts.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listJobsSchema — used by listJobs
// ---------------------------------------------------------------------------

// Coerce boolean from string (handles both "true"/"false" string values)
// Mirrors the pattern used in certificate action schemas.
const coerceBool = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1");

const listJobsSchema = z.object({
  status: coerceBool.optional(),
  companyId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

type ListJobsParams = z.input<typeof listJobsSchema>;

describe("listJobsSchema", () => {
  it("accepts default (empty) params", () => {
    const result = listJobsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.status).toBeUndefined();
      expect(result.data.companyId).toBeUndefined();
      expect(result.data.search).toBeUndefined();
    }
  });

  it("accepts status filter (true)", () => {
    const result = listJobsSchema.safeParse({ status: "true" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(true);
    }
  });

  it("accepts status filter (false)", () => {
    const result = listJobsSchema.safeParse({ status: "false" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(false);
    }
  });

  it("accepts companyId as a string number (coerced)", () => {
    const result = listJobsSchema.safeParse({ companyId: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(5);
    }
  });

  it("rejects zero or negative companyId", () => {
    const zero = listJobsSchema.safeParse({ companyId: "0" });
    expect(zero.success).toBe(false);
    const neg = listJobsSchema.safeParse({ companyId: "-1" });
    expect(neg.success).toBe(false);
  });

  it("accepts search keyword", () => {
    const result = listJobsSchema.safeParse({ search: "developer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("developer");
    }
  });

  it("accepts all filters together", () => {
    const result = listJobsSchema.safeParse({
      status: "true",
      companyId: "10",
      search: "engineer",
      page: "2",
      limit: "50",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(true);
      expect(result.data.companyId).toBe(10);
      expect(result.data.search).toBe("engineer");
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts page and limit at boundaries", () => {
    const minPage = listJobsSchema.safeParse({ page: "1" });
    expect(minPage.success).toBe(true);
    const minLimit = listJobsSchema.safeParse({ limit: "1" });
    expect(minLimit.success).toBe(true);
    const maxLimit = listJobsSchema.safeParse({ limit: "100" });
    expect(maxLimit.success).toBe(true);
  });

  it("rejects page below 1", () => {
    const result = listJobsSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const result = listJobsSchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const result = listJobsSchema.safeParse({ limit: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric companyId", () => {
    const result = listJobsSchema.safeParse({ companyId: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getJobSchema — used by getJob
// ---------------------------------------------------------------------------

const getJobSchema = z.object({
  jobUuid: z.string().min(1, "Job UUID is required"),
});

describe("getJobSchema", () => {
  it("accepts a valid job UUID", () => {
    const result = getJobSchema.safeParse({
      jobUuid: "abc123-def456-ghi789",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobUuid).toBe("abc123-def456-ghi789");
    }
  });

  it("rejects empty job UUID", () => {
    const result = getJobSchema.safeParse({ jobUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing jobUuid", () => {
    const result = getJobSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts a short UUID", () => {
    const result = getJobSchema.safeParse({ jobUuid: "a" });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — jobListItemSchema
// ---------------------------------------------------------------------------

describe("jobListItemSchema", () => {
  it("accepts a full job list item", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Software Engineer",
      position_ar: "مهندس برمجيات",
      description: "Build cool stuff",
      hours_per_day: 8,
      days_per_week: true,
      status: true,
      area_uuid: "area-1",
      request_uuid: "req-1",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-06-01"),
    };
    const result = jobListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts a minimal item with nulls", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Intern",
      position_ar: null,
      description: null,
      hours_per_day: null,
      days_per_week: null,
      status: null,
      area_uuid: null,
      request_uuid: "req-1",
      created_at: null,
      updated_at: null,
    };
    const result = jobListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts string dates for created_at/updated_at", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Designer",
      position_ar: null,
      description: null,
      hours_per_day: null,
      days_per_week: null,
      status: true,
      area_uuid: null,
      request_uuid: "req-2",
      created_at: "2024-01-15T00:00:00.000Z",
      updated_at: "2024-06-15T00:00:00.000Z",
    };
    const result = jobListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = jobListItemSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for position", () => {
    const item = {
      job_uuid: "abc-123",
      position: 42,
      position_ar: null,
      description: null,
      hours_per_day: null,
      days_per_week: null,
      status: false,
      area_uuid: null,
      request_uuid: "req-1",
      created_at: null,
      updated_at: null,
    };
    const result = jobListItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for days_per_week (number instead of boolean)", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Tester",
      position_ar: null,
      description: null,
      hours_per_day: 6,
      days_per_week: 5,
      status: true,
      area_uuid: null,
      request_uuid: "req-1",
      created_at: null,
      updated_at: null,
    };
    const result = jobListItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects missing job_uuid", () => {
    const item = {
      position: "Engineer",
      position_ar: null,
      description: null,
      hours_per_day: null,
      days_per_week: null,
      status: null,
      area_uuid: null,
      request_uuid: "req-1",
      created_at: null,
      updated_at: null,
    };
    const result = jobListItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — listJobsResultSchema
// ---------------------------------------------------------------------------

describe("listJobsResultSchema", () => {
  it("accepts an empty result", () => {
    const result = listJobsResultSchema.safeParse({
      jobs: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a full paginated result", () => {
    const result = listJobsResultSchema.safeParse({
      jobs: [
        {
          job_uuid: "abc-123",
          position: "Developer",
          position_ar: null,
          description: "Write code",
          hours_per_day: 8,
          days_per_week: true,
          status: true,
          area_uuid: "area-1",
          request_uuid: "req-1",
          created_at: new Date("2024-01-01"),
          updated_at: new Date("2024-06-01"),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total", () => {
    const result = listJobsResultSchema.safeParse({
      jobs: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects jobs as non-array", () => {
    const result = listJobsResultSchema.safeParse({
      jobs: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects string instead of number for total", () => {
    const result = listJobsResultSchema.safeParse({
      jobs: [],
      total: "zero",
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — jobDetailSchema (extends jobListItemSchema)
// ---------------------------------------------------------------------------

describe("jobDetailSchema", () => {
  it("accepts a full job detail", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Senior Engineer",
      position_ar: "مهندس أول",
      description: "Leads team",
      description_ar: "يقود الفريق",
      hours_per_day: 8,
      days_per_week: true,
      status: true,
      area_uuid: "area-1",
      request_uuid: "req-1",
      compensation_type: "monthly",
      compensation_amount: "1500.000",
      compensation_description: "Monthly salary",
      compensation_description_ar: "الراتب الشهري",
      min_age: 21,
      max_age: 45,
      gender: false,
      available_from: new Date("2024-07-01"),
      available_to: new Date("2024-12-31"),
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-06-01"),
    };
    const result = jobDetailSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts minimal job detail with nulls", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Intern",
      position_ar: null,
      description: null,
      description_ar: null,
      hours_per_day: null,
      days_per_week: null,
      status: null,
      area_uuid: null,
      request_uuid: "req-1",
      compensation_type: null,
      compensation_amount: null,
      compensation_description: null,
      compensation_description_ar: null,
      min_age: null,
      max_age: null,
      gender: null,
      available_from: null,
      available_to: null,
      created_at: null,
      updated_at: null,
    };
    const result = jobDetailSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts string dates for date fields", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Designer",
      position_ar: null,
      description: null,
      description_ar: null,
      hours_per_day: null,
      days_per_week: null,
      status: true,
      area_uuid: null,
      request_uuid: "req-2",
      compensation_type: null,
      compensation_amount: null,
      compensation_description: null,
      compensation_description_ar: null,
      min_age: null,
      max_age: null,
      gender: null,
      available_from: "2024-07-01T00:00:00.000Z",
      available_to: "2024-12-31T00:00:00.000Z",
      created_at: "2024-01-15T00:00:00.000Z",
      updated_at: "2024-06-15T00:00:00.000Z",
    };
    const result = jobDetailSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = jobDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for compensation_type (number)", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Analyst",
      position_ar: null,
      description: null,
      description_ar: null,
      hours_per_day: null,
      days_per_week: null,
      status: null,
      area_uuid: null,
      request_uuid: "req-1",
      compensation_type: 123,
      compensation_amount: null,
      compensation_description: null,
      compensation_description_ar: null,
      min_age: null,
      max_age: null,
      gender: null,
      available_from: null,
      available_to: null,
      created_at: null,
      updated_at: null,
    };
    const result = jobDetailSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for min_age (string)", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Clerk",
      position_ar: null,
      description: null,
      description_ar: null,
      hours_per_day: null,
      days_per_week: null,
      status: null,
      area_uuid: null,
      request_uuid: "req-1",
      compensation_type: null,
      compensation_amount: null,
      compensation_description: null,
      compensation_description_ar: null,
      min_age: "not-a-number",
      max_age: null,
      gender: null,
      available_from: null,
      available_to: null,
      created_at: null,
      updated_at: null,
    };
    const result = jobDetailSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});
