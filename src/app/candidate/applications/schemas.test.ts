import { describe, it, expect } from "vitest";
import {
  listApplicationsSchema,
  applicationItemSchema,
  listApplicationsResultSchema,
  withdrawApplicationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/applications
// ---------------------------------------------------------------------------

describe("listApplicationsSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listApplicationsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listApplicationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listApplicationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listApplicationsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("coerces string page and limit", () => {
    const r = listApplicationsSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("accepts optional status filter", () => {
    const r = listApplicationsSchema.safeParse({ status: "approved" });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("applicationItemSchema", () => {
  const validItem = {
    applicationId: 1,
    jobListingId: 100,
    jobTitle: "Software Engineer",
    employerName: "Tech Corp",
    status: "submitted",
    coverLetter: null,
    createdAt: null,
    updatedAt: null,
  };

  it("accepts valid application item", () => {
    expect(applicationItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts non-null cover letter", () => {
    expect(
      applicationItemSchema.safeParse({
        ...validItem,
        coverLetter: "I am interested in this position",
      }).success,
    ).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = validItem;
    expect(applicationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing jobTitle", () => {
    const { jobTitle: _, ...rest } = validItem;
    expect(applicationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for applicationId", () => {
    expect(
      applicationItemSchema.safeParse({ ...validItem, applicationId: "abc" })
        .success,
    ).toBe(false);
  });
});

describe("listApplicationsResultSchema", () => {
  const validResult = {
    applications: [
      {
        applicationId: 1,
        jobListingId: 100,
        jobTitle: "Engineer",
        employerName: "Corp",
        status: "submitted",
        coverLetter: null,
        createdAt: null,
        updatedAt: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  };

  it("accepts valid result", () => {
    expect(listApplicationsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty applications array", () => {
    expect(
      listApplicationsResultSchema.safeParse({
        ...validResult,
        applications: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing applications", () => {
    const { applications: _, ...rest } = validResult;
    expect(listApplicationsResultSchema.safeParse(rest).success).toBe(false);
  });
});

describe("withdrawApplicationResultSchema", () => {
  it("accepts success result", () => {
    expect(
      withdrawApplicationResultSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      withdrawApplicationResultSchema.safeParse({
        success: false,
        error: "Cannot withdraw",
      }).success,
    ).toBe(true);
  });

  it("rejects missing success field", () => {
    expect(withdrawApplicationResultSchema.safeParse({}).success).toBe(false);
  });
});
