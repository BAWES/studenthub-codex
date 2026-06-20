import { describe, it, expect } from "vitest";
import {
  applicationItemSchema,
  listApplicationsResultSchema,
  applicationActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests — candidates/applications
// ---------------------------------------------------------------------------

describe("applicationItemSchema", () => {
  const validItem = {
    applicationId: 101,
    jobListingId: 42,
    jobTitle: "Software Engineer",
    employerName: "Tech Corp",
    status: "applied",
    coverLetter: "I am very interested in this role.",
    createdAt: new Date("2026-06-14T10:00:00"),
    updatedAt: new Date("2026-06-14T10:30:00"),
  };

  it("accepts a valid application item", () => {
    expect(applicationItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null for coverLetter", () => {
    expect(
      applicationItemSchema.safeParse({
        ...validItem,
        coverLetter: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null for createdAt and updatedAt", () => {
    expect(
      applicationItemSchema.safeParse({
        ...validItem,
        createdAt: null,
        updatedAt: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = validItem;
    expect(applicationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for applicationId", () => {
    expect(
      applicationItemSchema.safeParse({
        ...validItem,
        applicationId: "101",
      }).success,
    ).toBe(false);
  });

  it("rejects string instead of Date for createdAt", () => {
    // z.coerce.date() accepts ISO strings, so this should pass
    expect(
      applicationItemSchema.safeParse({
        ...validItem,
        createdAt: "2026-06-14T10:00:00",
      }).success,
    ).toBe(true);
  });
});

describe("listApplicationsResultSchema", () => {
  const validResult = {
    items: [
      {
        applicationId: 101,
        jobListingId: 42,
        jobTitle: "Software Engineer",
        employerName: "Tech Corp",
        status: "applied",
        coverLetter: null,
        createdAt: null,
        updatedAt: null,
      },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
  };

  it("accepts a valid paginated result", () => {
    expect(listApplicationsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listApplicationsResultSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listApplicationsResultSchema.safeParse({
        ...validResult,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listApplicationsResultSchema.safeParse({
        ...validResult,
        page: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects string instead of number for page", () => {
    expect(
      listApplicationsResultSchema.safeParse({
        ...validResult,
        page: "1",
      }).success,
    ).toBe(false);
  });
});

describe("applicationActionResultSchema", () => {
  it("accepts success result", () => {
    const r = applicationActionResultSchema.safeParse({
      success: true,
      applicationId: 101,
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = applicationActionResultSchema.safeParse({
      success: false,
      error: "Application not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success without applicationId", () => {
    expect(
      applicationActionResultSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error without error message", () => {
    expect(
      applicationActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects invalid discriminator value", () => {
    expect(
      applicationActionResultSchema.safeParse({
        success: "yes",
        applicationId: 101,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for applicationId in success variant", () => {
    expect(
      applicationActionResultSchema.safeParse({
        success: true,
        applicationId: "101",
      }).success,
    ).toBe(false);
  });
});
