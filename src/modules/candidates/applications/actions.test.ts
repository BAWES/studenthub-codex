import { describe, it, expect } from "vitest";
import {
  listApplicationsSchema,
  getApplicationSchema,
  createApplicationSchema,
  updateApplicationStatusSchema,
  deleteApplicationSchema,
  applicationItemSchema,
  listApplicationsResultSchema,
  applicationActionResultSchema,
} from "./schemas";

describe("listApplicationsSchema", () => {
  it("accepts candidateId and page", () => {
    const r = listApplicationsSchema.safeParse({ candidateId: 1, page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(1);
  });

  it("accepts status filter", () => {
    const r = listApplicationsSchema.safeParse({ candidateId: 1, status: "pending" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe("pending");
  });

  it("rejects negative candidateId", () => {
    expect(listApplicationsSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(listApplicationsSchema.safeParse({ candidateId: 1, limit: 999 }).success).toBe(false);
  });
});

describe("getApplicationSchema", () => {
  it("accepts valid applicationId", () => {
    expect(getApplicationSchema.safeParse({ applicationId: 5 }).success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    expect(getApplicationSchema.safeParse({}).success).toBe(false);
  });
});

describe("createApplicationSchema", () => {
  it("accepts valid input", () => {
    const r = createApplicationSchema.safeParse({ candidateId: 1, jobListingId: 5 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.jobListingId).toBe(5);
  });
});

describe("updateApplicationStatusSchema", () => {
  it("accepts valid status update", () => {
    const r = updateApplicationStatusSchema.safeParse({ applicationId: 1, status: "hired" });
    expect(r.success).toBe(true);
  });

  it("rejects invalid status value", () => {
    expect(updateApplicationStatusSchema.safeParse({ applicationId: 1, status: "invalid" }).success).toBe(false);
  });
});

describe("deleteApplicationSchema", () => {
  it("accepts valid applicationId", () => {
    expect(deleteApplicationSchema.safeParse({ applicationId: 5 }).success).toBe(true);
  });
});

describe("applicationItemSchema", () => {
  it("accepts valid item", () => {
    const r = applicationItemSchema.safeParse({
      applicationId: 1,
      jobListingId: 5,
      jobTitle: "Software Engineer",
      employerName: "GCC Energies",
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    expect(applicationItemSchema.safeParse({ jobTitle: "Test" }).success).toBe(false);
  });
});

describe("listApplicationsResultSchema", () => {
  it("accepts valid result", () => {
    expect(listApplicationsResultSchema.safeParse({ items: [], total: 0, page: 1, pageSize: 20 }).success).toBe(true);
  });
});

describe("applicationActionResultSchema", () => {
  it("accepts success", () => {
    expect(applicationActionResultSchema.safeParse({ success: true, applicationId: 1 }).success).toBe(true);
  });

  it("accepts error", () => {
    expect(applicationActionResultSchema.safeParse({ success: false, error: "Failed" }).success).toBe(true);
  });
});
