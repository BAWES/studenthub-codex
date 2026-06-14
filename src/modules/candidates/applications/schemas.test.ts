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

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("listApplicationsSchema", () => {
  it("accepts candidateId only", () => {
    const r = listApplicationsSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(1);
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts all fields", () => {
    const r = listApplicationsSchema.safeParse({
      candidateId: 5,
      page: 2,
      limit: 50,
      status: "pending",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("pending");
    }
  });

  it("rejects negative candidateId", () => {
    expect(listApplicationsSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(listApplicationsSchema.safeParse({ candidateId: 1, limit: 999 }).success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const r = listApplicationsSchema.safeParse({ candidateId: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(3);
  });
});

describe("getApplicationSchema", () => {
  it("accepts valid applicationId", () => {
    expect(getApplicationSchema.safeParse({ applicationId: 5 }).success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    expect(getApplicationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative applicationId", () => {
    expect(getApplicationSchema.safeParse({ applicationId: -1 }).success).toBe(false);
  });
});

describe("createApplicationSchema", () => {
  it("accepts valid input with required fields", () => {
    const r = createApplicationSchema.safeParse({ candidateId: 1, jobListingId: 5 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(5);
      expect(r.data.coverLetter).toBe("");
    }
  });

  it("accepts optional coverLetter", () => {
    const r = createApplicationSchema.safeParse({
      candidateId: 1,
      jobListingId: 5,
      coverLetter: "I am interested in this role.",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.coverLetter).toBe("I am interested in this role.");
  });

  it("rejects missing candidateId", () => {
    expect(createApplicationSchema.safeParse({ jobListingId: 5 }).success).toBe(false);
  });

  it("rejects missing jobListingId", () => {
    expect(createApplicationSchema.safeParse({ candidateId: 1 }).success).toBe(false);
  });
});

describe("updateApplicationStatusSchema", () => {
  it("accepts valid status update", () => {
    const r = updateApplicationStatusSchema.safeParse({
      applicationId: 1,
      status: "hired",
    });
    expect(r.success).toBe(true);
  });

  it("accepts all valid status values", () => {
    const statuses = ["applied", "pending", "shortlisted", "interviewed", "offered", "hired", "rejected", "withdrawn"];
    for (const status of statuses) {
      expect(
        updateApplicationStatusSchema.safeParse({ applicationId: 1, status }).success,
      ).toBe(true);
    }
  });

  it("rejects invalid status value", () => {
    expect(
      updateApplicationStatusSchema.safeParse({ applicationId: 1, status: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects missing status", () => {
    expect(updateApplicationStatusSchema.safeParse({ applicationId: 1 }).success).toBe(false);
  });
});

describe("deleteApplicationSchema", () => {
  it("accepts valid applicationId", () => {
    expect(deleteApplicationSchema.safeParse({ applicationId: 5 }).success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    expect(deleteApplicationSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("applicationItemSchema", () => {
  const valid = {
    applicationId: 1,
    jobListingId: 5,
    jobTitle: "Software Engineer",
    employerName: "GCC Energies",
    status: "applied",
    coverLetter: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: null,
  };

  it("accepts a valid application item", () => {
    expect(applicationItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable coverLetter", () => {
    expect(applicationItemSchema.safeParse({ ...valid, coverLetter: null }).success).toBe(true);
  });

  it("accepts nullable dates", () => {
    expect(applicationItemSchema.safeParse({ ...valid, createdAt: null, updatedAt: null }).success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = valid;
    expect(applicationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing jobTitle", () => {
    const { jobTitle: _, ...rest } = valid;
    expect(applicationItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listApplicationsResultSchema", () => {
  it("accepts empty list", () => {
    expect(
      listApplicationsResultSchema.safeParse({ items: [], total: 0, page: 1, pageSize: 20 }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listApplicationsResultSchema.safeParse({ items: [], total: -1, page: 1, pageSize: 20 }).success,
    ).toBe(false);
  });

  it("rejects missing items", () => {
    expect(listApplicationsResultSchema.safeParse({ total: 0, page: 1, pageSize: 20 }).success).toBe(false);
  });
});

describe("applicationActionResultSchema", () => {
  it("accepts success with applicationId", () => {
    expect(
      applicationActionResultSchema.safeParse({ success: true, applicationId: 1 }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      applicationActionResultSchema.safeParse({ success: false, error: "Application not found." }).success,
    ).toBe(true);
  });

  it("rejects success without applicationId", () => {
    expect(applicationActionResultSchema.safeParse({ success: true }).success).toBe(false);
  });

  it("rejects error without error message", () => {
    expect(applicationActionResultSchema.safeParse({ success: false }).success).toBe(false);
  });
});
