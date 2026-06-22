import { describe, it, expect } from "vitest";
import {
  listJobsSchema,
  getJobSchema,
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
} from "./schemas";
import {
  jobRowSchema,
  listJobsResultSchema,
  getJobResultSchema,
  createJobResultSchema,
  updateJobResultSchema,
  deleteJobResultSchema,
} from "@/modules/employer/jobs/schemas";

// ---------------------------------------------------------------------------
// listJobsSchema
// ---------------------------------------------------------------------------
describe("listJobsSchema", () => {
  it("accepts default (no params)", () => {
    const result = listJobsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts custom params", () => {
    const result = listJobsSchema.safeParse({ page: 2, limit: 10, status: "active", q: "engineer" });
    expect(result.success).toBe(true);
  });

  it("accepts string-coerced numbers via coerce", () => {
    const result = listJobsSchema.safeParse({ page: "3", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });

  it("rejects negative page", () => {
    expect(listJobsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(listJobsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero limit", () => {
    expect(listJobsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getJobSchema
// ---------------------------------------------------------------------------
describe("getJobSchema", () => {
  it("accepts valid jobId", () => {
    expect(getJobSchema.safeParse({ jobId: 42 }).success).toBe(true);
  });

  it("accepts string-coerced jobId", () => {
    const result = getJobSchema.safeParse({ jobId: "42" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.jobId).toBe(42);
  });

  it("rejects missing jobId", () => {
    expect(getJobSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero jobId", () => {
    expect(getJobSchema.safeParse({ jobId: 0 }).success).toBe(false);
  });

  it("rejects negative jobId", () => {
    expect(getJobSchema.safeParse({ jobId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createJobSchema
// ---------------------------------------------------------------------------
describe("createJobSchema", () => {
  const validInput = {
    employerId: 1,
    title: "Software Engineer",
    description: "Build great software",
  };

  it("accepts valid input with required fields only", () => {
    expect(createJobSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts all optional fields", () => {
    expect(
      createJobSchema.safeParse({
        ...validInput,
        requirements: "Strong coding skills",
        location: "Kuwait City",
        employmentType: "full-time",
        salaryRange: "1000-2000 KWD",
        status: "active",
      }).success,
    ).toBe(true);
  });

  it("rejects missing employerId", () => {
    const { employerId: _, ...rest } = validInput;
    expect(createJobSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(
      createJobSchema.safeParse({ ...validInput, title: "" }).success,
    ).toBe(false);
  });

  it("rejects title exceeding max length", () => {
    expect(
      createJobSchema.safeParse({ ...validInput, title: "A".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects empty description", () => {
    expect(
      createJobSchema.safeParse({ ...validInput, description: "" }).success,
    ).toBe(false);
  });

  it("rejects non-positive employerId", () => {
    expect(
      createJobSchema.safeParse({ ...validInput, employerId: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateJobSchema
// ---------------------------------------------------------------------------
describe("updateJobSchema", () => {
  const validInput = { jobId: 42 };

  it("accepts valid input with only required fields", () => {
    expect(updateJobSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts partial update with title only", () => {
    expect(
      updateJobSchema.safeParse({ ...validInput, title: "Updated Title" }).success,
    ).toBe(true);
  });

  it("accepts partial update with all fields", () => {
    expect(
      updateJobSchema.safeParse({
        ...validInput,
        title: "Updated",
        description: "New description",
        requirements: "New reqs",
        location: "New location",
        employmentType: "part-time",
        salaryRange: "500-1000 KWD",
        status: "inactive",
      }).success,
    ).toBe(true);
  });

  it("rejects missing jobId", () => {
    expect(updateJobSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty title when provided", () => {
    expect(
      updateJobSchema.safeParse({ jobId: 42, title: "" }).success,
    ).toBe(false);
  });

  it("rejects title exceeding max length", () => {
    expect(
      updateJobSchema.safeParse({ jobId: 42, title: "A".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects empty description when provided", () => {
    expect(
      updateJobSchema.safeParse({ jobId: 42, description: "" }).success,
    ).toBe(false);
  });

  it("rejects non-positive jobId", () => {
    expect(updateJobSchema.safeParse({ jobId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteJobSchema
// ---------------------------------------------------------------------------
describe("deleteJobSchema", () => {
  it("accepts valid jobId", () => {
    expect(deleteJobSchema.safeParse({ jobId: 42 }).success).toBe(true);
  });

  it("rejects missing jobId", () => {
    expect(deleteJobSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero jobId", () => {
    expect(deleteJobSchema.safeParse({ jobId: 0 }).success).toBe(false);
  });

  it("rejects negative jobId", () => {
    expect(deleteJobSchema.safeParse({ jobId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// jobRowSchema (output)
// ---------------------------------------------------------------------------
describe("jobRowSchema", () => {
  const now = new Date("2025-01-01T00:00:00Z");
  const validRow = {
    jobListingId: 1,
    employerId: 10,
    title: "Engineer",
    description: "Build stuff",
    requirements: null,
    location: null,
    employmentType: null,
    salaryRange: null,
    status: null,
    createdAt: now,
    updatedAt: now,
  };

  it("accepts valid row with nullable fields", () => {
    expect(jobRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts row with all fields populated", () => {
    expect(
      jobRowSchema.safeParse({
        ...validRow,
        requirements: "Strong skills",
        location: "Kuwait",
        employmentType: "full-time",
        salaryRange: "1000 KWD",
        status: "active",
      }).success,
    ).toBe(true);
  });

  it("rejects missing jobListingId", () => {
    const { jobListingId: _, ...rest } = validRow;
    expect(jobRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validRow;
    expect(jobRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-date createdAt", () => {
    expect(
      jobRowSchema.safeParse({ ...validRow, createdAt: "not-a-date" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listJobsResultSchema (output)
// ---------------------------------------------------------------------------
describe("listJobsResultSchema", () => {
  const now = new Date("2025-01-01T00:00:00Z");
  const validItem = {
    jobListingId: 1,
    employerId: 10,
    title: "Engineer",
    description: "Build stuff",
    requirements: null,
    location: null,
    employmentType: null,
    salaryRange: null,
    status: null,
    createdAt: now,
    updatedAt: now,
  };

  const validResult = {
    items: [validItem],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(listJobsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listJobsResultSchema.safeParse({ ...validResult, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listJobsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listJobsResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getJobResultSchema (output)
// ---------------------------------------------------------------------------
describe("getJobResultSchema", () => {
  const now = new Date("2025-01-01T00:00:00Z");
  const validRow = {
    jobListingId: 1,
    employerId: 10,
    title: "Engineer",
    description: "Build stuff",
    requirements: null,
    location: null,
    employmentType: null,
    salaryRange: null,
    status: null,
    createdAt: now,
    updatedAt: now,
  };

  it("accepts a valid job row", () => {
    expect(getJobResultSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null (job not found)", () => {
    expect(getJobResultSchema.safeParse(null).success).toBe(true);
  });

  it("rejects invalid object", () => {
    expect(getJobResultSchema.safeParse({ notAJobRow: true }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createJobResultSchema (output)
// ---------------------------------------------------------------------------
describe("createJobResultSchema", () => {
  it("accepts valid result", () => {
    expect(createJobResultSchema.safeParse({ success: true, jobListingId: 42 }).success).toBe(true);
  });

  it("rejects success: false", () => {
    expect(createJobResultSchema.safeParse({ success: false, jobListingId: 42 }).success).toBe(false);
  });

  it("rejects missing jobListingId", () => {
    expect(createJobResultSchema.safeParse({ success: true }).success).toBe(false);
  });

  it("rejects non-positive jobListingId", () => {
    expect(createJobResultSchema.safeParse({ success: true, jobListingId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateJobResultSchema (output)
// ---------------------------------------------------------------------------
describe("updateJobResultSchema", () => {
  it("accepts valid result", () => {
    expect(updateJobResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("rejects success: false", () => {
    expect(updateJobResultSchema.safeParse({ success: false }).success).toBe(false);
  });

  it("rejects missing success", () => {
    expect(updateJobResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteJobResultSchema (output)
// ---------------------------------------------------------------------------
describe("deleteJobResultSchema", () => {
  it("accepts valid result", () => {
    expect(deleteJobResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("rejects success: false", () => {
    expect(deleteJobResultSchema.safeParse({ success: false }).success).toBe(false);
  });

  it("rejects missing success", () => {
    expect(deleteJobResultSchema.safeParse({}).success).toBe(false);
  });
});
