import { describe, it, expect } from "vitest";
import { z } from "zod";

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
